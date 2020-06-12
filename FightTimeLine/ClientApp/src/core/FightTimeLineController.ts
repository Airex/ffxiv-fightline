import { EventEmitter } from "@angular/core"
import * as _ from "lodash"
import { DataItem } from "vis-timeline"
import * as Gameserviceinterface from "../services/game.service-interface"
import { IColorsSettings, SettingsService } from "../services/SettingsService"
import { ITimelineContainer } from "../services"
import { AvailabilityController } from "./AvailabilityController"
import { CommandBag } from "./CommandBag"
import { CommandFactory } from "./CommandFactory"
import * as C from "./Commands"
import { IdGenerator } from "./Generators"
import * as ImportController from "./ImportController"
import * as Shared from "./Jobs/FFXIV/shared"
import * as M from "./Models"
import * as Parser from "./Parser"
import * as SerializeController from "./SerializeController"
import { Command, ICommandData, IUpdateOptions, UndoRedoController } from "./UndoRedo"
import { Utils } from "./Utils"
import { Holders } from "./Holders";
import { AbilityMap, AbilitySelectionMap, BossAttackMap, HeatmapMap, JobMap, AbilityUsageMap, BossTargetMap, BossDownTimeMap } from "./Maps/index";
import { IMoveable } from "./Holders/BaseHolder";


export class FightTimeLineController {
  data: M.IFightData = {};
  private readonly holders: Holders;
  private bossGroup: string = "boss";
  private commandStorage: UndoRedoController;
  private commandBag: CommandBag;
  private loading: boolean = false;
  private commandFactory = new CommandFactory(this.startDate);
  private copyContainer: any;
  private availabilityController: AvailabilityController;
  hasChanges = false;
  fraction: M.IFraction;
  filter = M.defaultFilter;
  view = M.defaultView;
  private tools: M.ITools = { downtime: false, stickyAttacks: false, copypaste: false };
  colorSettings: IColorsSettings;

  downtimeChanged = new EventEmitter<void>();
  commandExecuted = new EventEmitter<ICommandData>();

  constructor(
    private startDate: Date,
    private idgen: IdGenerator,
    mainTimeLine: ITimelineContainer,
    bossTimeLine: ITimelineContainer,
    private dialogCallBacks: IDialogs,
    private gameService: Gameserviceinterface.IGameService,
    private settingsService: SettingsService) {
    this.holders = new Holders(mainTimeLine, bossTimeLine);

    this.commandStorage = new UndoRedoController({
      idGen: this.idgen,
      holders: this.holders,
      jobRegistry: this.gameService.jobRegistry,
      update: this.update.bind(this),
      ogcdAttacksAsPoints: (ability: M.IAbility) => (ability.duration === 0 && ability.cooldown === 1) ||
        ((ability.abilityType & M.AbilityType.Damage) === M.AbilityType.Damage &&
          (ability.duration === 0 ? this.view.ogcdAsPoints : false)),
      verticalBossAttacks: () => this.view.verticalBossAttacks,
      isCompactView: () => this.view.compactView,
      highlightLoaded: () => this.view.highlightLoaded
    });
    this.commandStorage.changed.subscribe(() => {
      this.canRedoChanged.emit();
      this.canUndoChanged.emit();
      this.hasChanges = true;
    });
    this.commandStorage.commandExecuted.subscribe((data: ICommandData) => {
      this.commandExecuted.emit(data);
    });
    this.commandBag = new CommandBag(this.commandStorage);
    this.availabilityController = new AvailabilityController(
      this.view,
      this.holders,
      this.startDate,
      this.idgen
    );

    this.colorSettings = this.settingsService.load().colors;

    bossTimeLine.groups.add({ id: "boss", content: "BOSS", className: "boss" });
    mainTimeLine.groups.add({ id: 0, content: "", className: "" });
  }

  loadBoss(boss: M.IBoss): void {
    this.data.boss = boss;

    const loadData: SerializeController.IBossSerializeData = JSON.parse(boss.data);

    const commands: Command[] = [];

    this.holders.bossAttacks.getAll().forEach(it => {
      commands.push(new C.RemoveBossAttackCommand(it.id, false));
    });
    this.holders.bossDownTime.getAll().forEach(it => {
      commands.push(new C.RemoveDownTimeCommand(it.id));
    });

    commands.push(new C.AddBatchAttacksCommand(
      loadData.attacks.map(it => new C.AddBossAttackCommand(this.idgen.getNextId(M.EntryType.BossAttack),
        it.ability))));

    let index = 1;
    for (let d of loadData.downTimes) {
      const nextId = this.idgen.getNextId(M.EntryType.BossDownTime);
      commands.push(new C.AddDowntimeCommand(nextId,
        {
          start: Utils.getDateFromOffset(d.start, this.startDate),
          end: Utils.getDateFromOffset(d.end, this.startDate),
          startId: (index++).toString(),
          endId: (index++).toString(),
        },
        d.color, d.comment));
    }

    this.combineAndExecute(commands);

    this.recalculateBossTargets();
    this.applyFilter();
  }

  undo() {
    this.commandStorage.undo();
    this.applyFilter();
  }

  redo() {
    this.commandStorage.redo();
    this.applyFilter();
  }

