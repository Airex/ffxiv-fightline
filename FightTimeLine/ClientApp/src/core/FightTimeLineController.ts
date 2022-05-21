import { EventEmitter } from "@angular/core";
import * as _ from "lodash";
import { DataItem, IdType } from "vis-timeline";
import * as Gameserviceinterface from "../services/game.service-interface";
import { IColorsSettings, SettingsService } from "../services/SettingsService";
import { AvailabilityController } from "./AvailabilityController";
import { CommandBag } from "./CommandBag";
import { CommandFactory } from "./CommandFactory";
import * as C from "./Commands";
import { IdGenerator } from "./Generators";
import * as ImportController from "./ImportController";
import * as M from "./Models";
import * as Parser from "./Parser";
import * as SerializeController from "./SerializeController";
import { Command, ICommandData, IUpdateOptions, UndoRedoController } from "./UndoRedo";
import { Utils } from "./Utils";
import { Holders } from "./Holders";
import { AbilityMap, BossAttackMap, HeatmapMap, JobMap, AbilityUsageMap, BossTargetMap, BossDownTimeMap } from "./Maps";
import { IMoveable } from "./Holders/BaseHolder";
import * as PresentationManager from "./PresentationManager";
import { IOverlapCheckData } from "./Maps/BaseMap";
import { calculateDuration, calculateOffset } from "./Durations";

export class FightTimeLineController {
  constructor(
    private startDate: Date,
    private idgen: IdGenerator,
    private holders: Holders,
    private dialogCallBacks: IDialogs,
    private gameService: Gameserviceinterface.IGameService,
    private settingsService: SettingsService,
    private presenterManager: PresentationManager.PresenterManager) {

    this.commandStorage = new UndoRedoController({
      idGen: this.idgen,
      holders: this.holders,
      jobRegistry: this.gameService.jobRegistry,
      update: this.update.bind(this),
      presenter: this.presenterManager,
      ogcdAttacksAsPoints: (ability: M.IAbility) => {
        const duration = calculateDuration(ability);
        return (
          duration === 0 && ability.cooldown <= 1) ||
          (ability.abilityType & M.AbilityType.Damage) === M.AbilityType.Damage
          ? (duration === 0
            ? this.presenterManager.view.ogcdAsPoints
            : false)
          : false;
      }
      ,
      verticalBossAttacks: () => this.presenterManager.view.verticalBossAttacks,
      isCompactView: () => this.presenterManager.view.compactView,
      highlightLoaded: () => this.presenterManager.view.highlightLoaded,
      addTags: (t: string[]) => this.presenterManager.addTags(t),
      addSources: (s: string) => this.presenterManager.addSource(s)
    });
    this.commandStorage.changed.subscribe(() => {
      this.canRedoChanged.emit();
      this.canUndoChanged.emit();
      this.hasChanges = true;
    });
    this.commandStorage.executed.subscribe((data: ICommandData) => {
      console.log("adding command in fightlineController.commandStorage.executed");
      this.commandExecuted.emit(data);
    });
    this.commandBag = new CommandBag(this.commandStorage);
    this.availabilityController = new AvailabilityController(
      this.presenterManager,
      this.holders,
      this.startDate,
      this.idgen
    );

    this.colorSettings = this.settingsService.load().colors;
  }


  get canUndo(): boolean {
    return this.commandStorage.canUndo();
  }

  get canRedo(): boolean {
    return this.commandStorage.canRedo();
  }

  data: M.IFightData = {};
  private bossGroup = "boss";
  private commandStorage: UndoRedoController;
  private commandBag: CommandBag;
  private loading = false;
  private commandFactory = new CommandFactory(this.startDate);
  private availabilityController: AvailabilityController;
  hasChanges = false;
  fraction: M.IFraction;
  colorSettings: IColorsSettings;
  viewCopy: M.IView;

  downtimeChanged = new EventEmitter<void>();
  commandExecuted = new EventEmitter<ICommandData>();