  addJob(id: string,
    name: string,
    actorName?: string,
    pet?: string,
    collapsed: boolean = false,
    doUpdates: boolean = true): string {

    const rid = id || this.idgen.getNextId(M.EntryType.Job);
    this.commandStorage.execute(new C.AddJobCommand(rid,
      name,
      actorName,
      this.holders.bossTargets.initialBossTarget,
      doUpdates,
      pet,
      collapsed));
    if (doUpdates)
      this.applyFilter();
    return rid;
  }

  removeJob(id: string): void {
    this.commandStorage.execute(new C.RemoveJobCommand(id));
  }

  addClassAbility(id: string, map: AbilityMap, time: Date, loaded: boolean, settings: string = null): void {
    if (map) {
      if (map.isStance) {
        this.dialogCallBacks.openStanceSelector(map.job.job.stances.map((it) => <M.IContextMenuData>{
          text: it.ability.name,
          icon: it.ability.icon,
          handler: () => {
            this.commandStorage.execute(new C.AddStanceCommand(id || this.idgen.getNextId(M.EntryType.StanceUsage),
              map.job.id,
              it.ability.name,
              time,
              this.holders.stances.getNext(new Date(time.valueOf() as number - 1000)),
              loaded));
          },
          item: null
        }));
      } else {
        if (map.ability.requiresBossTarget && time < this.startDate) return;

        if (!map.ability.overlapStrategy.check({
          ability: map.ability,
          holders: this.holders,
          group: map.id,
          id: id,
          start: time,
          end: new Date(time.valueOf() as number + map.ability.cooldown * 1000),
          selectionRegistry: this.holders.selectionRegistry
        }))
          this.commandStorage.execute(new C.AddAbilityCommand(id || this.idgen.getNextId(M.EntryType.AbilityUsage),
            null,
            map.job.id,
            map.ability.name,
            time,
            loaded,
            JSON.parse(settings)));
      }
    }
  }

  addBossAttack(id: string, time: Date, bossAbility: M.IBossAbility): void {
    bossAbility.offset = Utils.formatTime(time);
    this.commandStorage.execute(new C.AddBossAttackCommand(id || this.idgen.getNextId(M.EntryType.BossAttack),
      bossAbility));
  }

  getLatestBossAttackTime(): Date | null {
    const filtered = this.holders.bossAttacks.getAll();
    if (filtered.length === 0) return null;
    return (filtered.reduce((a, b) => a.start < b.start ? b : a)).start as Date;
  }

  getLatestAbilityUsageTime(): Date | null {
    const filtered = this.holders.itemUsages.getAll();
    if (filtered.length === 0) return this.startDate;
    return (filtered.reduce((a, b) => a.start < b.start ? b : a)).start as Date;
  }

  updateBossAttack(itemid: string): void {
    const map = this.holders.bossAttacks.get(itemid);
    this.dialogCallBacks.openBossAttackAddDialog(Utils.clone<M.IBossAbility>(map.attack),
      (result: { updateAllWithSameName: boolean, data: M.IBossAbility }) => {
        if (result != null) {
          const commands: any[] = [];
          const delta = ((Utils.getDateFromOffset(result.data.offset, this.startDate).valueOf() as number) -
            (map.start.valueOf() as number));
          commands.push(
            new C.ChangeBossAttackCommand(itemid, result.data, result.updateAllWithSameName)
          );

          if (this.tools.stickyAttacks) {
            const afterMe = this.holders.bossAttacks.filter(it => it.start >= map.start && it.id !== itemid);
            commands.push(...afterMe.map(it => {
              return new C.ChangeBossAttackCommand(it.id,
                { offset: Utils.formatTime(new Date(it.startAsNumber + delta * 1000)) },
                false);
            }));
          }
          this.commandStorage.execute(new C.CombinedCommand(commands));

          this.holders.bossAttacks.applyFilter(this.filter.attacks);
        }
      });
  }

  notifyDoubleClick(itemid: string, group: string, time: Date): void {
    if (itemid !== undefined && itemid !== null) {
      if (this.idgen.isBossAttack(itemid)) {
        this.updateBossAttack(itemid);
      }
      if (this.idgen.isAbilityUsage(itemid)) {
        this.editAbility(itemid);
      }
      return;
    }

    if (!time) return;
    time.setMilliseconds(0);

    if (group === this.bossGroup || !group) {
      if (time >= this.startDate) {
        this.dialogCallBacks.openBossAttackAddDialog({ offset: Utils.formatTime(time) },
          (result: { updateAllWithSameName: boolean, data: M.IBossAbility }) => {
            if (result != null) {
              this.addBossAttack(this.idgen.getNextId(M.EntryType.BossAttack),
                Utils.getDateFromOffset(result.data.offset, this.startDate),
                result.data);
            }
          });
      }
    } else {
      const map = this.holders.abilities.get(group);
      if (map) {
        this.addClassAbility(null, map, time, false);
      } else {
        const job = this.holders.jobs.get(group);
        if (job !== undefined)
          this.switchInitialBossTarget(job, true);
      }
    }
  }

  private notifyRemove(id: string, updateAttacks?: boolean): void {
    console.log(`NotifyRemove ${id}`);
    if (this.idgen.isAbilityUsage(id)) {
      this.commandBag.push(new C.RemoveAbilityCommand(id, updateAttacks));
    } else if (this.idgen.isStanceUsage(id)) {
      this.commandBag.push(new C.RemoveStanceCommand(id, updateAttacks));
    } else if (this.idgen.isBossAttack(id)) {
      this.commandBag.push(new C.RemoveBossAttackCommand(id, updateAttacks));
    }

    this.commandBag.evaluate(this.holders.selectionRegistry.length, () => this.holders.selectionRegistry.clear());
  }

  notifyMove(item: DataItem): void {
    const found = this.holders.selectionRegistry.get(item.id.toString());
    if (found) {
      if (this.idgen.isAbilityUsage(item.id)) {
        this.commandBag.push(new C.MoveCommand(item.id.toString(), item.start as Date));
      } else if (this.idgen.isStanceUsage(item.id)) {
        this.commandBag.push(new C.MoveStanceCommand(item.id.toString(), item.start as Date, item.end as Date));
      } else if (this.idgen.isBossAttack(item.id)) {
        this.commandBag.push(new C.ChangeBossAttackCommand(item.id.toString(),
          { offset: Utils.formatTime(new Date(item.start)) },
          false));
        if (this.tools.stickyAttacks) {
          const afterMe = this.holders.bossAttacks.filter(it => it.start >= found.time && it.id !== item.id);
          this.commandBag.push(new C.CombinedCommand(afterMe.map(it => {
            return new C.ChangeBossAttackCommand(it.id,
              {
                offset: Utils.formatTime(new Date((it.start.valueOf() as number) +
                  ((item.start.valueOf() as number) - (found.time.valueOf() as number))))
              },
              false);
          })));
        }
      }
    }

    this.commandBag.evaluate(this.holders.selectionRegistry.length);
  }

  updateTools(tools: M.ITools): void {
    this.tools = tools;
  }

  notifySelect(target: string, ids: string[]): void {
    this.holders.selectionRegistry.clear();

    setTimeout(() => {
      const all = this.holders.jobs.getAll();
      all.forEach((it) => {
        it.applyData({ selected: ids && ids.indexOf(it.id) >= 0 });
      });
      this.holders.jobs.update(all);
      const allt = this.holders.abilities.getAll();
      allt.forEach((it) => {
        it.applyData({ selected: ids && ids.indexOf(it.id) >= 0 });
      });
      this.holders.abilities.update(allt);
    }, 1);

    if (!ids) return;
    switch (target) {
      case "friend":
        this.holders.itemUsages.getByIds(ids).forEach((it) => {
          this.holders.selectionRegistry.add(new AbilitySelectionMap(it.id, it.start));
        });
        this.holders.stances.getByIds(ids).forEach((it) => {
          this.holders.selectionRegistry.add(new AbilitySelectionMap(it.id, it.start));
        });
        break;
      case "boss":
        this.holders.bossAttacks.getByIds(ids).forEach((it: BossAttackMap) => {
          this.holders.selectionRegistry.add(new AbilitySelectionMap(it.id, it.start));
        });
        break;
      case "downtime":
        break;
      default:
        break;
    }
  }

  updateAffectedAbilities(ability: M.IAbility): void {
    if (ability.relatedAbilities !== undefined && ability.relatedAbilities.affects !== undefined) {
      const foundItems = this.holders.itemUsages.filter((x) =>
        ability.relatedAbilities.affects.some(((value: string) => x.ability.ability.name === value) as any));
      this.holders.itemUsages.update(foundItems);
    }
  }

  recalculateBossTargets(): void {
    this.holders.bossTargets.clear();

    if (this.holders.bossTargets.initialBossTarget === this.bossGroup) return;

    const date = new Date(this.startDate);
    date.setMinutes(30);
    const latestBossTime = date;


    const bossTargetChangeAbilities = this.holders.itemUsages
      .filter(a => this.holders.abilities.isBossTargetForGroup(a.ability.id))
      .sort((a, b) => a.startAsNumber - b.startAsNumber);

    let start = Utils.getDateFromOffset(0, this.startDate);
    let target = this.holders.bossTargets.initialBossTarget;

    for (let i = 0; i < bossTargetChangeAbilities.length + 1; i++) {
      if (i < bossTargetChangeAbilities.length) {
        const setting = bossTargetChangeAbilities[i].getSettingData(Shared.settings.changesTarget.name);
        if (setting !== null && setting !== undefined && !setting.value) continue;
      }

      let end = i === bossTargetChangeAbilities.length ? latestBossTime : bossTargetChangeAbilities[i].start as Date;
      end = end > latestBossTime ? latestBossTime : end;

      if (start >= end || start > latestBossTime) return;

      const id = this.idgen.getNextId(M.EntryType.BossTarget);
      this.holders.bossTargets.add(new BossTargetMap(id, target, { start: start, end: end }));

      if (i < bossTargetChangeAbilities.length) {
        target = bossTargetChangeAbilities[i].ability.job.id;
        start = end;
      }
    }
  }