  canUndoChanged = new EventEmitter<void>();

  canRedoChanged = new EventEmitter<void>();

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
      loadData.attacks.map(it => new C.AddBossAttackCommand(
        it.id || this.idgen.getNextId(M.EntryType.BossAttack),
        it.ability))));

    let index = 1;
    for (const d of loadData.downTimes) {
      const nextId = d.id || this.idgen.getNextId(M.EntryType.BossDownTime);
      commands.push(new C.AddDowntimeCommand(nextId,
        {
          start: Utils.getDateFromOffset(d.start, this.startDate),
          startId: (index++).toString(),
          end: Utils.getDateFromOffset(d.end, this.startDate),
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

  attachPreset(name, preset) {
    this.commandStorage.execute(new C.AttachPresetCommand(name, preset));
  }

  addJob(
    id: string,
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
    if (doUpdates) {
      this.applyFilter();
    }
    return rid;
  }

  setJobStats(id: string, data: M.IJobStats) {
    this.commandStorage.execute(new C.ChangeJobStats(id, data));
  }

  removeJob(id: string): void {
    this.commandStorage.execute(new C.RemoveJobCommand(id));
  }

  addClassAbility(id: string, map: AbilityMap, time: Date, loaded: boolean, settings: string = null): void {
    if (map) {
      if (map.ability.requiresBossTarget && time < this.startDate) { return; }

      const overlap = map.ability.overlapStrategy.check({
        ability: map.ability,
        globalStart: this.startDate,
        holders: this.holders,
        group: map.id,
        id,
        start: time,
        end: new Date(time.valueOf() as number + map.ability.cooldown * 1000)
      });

      if (!overlap) {
        this.commandStorage.execute(new C.AddAbilityCommand(id || this.idgen.getNextId(M.EntryType.AbilityUsage),
          null,
          map.job.id,
          map.ability.name,
          time,
          loaded,
          JSON.parse(settings))
        );
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
    if (filtered.length === 0) { return null; }
    return (filtered.reduce((a, b) => a.start < b.start ? b : a)).start as Date;
  }

  getLatestAbilityUsageTime(): Date | null {
    const filtered = this.holders.itemUsages.getAll();
    if (filtered.length === 0) { return this.startDate; }
    return (filtered.reduce((a, b) => a.start < b.start ? b : a)).start as Date;
  }

  updateBossAttack(itemid: string): void {
    const map = this.holders.bossAttacks.get(itemid);
    this.dialogCallBacks.openBossAttackAddDialog(Utils.clone<M.IBossAbility>(map.attack), result => {
      if (result) {
        this.commandStorage.execute(new C.ChangeBossAttackCommand(itemid, result.data, result.updateAllWithSameName));
        this.holders.bossAttacks.applyFilter(this.presenterManager.filter.attacks);
      }
    });
  }

  toggleBossAttackPin(id: string) {
    const att = this.holders.bossAttacks.get(id);
    const data = { ...att.attack, pinned: !att.attack.pinned };
    this.commandStorage.execute(new C.ChangeBossAttackCommand(id, data, false));
    this.holders.bossAttacks.applyFilter(this.presenterManager.filter.attacks);
  }

  notifyDoubleClick(itemid: string, group: string, time: Date): void {
    if (itemid !== undefined && itemid !== null) {
      if (this.idgen.isBossAttack(itemid)) {
        this.updateBossAttack(itemid);
      }
      return;
    }

    if (!time) { return; }
    time.setMilliseconds(0);

    if (group === this.bossGroup || !group) {
      if (time >= this.startDate) {
        this.dialogCallBacks.openBossAttackAddDialog({ offset: Utils.formatTime(time) }, result => {
          if (result) {
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
        if (job !== undefined) {
          this.switchInitialBossTarget(job, true);
        }
      }
    }
  }

  private notifyRemove(id: string, updateAttacks?: boolean): void {
    // console.log(`NotifyRemove ${id}`);
    if (this.idgen.isAbilityUsage(id)) {
      this.commandBag.push(new C.RemoveAbilityCommand(id, updateAttacks));
    } else if (this.idgen.isStanceUsage(id)) {
      this.commandBag.push(new C.RemoveStanceCommand(id, updateAttacks));
    } else if (this.idgen.isBossAttack(id)) {
      this.commandBag.push(new C.RemoveBossAttackCommand(id, updateAttacks));
    }
  }

  notifyMove(items: DataItem[]): void {
    items.forEach(item => {
      if (this.idgen.isAbilityUsage(item.id)) {
        this.commandBag.push(new C.MoveCommand(item.id.toString(), item.start as Date));
      } else if (this.idgen.isStanceUsage(item.id)) {
        this.commandBag.push(new C.MoveStanceCommand(item.id.toString(), item.start as Date, item.end as Date));
      } else if (this.idgen.isBossAttack(item.id)) {
        this.commandBag.push(new C.ChangeBossAttackCommand(item.id.toString(), { offset: Utils.formatTime(new Date(item.start)) }, false));
      }
    });

    this.commandBag.evaluate();
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

    if (this.holders.bossTargets.initialBossTarget === this.bossGroup) { return; }

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
        const setting = bossTargetChangeAbilities[i].getSettingData(M.settings.changesTarget.name);
        if (setting !== null && setting !== undefined && !setting.value) { continue; }
      }

      let end = i === bossTargetChangeAbilities.length ? latestBossTime : bossTargetChangeAbilities[i].start as Date;
      end = end > latestBossTime ? latestBossTime : end;

      if (start >= end || start > latestBossTime) { return; }

      const id = this.idgen.getNextId(M.EntryType.BossTarget);
      this.holders.bossTargets.add(new BossTargetMap(this.presenterManager, id, target, { start, end }));

      if (i < bossTargetChangeAbilities.length) {
        target = bossTargetChangeAbilities[i].ability.job.id;
        start = end;
      }
    }
  }

  canMove(item: DataItem, selection: string[]): boolean {
    const type = this.idgen.getEntryType(item.id);

    const overlapCheckData: IOverlapCheckData = {
      holders: this.holders,
      id: item.id.toString(),
      group: item.group,
      start: new Date(item.start),
      end: new Date(item.end),
      globalStart: this.startDate,
      selectionRegistry: selection
    };

    switch (type) {
      case M.EntryType.AbilityUsage: {
        const ability = this.holders.itemUsages.get(overlapCheckData.id);
        return ability.canMove(overlapCheckData);
      }
      case M.EntryType.BossAttack: {
        const ability = this.holders.bossAttacks.get(overlapCheckData.id);
        return ability.canMove(overlapCheckData);
      }
    }
    return false;
  }

  private update(options: IUpdateOptions): void {
    if (this.loading) { return; }

    if (options.updateDowntimeMarkers) {
      this.downtimeChanged.emit();
    }

    if (options.updateIntersectedWithBossAttackAtDate) {
      const intersected = this.holders.itemUsages.filter((x) =>
        options.updateIntersectedWithBossAttackAtDate >= x.start &&
        options.updateIntersectedWithBossAttackAtDate <= x.end
      );
      this.holders.itemUsages.update(intersected);
    }

    if (options.abilityChanged) {
      this.updateAffectedAbilities(options.abilityChanged.ability);
      this.updateBuffHeatmap(this.presenterManager.view.buffmap, options.abilityChanged.ability);
      this.availabilityController.updateAvailability(options.abilityChanged.ability);
    }

    if (
      options.updateBossTargets ||
      options.abilityChanged?.ability?.settings?.some(s => s.name === "changesTarget")
    ) {
      this.recalculateBossTargets();
    }

    if (options.updateFilters) {
      this.applyFilter();
    }

  }

  updateBuffHeatmap(active: boolean, ability: M.IAbility): void {
    this.holders.heatMaps.clear();

    if (active) {
      const maps = this.holders.itemUsages.getAll().map((it) => {
        const amap = it.ability;
        if (amap && !amap.hidden && !amap.filtered && amap.isDamage) {
          const start = new Date(it.startAsNumber + (calculateOffset(it.ability.ability) || 0) * 1000);
          const end = new Date((start.valueOf() as number) + this.calcDuration(it.start, amap) * 1000);
          const id = this.idgen.getNextId(M.EntryType.BuffMap) + "_" + it.id;
          const group = amap.isPartyDamage ? null : amap.job.id;
          return new HeatmapMap(this.presenterManager, id, group, { start, end });
        }
        return null;
      }).filter(it => it != null);
      this.holders.heatMaps.addRange(maps);
    }
  }

  switchInitialBossTarget(map: JobMap, addToUndoRedo: boolean): void {
    if (map.job.role === M.Role.Tank) {
      if (addToUndoRedo && this.holders.bossTargets.initialBossTarget !== map.id) {
        this.commandStorage.execute(new C.SwitchTargetCommand(this.holders.bossTargets.initialBossTarget, map.id));
      }
      else {
        this.holders.bossTargets.initialBossTarget = map.id;
      }
    }
  }

  calcDuration(start: Date, map: AbilityMap): number {
    const ability = map.ability;
    let duration = calculateDuration(ability);

    if (ability.relatedAbilities && ability.relatedAbilities.affectedBy) {
      const foundItems = this.holders.itemUsages.filter(x => {
        const abilityMap = x.ability;
        return (!ability.relatedAbilities.parentOnly || abilityMap.job.id === map.job.id) &&
          ability.relatedAbilities.affectedBy.some(value => value === abilityMap.ability.name);
      }
      ).sort((a, b) => (a.startAsNumber) - (b.startAsNumber));

      if (foundItems.length > 0) {
        const difference = foundItems.map((found) => {
          const diff = Math.round((found.startAsNumber - start.valueOf()) / 1000);
          if (diff >= 0 && diff < duration) {
            return diff;
          }
          return duration;
        }).reduce((a, b) => a < b ? a : b);


        if (difference >= 0 && difference < duration) {
          duration = difference;
        }
      }
    }

    if (ability.extendDurationOnNextAbility !== undefined) {
      const items = this.holders.bossAttacks
        .filter((x: BossAttackMap) => x.isTankBuster && x.start >= start)
        .sort((a, b) => (a.startAsNumber) - (b.startAsNumber));

      if (items.length > 0) {
        const found = items[0];
        const difference = Math.round((found.startAsNumber - start.valueOf()) / 1000);
        if (difference <= 0) { // todo: fix duration calcualtion
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
    return _.range(count).map(index => new C.AddAbilityCommand(this.idgen.getNextId(M.EntryType.AbilityUsage),
      null,
      map.job.id,
      map.ability.name,
      new Date(maxValue.valueOf() + (index * map.ability.cooldown * 1000)),
      false,
      null));
  }

  // splitStance(id: string, time: any) {
  //   const stance = this.holders.stances.get(id);
  //   if (stance) {
  //     this.commandStorage.execute(new C.CombinedCommand([
  //       new C.MoveStanceCommand(id, stance.start, new Date(time.valueOf() as number - 1000)),
  //       new C.AddStanceCommand(this.idgen.getNextId(M.EntryType.StanceUsage),
  //         stance.ability.job.id,
  //         stance.stanceAbility.name,
  //         time,
  //         this.holders.stances.getNext(time),
  //         false)
  //     ]));
  //   }
  // }

  // fillStance(id: string) {
  //   const stance = this.holders.stances.get(id);
  //   if (stance) {
  //     const next = this.holders.stances.getNext(stance.end);
  //     const prev = this.holders.stances.getPrev(stance.start);
  //     if (next !== stance.end || prev !== stance.start) {
  //       this.commandStorage.execute(new C.CombinedCommand([
  //         new C.MoveStanceCommand(id, prev, next)
  //       ]));
  //     }
  //   }
  // }


  copy(ids: string[]) {
    const ba = this.holders.bossAttacks.getByIds(ids).map(t => Utils.clone(t.attack));
    localStorage.setItem("copypaste", JSON.stringify(ba));
  }

  paste(time: any) {
    const containerString = localStorage.getItem("copypaste");
    if (containerString) {
      const container = JSON.parse(containerString);
      if (container) {
        const copy = container as M.IBossAbility[];

        const minOffset = _.min(copy.map(c => Utils.getDateFromOffset(c.offset).valueOf()));

        const locals = copy.map(c => {
          const originalOffset = Utils.getDateFromOffset(c.offset).valueOf() - minOffset;
          c.offset = Utils.formatTime(new Date(time.valueOf() + originalOffset));
          return new C.AddBossAttackCommand(this.idgen.getNextId(M.EntryType.BossAttack), c);
        });
        const cmd = new C.AddBatchAttacksCommand(locals);
        this.commandStorage.execute(cmd);

      }
    }
  }

  toggleJobCompactView(jobId: string): void {
    const job = this.holders.jobs.get(jobId);
    if (!job) { return; }
    this.setJobCompactView(jobId, !job.isCompact);
  }

  setJobCompactView(jobId: string, value?: boolean) {
    const job = this.holders.jobs.get(jobId);
    if (!job) { return; }
    if (value !== undefined) {
      this.presenterManager.setJobCompact(job.id, value);
    }
    job.applyData();
    this.holders.jobs.update([job]);
    const abs = this.holders.abilities.getByParentId(jobId);
    abs.forEach(ab => {
      ab.applyData();
      const its = this.holders.itemUsages.getByAbility(ab.id);
      its.forEach(it => {
        it.applyData();
      });
      this.holders.itemUsages.update(its);
    });
    this.holders.abilities.update(abs);
  }

  hideAbility(group: string) {
    const map = this.holders.abilities.get(group);
    if (map) {
      this.presenterManager.setHiddenAbility(map.job.id, map.ability.name, true);
      this.updateBuffHeatmap(this.presenterManager.view.buffmap, map.ability);
      map.applyData();
      this.holders.abilities.update([map]);
    }
  }

  clearAbility(group: string) {
    const map = this.holders.abilities.get(group);
    if (map) {
      const abs = this.holders.itemUsages.getByAbility(group);
      this.handleDelete(abs.map(a => a.id));
      this.updateBuffHeatmap(this.presenterManager.view.buffmap, map.ability);
    }
  }

  showAbility(group: string) {
    const map = this.holders.abilities.get(group);
    if (map) {
      this.presenterManager.setHiddenAbility(map.job.id, map.ability.name, false);
      this.updateBuffHeatmap(this.presenterManager.view.buffmap, map.ability);
      map.applyData();
      this.holders.abilities.update([map]);
    }
  }

  visibleFrameTemplate(item: DataItem): string {
    if (item == null) { return ""; }
    if (!this.idgen.isAbilityUsage(item.id)) { return ""; }
    const map = this.holders.abilities.get(item.group);
    if (!map) { return ""; }
    const usageMap = this.holders.itemUsages.get(item.id as string);
    const ability = map.ability;

    const offset = calculateOffset(ability) || 0;
    const offsetPercentage = (offset / ability.cooldown) * 100;

    const duration = this.calcDuration(new Date(item.start), map);
    // TODO: recalcualte percentage based of changed cooldown
    const percentage = (duration / (ability.cooldown)) * 100;
    const firstAbilityType = Object
      .keys(M.AbilityType)
      .filter(it => (ability.abilityType & M.AbilityType[it]) === M.AbilityType[it])[0];
    const color = this.colorSettings[firstAbilityType];
    const hasNote = usageMap.hasNote;

    return this.createItemUsageFrame(
      offsetPercentage,
      [{
        percentage,
        color: this.presenterManager.view.colorfulDurations && color || ""
      }],
      hasNote
    );
  }

  createItemUsageFrame(offsetPercentage: number, items: { percentage: number, color: string }[], hasNote: boolean): string {
    const noteAttribute = hasNote ? "note" : "";
    const parts = items.reduce((acc, it) => acc += `<div class="progress-fl" style="width:${it.percentage}%;background-color:${it.color}"> </div>`, "");
    return `
      <div class="progress-wrapper-fl ${noteAttribute}">
        <div class="progress-fl-offset" style = "width:${offsetPercentage}%"></div>
        ${parts}
      </div >
    `;
  }

  tooltipOnItemUpdateTime(item: DataItem): string {
    if (this.idgen.isStanceUsage(item.id)) {
      return Utils.formatTime(item.start as Date) + " - " + Utils.formatTime(item.end as Date);
    }
    if (!this.idgen.isAbilityUsage(item.id) && !this.idgen.isBossAttack(item.id)) { return undefined; }
    return Utils.formatTime(item.start as Date);
  }

  handleDelete(selected: (IdType)[]): void {
    const toRemove = [
      ...this.holders.itemUsages.getByIds(selected).map(x => x.id),
      ...this.holders.stances.getByIds(selected).map(x => x.id),
      ...this.holders.bossAttacks.getByIds(selected).map(x => x.id)
    ];
    for (const r of toRemove) {
      this.notifyRemove(r, false);
    }
    this.commandBag.evaluate();
  }


  updateBoss(boss: M.IBoss): void {
    this.data.boss = boss;
  }

  updateFight(fight: M.IFight): void {
    this.data.fight = fight;
    this.hasChanges = false;
  }


  loadFight(fight: M.IFight, loadedData: SerializeController.IFightSerializeData, commands?: ICommandData[]): void {

    if (!fight) { return; }

    try {
      this.loading = true;
      this.commandStorage.turnOffFireExecuted();

      this.data.fight = fight;
      this.data.importedFrom = loadedData?.importedFrom;

      this.holders.jobs.clear();
      this.holders.abilities.clear();
      this.holders.itemUsages.clear();
      this.holders.heatMaps.clear();
      this.holders.bossTargets.clear();
      this.commandStorage.clear();

      if (loadedData?.boss) {
        this.holders.bossAttacks.clear();
        this.loadBoss(loadedData.boss);
        this.holders.bossAttacks.applyFilter(loadedData.filter.attacks);
      }

      if (loadedData?.jobs) {
        for (const j of loadedData.jobs.sort((a, b) => b.order - a.order)) {
          const jid = this.addJob(j.id, j.name, null, j.pet, j.collapsed, false);
        }
      }

      if (loadedData?.initialTarget) {
        const jobMap = this.holders.jobs.get(loadedData.initialTarget);
        if (jobMap) {
          this.switchInitialBossTarget(jobMap, false);
        }
      }

      if (loadedData?.abilities) {
        for (const a of loadedData.abilities) {
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
      }

      if (commands) {
        commands.forEach((c) => {
          this.handleRemoteCommandData(c);
        });
      }

      this.recalculateBossTargets();

    } finally {
      this.loading = false;
    }

    this.applyFilter();
    this.applyView(loadedData.view, true);

    this.commandStorage.turnOnFireExecuted();
    this.hasChanges = this.commandStorage.canRedo() || this.commandStorage.canUndo();
  }

  addDownTime(window: { start: Date; startId: string, end: Date, endId: string }, color: string, comment: string = ""): void {
    this.commandStorage.execute(new C.AddDowntimeCommand(this.idgen.getNextId(M.EntryType.BossDownTime),
      window,
      color, comment));
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


  applyFilter(input?: M.IFilter, source?: string): void {
    if (this.loading) { return; }

    // console.log("FTLC ApplyFilter");
    if (input) {
      this.presenterManager.filter = input;
    }

    if (source === "level") {
      this.gameService.jobRegistry.setLevel(this.presenterManager.fightLevel);
      this.holders.jobs.getAll().forEach(j => {
        j.job = this.gameService.jobRegistry.getJob(j.job.name);
      });
    }

    if (!source || source === 'ability' || source === "level") {
      if (this.presenterManager.filter?.abilities) {
        this.holders.abilities.applyFilter(
          (val) => this.holders.itemUsages.getAll().some((item) => item.ability.id === val)
        );
      }
    }

    if (!source || source === 'boss' || source === "level") {
      if (this.presenterManager.filter?.attacks) {
        this.holders.bossAttacks.applyFilter(this.presenterManager.filter.attacks);
      }
    }

    if (source === "level") {
      this.holders.itemUsages.refresh();
    }

    this.updateBuffHeatmap(this.presenterManager.view.buffmap, null);
  }

  importFromFFLogs(key: string, parser: Parser.Parser): any {

    try {
      this.data.importedFrom = key;
      this.loading = true;
      const settings = this.settingsService.load();

      const importController = new ImportController.ImportController(
        this.idgen,
        this.holders,
        this.gameService.jobRegistry);
      const importCommand = importController.buildImportCommand(settings, parser, this.startDate);

      this.commandStorage.execute(importCommand);

    } catch (e) {
      console.error(e);
    } finally {
      this.holders.bossTargets.initialBossTarget = "boss";
      this.recalculateBossTargets();

      this.loading = false;

      this.applyView(this.presenterManager.view, true);
      this.applyFilter();
    }
  }

  importAttacksFromFFLogs(key: string, parser: Parser.Parser): void {

    try {
      this.data.importedFrom = key;
      this.loading = true;
      const settings = this.settingsService.load();

      const importController = new ImportController.ImportController(
        this.idgen,
        this.holders,
        this.gameService.jobRegistry);
      const importCommand = importController.buildImportBossAttacksCommand(settings, parser, this.startDate);

      this.commandStorage.execute(importCommand);

    } catch (e) {
      console.error(e);
    } finally {
      this.holders.bossTargets.initialBossTarget = "boss";
      this.recalculateBossTargets();

      this.loading = false;

      this.applyView(this.presenterManager.view, true);
      this.applyFilter();
    }
  }

  applyView(view: M.IView, force?: boolean): void {
    // console.log("FTLC ApplyView");

    if (!this.viewCopy) {
      this.viewCopy = this.presenterManager.view;
    }

    view = view || this.viewCopy;
    if (this.presenterManager.view.ogcdAsPoints !== this.viewCopy.ogcdAsPoints || force) {
      const items = this.holders.itemUsages.getAll();
      items.forEach(x => {
        const map = x.ability;
        // todo: check duration works here
        if (map.ability.statuses?.length === 0 && (map.hasValue(M.AbilityType.Damage) || !!map.ability.charges)) {
          x.applyData({ ogcdAsPoints: view.ogcdAsPoints });
        }
      });
      this.holders.itemUsages.update(items);
    }

    if (this.presenterManager.view.buffmap !== this.viewCopy.buffmap || force) {
      this.updateBuffHeatmap(view.buffmap, null);
    }

    if (this.presenterManager.view.showDowntimesInPartyArea !== this.viewCopy.showDowntimesInPartyArea || force) {
      this.holders.bossDownTime.setShowInPartyArea(view.showDowntimesInPartyArea);
    }

    if (this.presenterManager.view.verticalBossAttacks !== this.viewCopy.verticalBossAttacks || force) {
      this.holders.bossAttacks.setVertical(view.verticalBossAttacks);
    }

    if (this.presenterManager.view.compactView !== this.viewCopy.compactView || force) {
      this.refreshCompactView();
    }

    if (this.presenterManager.view.highlightLoaded !== this.viewCopy.highlightLoaded || force) {
      this.setHighLightLoadedView(view.highlightLoaded);
    }

    if (this.presenterManager.view.showAbilityAvailablity !== this.viewCopy.showAbilityAvailablity || force) {
      this.availabilityController.setAbilityAvailabilityView(view.showAbilityAvailablity);
    }

    this.viewCopy = Object.assign({}, this.presenterManager.view);
  }




  isJobGroup(group: string): boolean {
    return !!this.holders.jobs.get(group);
  }

  moveBossAttack(item: DataItem): void {
    this.holders.bossAttacks.sync(item.id.toString(), new Date(item.start));
  }

  moveSelection(delta: number, selection: string[]): void {
    const items = selection;
    if (items && items.length) {
      const ids = items;
      const toMove: (IMoveable & { id: string, start: Date, ability?: AbilityMap, end?: Date })[] = [
        ...this.holders.itemUsages.getByIds(ids),
        ...this.holders.stances.getByIds(ids),
        ...this.holders.bossAttacks.getByIds(ids)
      ];

      const itom: any[] = [];
      for (const r of toMove) {
        const newDate = new Date(new Date(r.start).valueOf() as number + delta * 1000);
        const newDateEnd = r.end && new Date(new Date(r.end).valueOf() as number + delta * 1000);
        const item = { id: r.id, start: newDate, end: newDateEnd, group: r.ability && r.ability.id, content: null } as DataItem;
        if (this.canMove(item, selection)) {
          r.move(delta);
          itom.push(item);
        }
      }
      if (itom.length) {
        this.notifyMove(itom);
      }
    }
  }

  execute(data: ICommandData): void {
    if (data.name === "undo") {
      this.undo();
    } else if (data.name === "redo") {
      this.redo();
    } else {
      const command = this.commandFactory.createFromData(data, this.presenterManager.view);
      if (command) {
        // console.log("Executing command: " + data.name)
        this.commandStorage.execute(command, false);
        this.hasChanges = true;
      }
    }
  }

  refreshCompactView(): void {
    this.holders.jobs.getAll().forEach(it => {
      this.setJobCompactView(it.id);
    });
  }

  toggleCompactViewAbility(id: string): void {
    const it = this.holders.abilities.get(id);
    if (it) {
      this.presenterManager.setAbilityCompact(it.job.id, it.ability.name, !it.isCompact);
      it.applyData();
      this.holders.abilities.update([it]);
      const abs = this.holders.itemUsages.getByAbility(id);
      abs.forEach(ab => ab.applyData());
      this.holders.itemUsages.update(abs);
    }
  }

  setHighLightLoadedView(highlightLoaded: boolean): void {
    this.holders.setHighLightLoadedView(highlightLoaded);
  }

  toggleJobCollapsed(jobId) {
    const j = this.holders.jobs.get(jobId);
    this.presenterManager.setJobCollapsed(jobId, !j.collapsed);
    j.applyData();
    this.holders.jobs.update([j]);
    const abs = this.holders.abilities.getByParentId(jobId);
    abs.forEach(ab => ab.applyData());
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

  handleRemoteCommandData(data: ICommandData) {
    if (data.name === "undo") {
      this.undo();
    } else if (data.name === "redo") {
      this.redo();
    } else {
      this.execute(data);
    }
  }

  createSerializer(): SerializeController.SerializeController {
    const ctr = new SerializeController.SerializeController(
      this.holders,
      this.gameService.name,
      this.fraction,
      this.data,
      this.presenterManager.filter,
      this.presenterManager.view);
    return ctr;
  }

  updateAbilitySettings(id: string, settings: any) {
    this.commandStorage.execute(new C.ChangeAbilitySettingsCommand(id, settings));
  }
}


export interface IDialogs {
  openBossAttackAddDialog: (
    bossAbility: M.IBossAbility | {},
    callBack: (b: { updateAllWithSameName: boolean, data: M.IBossAbility }) => void
  ) => void;
}