  canMove(item: DataItem): boolean {
    const type = this.idgen.getEntryType(item.id);

    switch (type) {
      case M.EntryType.AbilityUsage:
        const ability = this.holders.abilities.get(item.group).ability;
        return (item.end as number) - (item.start as number) === ability.cooldown * 1000 &&
          new Date(item.start) >=
          new Date(this.startDate.valueOf() as number - ((ability.requiresBossTarget ? 0 : 1) * 30 * 1000)) &&
          !ability.overlapStrategy.check({
            ability: ability,
            holders: this.holders,
            id: item.id.toString(),
            group: item.group,
            start: new Date(item.start),
            end: new Date(item.end),
            selectionRegistry: this.holders.selectionRegistry
          });
      case M.EntryType.StanceUsage:
        const sability = this.holders.abilities.get(item.group).ability;
        return (item.end as number) - (item.start as number) > 0 &&
          new Date(item.start) >= new Date(this.startDate.valueOf() as number - 30 * 1000) &&
          !sability.overlapStrategy.check({
            ability: sability,
            holders: this.holders,
            id: item.id.toString(),
            group: item.group,
            start: new Date(item.start),
            end: new Date(item.end),
            selectionRegistry: this.holders.selectionRegistry
          });
      case M.EntryType.BossAttack:
        return new Date(item.start) >= this.startDate;
    }
    return false;
  }

  private update(options: IUpdateOptions): void {
    if (this.loading) return;

    if (options.updateDowntimeMarkers) {
      this.downtimeChanged.emit();
    }

    if (options.updateIntersectedWithBossAttackAtDate) {
      const intersected = this.holders.itemUsages.filter(
        (x) => options.updateIntersectedWithBossAttackAtDate >= x.start &&
          options.updateIntersectedWithBossAttackAtDate <= x.end);
      this.holders.itemUsages.update(intersected);
    }

    if (options.abilityChanged) {
      this.updateAffectedAbilities(options.abilityChanged.ability);
      this.updateBuffHeatmap(this.view.buffmap, options.abilityChanged.ability);
      this.availabilityController.updateAvailability(options.abilityChanged.ability);
    }

    if (options.updateBossTargets ||
      (options.abilityChanged &&
        options.abilityChanged.ability.settings &&
        options.abilityChanged.ability.settings.some((s => s.name === "changesTarget") as any)))
      this.recalculateBossTargets();

    if (options.updateFilters)
      this.applyFilter();

  }

  updateBuffHeatmap(active: boolean, ability: M.IAbility): void {
    this.holders.heatMaps.clear();

    if (active) {
      const maps = this.holders.itemUsages.getAll().map((it) => {
        const amap = it.ability;
        if (amap && !amap.hidden && amap.isDamage) {
          const start = new Date(it.startAsNumber + (amap.ability.activationOffset || 0) * 1000);
          const end = new Date((start.valueOf() as number) + this.calculateDuration(it.start, amap) * 1000);
          const id = this.idgen.getNextId(M.EntryType.BuffMap) + "_" + it.id;
          const group = amap.isPartyDamage ? null : amap.job.id;
          return new HeatmapMap(id, group, { start: start, end: end });
        }
        return null;
      }).filter(it => it != null);
      this.holders.heatMaps.addRange(maps);
    }
  }

  switchInitialBossTarget(map: JobMap, addToUndoRedo: boolean): void {
    if (map.job.role === M.Role.Tank) {
      if (addToUndoRedo && this.holders.bossTargets.initialBossTarget !== map.id)
        this.commandStorage.execute(new C.SwitchTargetCommand(this.holders.bossTargets.initialBossTarget, map.id));
      else
        this.holders.bossTargets.initialBossTarget = map.id;
    }
  }

  calculateDuration(start: Date, map: AbilityMap): number {
    const ability = map.ability;
    let duration = ability.duration;

    if (ability.relatedAbilities && ability.relatedAbilities.affectedBy) {
      const foundItems = this.holders.itemUsages.filter((x) => {
        const abilityMap = x.ability;
        return (!ability.relatedAbilities.parentOnly || abilityMap.job.id === map.job.id) &&
          ability.relatedAbilities.affectedBy.some(((value: string) => value === abilityMap.ability.name) as any);
      }
      ).sort((a, b) => (a.startAsNumber) - (b.startAsNumber));

      if (foundItems.length > 0) {
        const difference = foundItems.map((found) => {
          const diff = Math.round((found.startAsNumber - start.valueOf()) / 1000);
          if (diff >= 0 && diff < ability.duration) {
            return diff;
          }
          return duration;
        }).reduce((a: any, b: any) => a < b ? a : b);


        if (difference >= 0 && difference < ability.duration) {
          duration = difference;
        }
      }
    }

    if (ability.extendDurationOnNextAbility !== undefined) {
      const items = this.holders.bossAttacks
        .filter((x: BossAttackMap) => x.attack.isTankBuster && x.start >= start)
        .sort((a, b) => (a.startAsNumber) - (b.startAsNumber));
      if (items.length > 0) {
        const found = items[0];
        const difference = Math.round((found.startAsNumber - start.valueOf()) / 1000);
        if (difference <= ability.duration) {
          duration = difference + ability.extendDurationOnNextAbility;
        }
      }
    }

    return duration;
  }

  removeDownTime(id: string): void {
    this.commandStorage.execute(new C.RemoveDownTimeCommand(id));
  }

  setDownTimeColor(id: string, color: string): void {
    this.commandStorage.execute(new C.ChangeDowntimeColorCommand(id, color));
  }
  setDownTimeComment(id: string, comment: string): void {
    this.commandStorage.execute(new C.ChangeDowntimeCommentCommand(id, comment));
  }


  setPet(jobMap: JobMap, pet: string) {
    this.commandStorage.execute(new C.SetJobPetCommand(jobMap.id, pet));
  }

  moveUp(group: any) {

  }

  getDowntimesAtTime(time: Date): BossDownTimeMap[] {
    return this.holders.bossDownTime.filter((it) => it.checkTime(time));
  }

  getContextMenuItems(event: any): M.IContextMenuData[] {
    const items: Array<M.IContextMenuData> = [];
    if (event.what === "background") {
      const downTimes = this.holders.bossDownTime.filter((it) => it.start <= event.time && it.end >= event.time);
      if (downTimes && downTimes.length > 0) {
        items.push(...downTimes.map((it) => <M.IContextMenuData>{
          text: `Downtime (${Utils.formatTime(it.start as Date)} - ${Utils.formatTime(it.end as Date)})`,
          item: it,
          handler: () => {
            return {
              remove: (() => this.removeDownTime(it.id)).bind(this),
              color: ((color) => this.setDownTimeColor(it.id, color)).bind(this)
            };
          },
          isDowntime: true
        }));
      }
      if (this.view.buffmap) {
        const heatMaps = this.holders.heatMaps.filter((it) => it.start <= event.time && it.end >= event.time);
        if (heatMaps && heatMaps.length > 0) {
          items.push(...heatMaps.map((it) => {
            const id = it.id.toString().match("_(.+)")[1];
            const item = this.holders.itemUsages.get(id).ability;
            if (item.hasValue(M.AbilityType.PartyDamageBuff))
              return <M.IContextMenuData>{
                text: item.ability.name,
                item: it,
                icon: item.ability.icon,
                handler: () => { }
              };
            return null;
          }).filter((it) => !!it));
        }
      }

      if ((event.group === "boss" || event.group === null) && this.copyContainer) {
        items.push({
          text: "Paste",
          item: event.item,
          handler: () => this.paste(event.time)
        });
      }
    } else if (event.what === "item") {
      if (event.group === "boss") {
        items.push({
          text: "Copy",
          item: event.item,
          handler: () => this.copy(event.item)
        });
      } else {
        const stance = this.holders.stances.get(event.item);
        if (stance) {
          items.push({
            text: "Split here",
            item: event.item,
            handler: () => this.splitStance(event.item, event.time)
          });
          items.push({
            text: "Fill",
            item: event.item,
            handler: () => this.fillStance(event.item)
          });
        }
      }
    } else if (!event.what) {
      if (!event.group && this.copyContainer) {
        items.push({
          text: "Paste",
          item: event.item,
          handler: () => this.paste(event.time)
        });
      }
    }
    return items;
  }


  combineAndExecute(commands: Command[]): void {
    const combined = new C.CombinedCommand(commands);
    this.commandStorage.execute(combined);
  }

  fillJob(id: string): Command[] {
    const abilities = this.holders.abilities.getByParentId(id)
      .filter(it => !it.hidden && it.ability.cooldown > 10 && !it.filtered);
    return _.flatten(abilities.map(it => this.fillAbility(it.id)));
  }

  fillAbility(id: string): Command[] {
    const map = this.holders.abilities.get(id);
    const usages = this.holders.itemUsages.getByAbility(id);
    const max = _.maxBy(usages, (it: AbilityUsageMap) => it.end) as AbilityUsageMap;
    const maxValue = max && max.end || this.startDate;
    const count = 6 * 60 / map.ability.cooldown;
    return _.range(count).map(it => new C.AddAbilityCommand(this.idgen.getNextId(M.EntryType.AbilityUsage),
      null,
      map.job.id,
      map.ability.name,
      new Date(maxValue.valueOf() + (it * map.ability.cooldown * 1000)),
      false,
      null));
  }

  splitStance(id: string, time: any) {
    const stance = this.holders.stances.get(id);
    if (stance) {
      this.commandStorage.execute(new C.CombinedCommand([
        new C.MoveStanceCommand(id, stance.start, new Date(time.valueOf() as number - 1000)),
        new C.AddStanceCommand(this.idgen.getNextId(M.EntryType.StanceUsage),
          stance.ability.job.id,
          stance.stanceAbility.name,
          time,
          this.holders.stances.getNext(time),
          false)
      ]));
    }
  }

  fillStance(id: string) {
    const stance = this.holders.stances.get(id);
    if (stance) {
      const next = this.holders.stances.getNext(stance.end);
      const prev = this.holders.stances.getPrev(stance.start);
      if (next !== stance.end || prev !== stance.start) {
        this.commandStorage.execute(new C.CombinedCommand([
          new C.MoveStanceCommand(id, prev, next)
        ]));
      }
    }
  }


  copy(id: string) {
    const ba = this.holders.bossAttacks.get(id);
    this.copyContainer = Utils.clone(ba.attack);
  }

  paste(time: any) {
    if (this.copyContainer) {
      const copy = Utils.clone(this.copyContainer as M.IBossAbility);
      copy.offset = Utils.formatTime(time);
      this.addBossAttack(null, time, copy);
    }
  }

  toggleCompactView(group: string, value?: boolean): void {
    const job = this.holders.jobs.get(group);
    if (!job) return;
    if (value == null || value == undefined)
      job.isCompact = !job.isCompact;
    else
      job.isCompact = value;

    const abilities = this.holders.abilities.getByParentId(group);
    abilities.forEach(it => {
      if (it.isStance) return;
      it.applyData({
        isCompact: job.isCompact
      });

      const items = this.holders.itemUsages.getByAbility(it.id);
      items.forEach(a => {
        a.applyData();
      });
      this.holders.itemUsages.update(items);
    });
    this.holders.abilities.update(abilities);
  }

  hideAbility(group: string) {
    const map = this.holders.abilities.get(group);
    map.applyData({
      hidden: true
    });
    this.holders.abilities.update([map]);
    this.updateBuffHeatmap(this.view.buffmap, map.ability);

  }

  showAbility(group: string) {
    const map = this.holders.abilities.get(group);
    map.applyData({ hidden: false });
    this.holders.abilities.update([map]);
    this.updateBuffHeatmap(this.view.buffmap, map.ability);
  }

  getHolders(): Holders {
    return this.holders;
  }

  restoreHidden(group: string) {
    const abilities = this.holders.abilities.getByParentId(group);
    abilities.forEach((it: AbilityMap) => {
      it.applyData({ hidden: false });
    });

    this.holders.abilities.update(abilities);
    this.updateBuffHeatmap(this.view.buffmap, null);
    this.applyFilter();
  }

  visibleFrameTemplate(item: DataItem): string {
    if (item == null) return "";
    if (!this.idgen.isAbilityUsage(item.id)) return "";
    const map = this.holders.abilities.get(item.group);
    if (!map) return "";
    const ability = map.ability;

    const offset = ability.activationOffset || 0;
    const duration = this.calculateDuration(new Date(item.start), map);

    const offsetPercentage = (offset / ability.cooldown) * 100;
    const percentage = (duration / ability.cooldown) * 100;
    const arr = Object.keys(M.AbilityType)
      .filter(it => (ability.abilityType & M.AbilityType[it]) === M.AbilityType[it])
      .map(it => it);
    const color = this.colorSettings[arr[0]];
    return this.createItemUsageFrame(offsetPercentage, percentage, this.view.colorfulDurations && color ? color : "");
  }

  createItemUsageFrame(offsetPercentage: number, percentage: number, color: string): string {
    return `<div class="progress-wrapper-fl"><div class="progress-fl-offset" style = "width:${offsetPercentage}%"></div><div class="progress-fl" style="width:${percentage}%;background-color:${color}"> </div></div >`;
  }


  tooltipOnItemUpdateTime(item: DataItem): any {
    if (this.idgen.isStanceUsage(item.id))
      return Utils.formatTime(item.start as Date) + " - " + Utils.formatTime(item.end as Date);
    if (!this.idgen.isAbilityUsage(item.id) && !this.idgen.isBossAttack(item.id)) return undefined;
    return Utils.formatTime(item.start as Date);
  }

  handleDelete(selected: (string | number)[]): any {
    const toRemove = [
      ...this.holders.itemUsages.getByIds(selected).map(x => x.id),
      ...this.holders.stances.getByIds(selected).map(x => x.id),
      ...this.holders.bossAttacks.getByIds(selected).map(x => x.id)
    ];
    for (let r of toRemove.filter(it => !!it)) {
      this.notifyRemove(r, false);
    }
  }


  updateBoss(boss: M.IBoss): void {
    this.data.boss = boss;
  }

  updateFight(fight: M.IFight): void {
    this.data.fight = fight;
    this.hasChanges = false;
  }


  loadFight(fight: M.IFight): void {
    if (fight === null || fight === undefined || !fight.data) return;
    const data = JSON.parse(fight.data) as SerializeController.IFightSerializeData;
    try {

      this.loading = true;
      this.commandStorage.turnOffFireExecuted();

      this.data.fight = fight;
      this.data.importedFrom = data.importedFrom;

      this.holders.jobs.clear();
      this.holders.abilities.clear();
      this.holders.itemUsages.clear();
      this.holders.heatMaps.clear();
      this.holders.bossTargets.clear();
      this.holders.selectionRegistry.clear();
      this.commandStorage.clear();
      this.commandBag.clear();


      if (data.boss) {
        this.holders.bossAttacks.clear();
        this.loadBoss(data.boss);
        this.holders.bossAttacks.applyFilter(data.filter.attacks);
      }

      if (data.jobs) {
        for (let j of data.jobs.sort((a, b) => a.order - b.order)) {
          const rid = this.addJob(j.id, j.name, null, j.pet, j.collapsed, false);
          const jh = this.holders.jobs.get(rid);
          if (jh) {
            if (j.filter)
              jh.filter = j.filter;
            if (j.compact !== undefined && j.compact !== null)
              this.toggleCompactView(j.id, j.compact);
          }
        }
      }

      if (data.abilityMaps) {
        for (let it of data.abilityMaps) {
          let ab = this.holders.abilities.getByParentAndAbility(it.job, it.name);
          if (ab) {
            if (it.hidden !== undefined && it.hidden !== null) {
              if (it.hidden) //todo: optimize this
                this.hideAbility(ab.id);
              else
                this.showAbility(ab.id);
            }
          }
        }
      }

      if (data.abilities)
        for (let a of data.abilities) {
          if (a) {
            const abilityMap = this.holders.abilities.getByParentAndAbility(a.job, a.ability);
            if (abilityMap) {
              this.addClassAbility(a.id,
                abilityMap,
                Utils.getDateFromOffset(a.start, this.startDate),
                true,
                a.settings);
            }

          }
        }
      if (data.stances)
        for (let a of data.stances) {
          if (a) {
            const abilityMap = this.holders.abilities.getStancesAbility(a.job);
            if (abilityMap) {
              this.commandStorage.execute(new C.AddStanceCommand(this.idgen.getNextId(M.EntryType.StanceUsage),
                abilityMap.job.id,
                a.ability,
                Utils.getDateFromOffset(a.start, this.startDate),
                Utils.getDateFromOffset(a.end, this.startDate),
                true));
            }
          }
        }
      this.filter = data.filter;

    } finally {
      this.loading = false;
      this.commandStorage.clear();
    }
    const jobMap = this.holders.jobs.get(data.initialTarget);
    if (jobMap)
      this.switchInitialBossTarget(jobMap, false);
    this.recalculateBossTargets();

    this.applyFilter();
    this.applyView(data.view, true);

    if (data.jobs) {
      for (let j of data.jobs.sort((a, b) => a.order - b.order)) {
        if (j.compact !== undefined && j.compact !== null)
          this.toggleCompactView(j.id, j.compact);
      }
    }

    if (data.abilityMaps) {
      for (let it of data.abilityMaps) {
        let ab = this.holders.abilities.getByParentAndAbility(it.job, it.name);
        if (ab) {
          this.toggleCompactViewAbility(ab.id, it.compact);
        }
      }
    }

    this.availabilityController.setAbilityAvailabilityView(this.view.showAbilityAvailablity);
    this.commandStorage.turnOnFireExecuted();
    this.hasChanges = false;
  }


  get canUndo(): boolean {
    return this.commandStorage.canUndo();
  }

  canUndoChanged = new EventEmitter<void>();

  get canRedo(): boolean {
    return this.commandStorage.canRedo();
  }

  canRedoChanged = new EventEmitter<void>();

  addDownTime(window: { start: Date; startId: string, end: Date, endId: string }, color: string, comment: string = ""): void {
    this.commandStorage.execute(new C.AddDowntimeCommand(this.idgen.getNextId(M.EntryType.BossDownTime),
      window,
      color, comment));
  }

  editAbility(itemid: string): void {
    const item = this.holders.itemUsages.get(itemid);
    const settings = item.ability.ability.settings;
    if (settings && settings.length > 0) {

      this.dialogCallBacks.openAbilityEditDialog(
        {
          ability: item.ability.ability,
          settings: settings,
          values: item.settings,
          jobs: this.holders.jobs.getAll()
        },
        (b: any) => {
          if (b) {
            this.commandStorage.execute(new C.ChangeAbilitySettingsCommand(itemid, b));
          }
        });
    }

  }

  notifyTimeChanged(id: string, date: Date): void {
    const map = this.holders.bossDownTime.getById(id);
    if (map) {
      let start = map.start;
      let end = map.end;
      if (map.startId === id) {
        start = date;
      } else {
        end = date;
      }
      this.commandStorage.execute(new C.ChangeDowntimeCommand(map.id, start as Date, end as Date));
    }

  }

  getBossDownTimeMarkers(): { map: BossDownTimeMap, start: Date, end: Date }[] {
    return this.holders.bossDownTime.getAll().map((it) => {
      return { map: it, start: it.start, end: it.end };
    });
  }


  applyFilter(input?: M.IFilter): void {
    if (this.loading) return;

    console.log("filter requested");
    if (input)
      this.filter = input;

    this.holders.abilities.applyFilter(this.filter.abilities,
      (val) => this.holders.itemUsages.filter((item) => item.ability.id === val).length > 0);
    this.holders.bossAttacks.applyFilter(this.filter.attacks);
  }

  importFromFFLogs(key: string, parser: Parser.Parser): any {

    try {
      this.data.importedFrom = key;
      this.loading = true;
      const settings = this.settingsService.load();

      const importController =
        new ImportController.ImportController(this.idgen, this.holders, this.gameService.jobRegistry);
      const importCommand = importController.buildImportCommand(settings, parser, this.startDate);

      this.commandStorage.execute(importCommand);

    } catch (e) {
      console.error(e);
    } finally {
      this.holders.bossTargets.initialBossTarget = "boss";
      this.recalculateBossTargets();

      this.applyView(this.view, true);
      this.applyFilter();

      this.loading = false;
    }

  }

  applyView(view: M.IView, force?: boolean): void {
    if (this.view.ogcdAsPoints !== view.ogcdAsPoints || force) {
      const items = this.holders.itemUsages.getAll();
      items.forEach(x => {
        const map = x.ability;
        if (map.ability.duration === 0 && (map.hasValue(M.AbilityType.Damage) || !!map.ability.charges))
          x.applyData({ ogcdAsPoints: view.ogcdAsPoints });
      });
      this.holders.itemUsages.update(items);
    }

    if (this.view.buffmap !== view.buffmap || force) {
      this.updateBuffHeatmap(view.buffmap, null);
    }

    if (this.view.showDowntimesInPartyArea !== view.showDowntimesInPartyArea || force) {
      this.holders.bossDownTime.setShowInPartyArea(view.showDowntimesInPartyArea);
    }

    if (this.view.verticalBossAttacks !== view.verticalBossAttacks || force) {
      this.holders.bossAttacks.setVertical(view.verticalBossAttacks);
    }

    if (this.view.compactView !== view.compactView || force) {
      this.setCompactView(view.compactView);
    }

    if (this.view.highlightLoaded !== view.highlightLoaded || force) {
      this.setHighLightLoadedView(view.highlightLoaded);
    }

    if (this.view.showAbilityAvailablity !== view.showAbilityAvailablity || force) {
      this.availabilityController.setAbilityAvailabilityView(view.showAbilityAvailablity);
    }

    Object.assign(this.view, view);
  }

  isJobGroup(group: string): boolean {
    return !!this.holders.jobs.get(group);
  }

  moveBossAttack(item: DataItem): void {
    this.holders.bossAttacks.sync(item.id.toString(), new Date(item.start));
  }

  moveSelection(delta: number): void {
    const items = this.holders.selectionRegistry.getAll();
    if (items && items.length) {
      const ids = items.map(it => it.id);
      const toMove: (IMoveable & { id: string, start: Date, ability?: AbilityMap, end?: Date })[] = (_.flatten([
        this.holders.itemUsages.getByIds(ids),
        this.holders.stances.getByIds(ids),
        this.holders.bossAttacks.getByIds(ids)
      ]).filter(it => !!it)) as any;

      for (let r of toMove) {
        const newDate = new Date(new Date(r.start).valueOf() as number + delta * 1000);
        const newDateEnd = r.end && new Date(new Date(r.end).valueOf() as number + delta * 1000);
        const item = { id: r.id, start: newDate, end: newDateEnd, group: r.ability && r.ability.id, content: null };
        if (this.canMove(item)) {
          r.move(delta); //todo: set to exact date
          this.notifyMove(item);
        }
      }
    }
  }

  execute(data: any): void {
    const command = this.commandFactory.createFromData(data, this.view);
    if (command) {
      this.commandStorage.execute(command, false);
      this.hasChanges = true;
    }
  }


  setCompactView(compactView: boolean): void {
    this.holders.jobs.getAll().forEach(it => {
      this.toggleCompactView(it.id, compactView);
    });
  }

  toggleCompactViewAbility(id: string, compact?: boolean): void {
    const it = this.holders.abilities.get(id);
    if (it) {
      it.applyData({ isCompact: compact != undefined ? compact : !it.isCompact });

      const items = this.holders.itemUsages.getByAbility(it.id);
      items.forEach(a => {
        a.applyData();
      });
      this.holders.itemUsages.update(items);

      this.holders.abilities.update([it]);
    }
  }

  setHighLightLoadedView(highlightLoaded: boolean): void {
    this.holders.setHighLightLoadedView(highlightLoaded);
  }

  toggleJobCollapsed(group) {
    const j = this.holders.jobs.get(group);
    j.applyData({ collapsed: !j.collapsed });

    const abs = this.holders.abilities.getByParentId(j.id);
    abs.forEach(value => value.applyData({ collapsed: j.collapsed }));

    this.holders.jobs.update([j]);
    this.holders.abilities.update(abs);
  }

  getItems(items: any[]): any[] {
    return [
      ...this.holders.bossAttacks.getByIds(items),
      ...this.holders.itemUsages.getByIds(items),
      ...this.holders.stances.getByIds(items),
      ...this.holders.jobs.getByIds(items),
      ...this.holders.abilities.getByIds(items),
      ...this.holders.bossDownTime.getByIds(items)
    ];
  }

  createSerializer(): SerializeController.SerializeController {
    const ctr = new SerializeController.SerializeController(
      this.holders,
      this.gameService.name,
      this.fraction,
      this.data,
      this.filter,
      this.view);
    return ctr;
  }

  updateAbilitySettings(id, settings) {
    this.commandStorage.execute(new C.ChangeAbilitySettingsCommand(id, settings));
  }
}


export interface IDialogs {
  openBossAttackAddDialog: (
    bossAbility: M.IBossAbility | {},
    callBack: (b: any) => void)
    => void;
  openAbilityEditDialog: (
    data: {
      ability: M.IAbility,
      settings: M.IAbilitySetting[],
      values: M.IAbilitySettingData[],
      jobs: JobMap[],
    },
    callBack: (b: any) => void)
    => void;
  openStanceSelector: (
    data: M.IContextMenuData[])
    => void;
}
