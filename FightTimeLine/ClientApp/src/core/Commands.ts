import { Command, ICommandExecutionContext, ICommandData } from "./UndoRedo";
import { IAbility, IBossAbility, ISettingData, Role, EntryType, IJobStats, IPresetTemplate } from "./Models";
import { Utils } from "./Utils";
import { Guid } from "guid-typescript";
import { AbilityMap, AbilityUsageMap, JobMap, BossAttackMap, BossDownTimeMap, JobStanceMap } from "./Maps/index";
import { calculateDuration } from "./Durations";


interface IAbilityWithUsages { map: AbilityMap; usages: AbilityUsageMap[]; }

export class CombinedCommand extends Command {
  serialize(): ICommandData {
    return {
      name: "combined",
      params: {
        commands: this.actions.map((it) => it.serialize())
      }
    };
  }

  constructor(private actions: Command[]) {
    super();
  }

  reverse(context: ICommandExecutionContext): void {
    [...this.actions].reverse().forEach((it: Command) => it.reverse(context));
  }

  execute(context: ICommandExecutionContext): void {
    this.actions.forEach((it: Command) => it.execute(context));
  }

}

export class AddJobCommand extends Command {

  constructor(
    private id: string,
    private jobName: string,
    private actorName: string,
    private prevBossTarget: string,
    private doUpdates: boolean,
    private pet: string,
    private collapsed: boolean) {
    super();
  }

  serialize(): ICommandData {
    return {
      name: "addJob",
      params: {
        id: this.id,
        jobName: this.jobName,
        prevBossTarget: this.prevBossTarget,
        doUpdates: this.doUpdates,
        actorName: this.actorName,
        pet: this.pet
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    const abilities = context.holders.abilities.getByParentId(this.id);
    for (const sg of abilities) {
      context.holders.abilities.remove([sg.id]);
    }
    // const job = context.holders.jobs.get(this.id);
    context.holders.jobs.remove([this.id]);

    // this.filter = job.filter;

    context.holders.bossTargets.initialBossTarget = this.prevBossTarget;

    context.update({ updateBossTargets: true, updateBossAttacks: true });
  }

  execute(context: ICommandExecutionContext): void {
    if (!this.id) {
      this.id = context.idGen.getNextId(EntryType.Job);
    }
    const job = context.jobRegistry.getJob(this.jobName);
    const abilityIds = [];
    let index = 0;

    const map = {
      id: this.id,
      job,
      actorName: this.actorName,
      isCompactView: context.isCompactView(),
      collapsed: this.collapsed
    };
    const jobMap = new JobMap(context.presenter, map.id, map.job, { actorName: map.actorName }, this.pet);


    if (job.stances && job.stances.length) {
      const nextId = this.id + "_" + index;
      abilityIds.push(new AbilityMap(
        context.presenter,
        nextId,
        jobMap,
        null,
        true,
        {}
      ));
      index++;
    }

    for (const a of Object.keys(job.abilities)) {
      const nextId = this.id + "_" + index;
      abilityIds.push(new AbilityMap(context.presenter, nextId, jobMap, a, false, {}));
      index++;
    }

    context.holders.jobs.add(jobMap);
    context.holders.abilities.addRange(abilityIds);


    if ((context.holders.bossTargets.initialBossTarget === undefined || context.holders.bossTargets.initialBossTarget === "boss")
      && map.job.role === Role.Tank) {
      context.holders.bossTargets.initialBossTarget = this.id;
    }

    if (this.doUpdates) {
      context.update({ updateBossTargets: true });
    }
  }
}

export class RemoveJobCommand extends Command {
  private storedData: { abilityMaps?: IAbilityWithUsages[], jobMap?: JobMap, wasBossTarget?: boolean } = {};

  constructor(private id: string) {
    super();
  }

  serialize(): ICommandData {
    return {
      name: "removeJob",
      params: {
        id: this.id
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {

    const abilityMaps = this.storedData.abilityMaps;
    const jobMap = this.storedData.jobMap as JobMap;
    context.holders.jobs.add(jobMap);

    abilityMaps.forEach((it: IAbilityWithUsages) => {
      it.map.applyData({});
      context.holders.abilities.add(it.map);
      it.usages.forEach((x) => {
        context.holders.itemUsages.add(new AbilityUsageMap(context.presenter, x.id, it.map, x.settings,
          {
            start: x.start,
            loaded: x.loaded,
            showLoaded: context.highlightLoaded(),
            ogcdAsPoints: context.ogcdAttacksAsPoints(it.map.ability),
          }));
      });
    });

    if (this.storedData.wasBossTarget) {
      context.holders.bossTargets.initialBossTarget = jobMap.id;
    }

    context.update({ updateBossAttacks: true, updateBossTargets: true });
  }

  execute(context: ICommandExecutionContext): void {
    const abilitiesToStore: Array<IAbilityWithUsages> = [];
    const abilities = context.holders.abilities.getByParentId(this.id);
    const job = context.holders.jobs.get(this.id);

    for (const ab of abilities) {

      const abs = context.holders.itemUsages.getByAbility(ab.id);
      abilitiesToStore.push({
        map: ab,
        usages: abs
      } as IAbilityWithUsages);

      context.holders.itemUsages.remove(abs.map(value => value.id));
      context.holders.abilities.remove([ab.id]);
    }

    this.storedData.abilityMaps = abilitiesToStore;
    this.storedData.jobMap = job;

    context.holders.jobs.remove([this.id]);

    if (context.holders.bossTargets.initialBossTarget === this.id) {
      this.storedData.wasBossTarget = true;
      context.holders.bossTargets.initialBossTarget = "boss";
    }

    context.update({ updateBossAttacks: true, updateBossTargets: true });

  }
}

export class AddBossAttackCommand extends Command {

  constructor(private id: string, private bossAbility: IBossAbility) {
    super();
  }

  serialize(): ICommandData {
    return {
      name: "addBossAttack",
      params: {
        id: this.id,
        attack: this.bossAbility
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    context.holders.bossAttacks.remove([this.id]);
    context.update({ updateBossTargets: true, updateIntersectedWithBossAttackAtDate: Utils.getDateFromOffset(this.bossAbility.offset) });
  }

  execute(context: ICommandExecutionContext): void {
    context.holders.bossAttacks.add(new BossAttackMap(
      context.presenter,
      this.id,
      {
        attack: this.bossAbility,
        vertical: context.verticalBossAttacks()
      }
    ));
    context.addTags(this.bossAbility.tags);
    context.addSources(this.bossAbility.source);
    context.update({
      updateBossAttacks: [this.id],
      updateBossTargets: true,
      updateIntersectedWithBossAttackAtDate: Utils.getDateFromOffset(this.bossAbility.offset)
    });
  }
}

export class RemoveBossAttackCommand extends Command {
  private bossAbility: IBossAbility;
  constructor(private id: string, private updateAttacks: boolean) {
    super();
  }

  serialize(): ICommandData {
    return {
      name: "removeBossAttack",
      params: {
        id: this.id,
        updateAttacks: this.updateAttacks
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    context.holders.bossAttacks.add(new BossAttackMap(
      context.presenter,
      this.id,
      {
        attack: this.bossAbility,
        vertical: context.verticalBossAttacks()
      }));

    context.update({
      updateBossAttacks: [this.id],
      updateIntersectedWithBossAttackAtDate: Utils.getDateFromOffset(this.bossAbility.offset)
    });
  }

  execute(context: ICommandExecutionContext): void {
    const map = context.holders.bossAttacks.get(this.id);
    this.bossAbility = map.attack;
    context.holders.bossAttacks.remove([this.id]);
    context.update({ updateIntersectedWithBossAttackAtDate: Utils.getDateFromOffset(this.bossAbility.offset), updateBossTargets: true });
  }
}

export class ChangeBossAttackCommand extends Command {
  private prevDatas: string;

  constructor(private id: string, private bossAbility: IBossAbility, private updateAllWithSameName: boolean) {
    super();
  }

  serialize(): ICommandData {
    return {
      name: "changeBossAttack",
      params: {
        id: this.id,
        attack: this.bossAbility,
        updateAllWithSameName: this.updateAllWithSameName
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    const pbossAttackMaps = JSON.parse(this.prevDatas) as BossAttackMap[];

    const prevData = context.holders.bossAttacks.get(this.id);
    const bossAttackMaps = this.updateAllWithSameName
      ? context.holders.bossAttacks.getByName(prevData.attack.name)
      : [prevData];

    bossAttackMaps.forEach((it) => {
      const data = { attack: pbossAttackMaps.find(v => v.id === it.id).attack };
      it.applyData(data);
    });

    context.holders.bossAttacks.update(bossAttackMaps);
    context.update({ updateBossAttacks: [this.id], updateBossTargets: true });
  }

  execute(context: ICommandExecutionContext): void {
    const prevData = context.holders.bossAttacks.get(this.id);
    const bossAttackMaps = this.updateAllWithSameName ? context.holders.bossAttacks.getByName(prevData.attack.name) : [prevData];
    this.prevDatas = JSON.stringify(bossAttackMaps.filter(v => !!v).map(v => {
      return { id: v.id, attack: v.attack };
    }));

    bossAttackMaps.forEach((it) => {
      if (it) {
        if (it.id === this.id) {
          it.applyData({ attack: this.bossAbility });
        }
        else {
          it.applyData({
            attack: {
              ...this.bossAbility,
              fflogsAttackSource: it.attack.fflogsAttackSource,
              fflogsData: it.attack.fflogsData,
              offset: it.attack.offset
            }
          });
        }

        context.addTags(this.bossAbility.tags);
        context.addSources(this.bossAbility.source);
      }
    });

    context.holders.bossAttacks.update(bossAttackMaps);
    context.update({ updateBossAttacks: [this.id], updateBossTargets: true });
  }
}

export class MoveCommand extends Command {
  private moveFrom: Date;
  private ability: IAbility;

  constructor(private id: string, private moveTo: Date) {
    super();
  }

  serialize(): ICommandData {
    return {
      name: "moveAbility",
      params: {
        id: this.id,
        moveTo: Utils.formatTime(this.moveTo)
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    const item = context.holders.itemUsages.get(this.id);
    if (item === undefined || item === null) { return; }

    const duration = calculateDuration(this.ability);
    const affectedAttacks = [
      ...context.holders.bossAttacks.getAffectedAttacks(item.start as Date, duration),
      ...context.holders.bossAttacks.getAffectedAttacks(this.moveTo as Date, duration)
    ];

    if (item.start !== this.moveFrom) {
      item.applyData({
        start: this.moveFrom,
      });

      context.holders.itemUsages.update([item]);
    }

    context.update({
      abilityChanged: context.holders.itemUsages.get(this.id).ability,
      updateBossAttacks: affectedAttacks
    });
  }

  execute(context: ICommandExecutionContext): void {
    const item = context.holders.itemUsages.get(this.id);
    if (item === undefined || item === null) { return; }

    this.moveFrom = item.start;
    this.ability = context.holders.itemUsages.get(this.id).ability.ability;
    //    console.log(`Moving to ${this.moveTo.toString()} from ${this.moveFrom.toString()}`);

    const duration = calculateDuration(this.ability);
    const affectedAttacks = [
      ...context.holders.bossAttacks.getAffectedAttacks(item.start as Date, duration),
      ...context.holders.bossAttacks.getAffectedAttacks(this.moveTo as Date, duration)
    ];
    if (item.start !== this.moveTo) {
      item.applyData({
        start: this.moveTo
      });
      context.holders.itemUsages.update([item]);
    }

    context.update({
      abilityChanged: item.ability,
      updateBossAttacks: affectedAttacks
    });
  }
}

interface IAddAbilityParams {
  id: string;
  jobGroup: string;
  abilityName: string;
  time: string;
  loaded: boolean;
  jobActor: string;
  settings: ISettingData[];
}
interface IAddBossAttackParams {
  id: string;
  attack: IBossAbility;
}

export class AddBatchAttacksCommand extends Command {

  constructor(private commands: AddBossAttackCommand[]) {
    super();
  }

  reverse(context: ICommandExecutionContext): void {
    const items = this.commands.map(it => {
      const params = it.serialize().params as IAddBossAttackParams;
      return params.id;
    });
    context.holders.bossAttacks.remove(items);
  }

  execute(context: ICommandExecutionContext): void {
    const items = this.commands.map(it => {
      const params = it.serialize().params as IAddBossAttackParams;
      context.addTags(params.attack.tags);
      context.addSources(params.attack.source);
      return new BossAttackMap(
        context.presenter,
        params.id,
        {
          attack: params.attack,
          vertical: context.verticalBossAttacks()
        }
      );
    });

    context.holders.bossAttacks.addRange(items);
  }

  serialize(): ICommandData {
    return {
      name: "addBossAttackBatch",
      params: {
        commands: this.commands.map(it => it.serialize().params)
      }
    };
  }
}

export class AddBatchUsagesCommand extends Command {

  constructor(private commands: AddAbilityCommand[]) {
    super();
  }

  reverse(context: ICommandExecutionContext): void {
    const items = this.commands.map(it => {
      const params = it.serialize().params as IAddAbilityParams;
      return params.id;
    });

    context.holders.itemUsages.remove(items);
  }

  execute(context: ICommandExecutionContext): void {
    const items = this.commands.map(it => {
      const params = it.serialize().params as IAddAbilityParams;
      let jobMap: JobMap;
      if (params.jobActor) {
        jobMap = context.holders.jobs.getByActor(params.jobActor);
      }
      else {
        jobMap = context.holders.jobs.get(params.jobGroup);
      }

      const abilityMap = context.holders.abilities.getByParentAndAbility(jobMap.id, params.abilityName);

      const item = new AbilityUsageMap(context.presenter, params.id,
        abilityMap,
        params.settings,
        {
          start: Utils.getDateFromOffset(params.time),
          loaded: params.loaded,
          showLoaded: context.highlightLoaded(),
          ogcdAsPoints: context.ogcdAttacksAsPoints(abilityMap.ability)
        });
      return item;
    });

    context.holders.itemUsages.addRange(items);
  }

  serialize(): ICommandData {
    return {
      name: "useAbilityBatch",
      params: {
        commands: this.commands.map(it => it.serialize().params)
      }
    };
  }
}

export class AddAbilityCommand extends Command {

  constructor(
    private id: string,
    private jobActor: string,
    private jobGroup: string,
    private abilityName: string,
    private time: Date,
    private loaded: boolean,
    private settings: ISettingData[]) {
    super();
  }

  serialize(): ICommandData {
    return {
      name: "useAbility",
      params: {
        id: this.id,
        jobGroup: this.jobGroup,
        abilityName: this.abilityName,
        time: Utils.formatTime(this.time),
        loaded: this.loaded,
        jobActor: this.jobActor,
        settings: this.settings
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    const item = context.holders.itemUsages.get(this.id);
    context.holders.itemUsages.remove([this.id]);

    if (item) {
      context.update({
        abilityChanged: item.ability,
        updateBossAttacks: context.holders.bossAttacks.getAffectedAttacks(
          this.time,
          calculateDuration(item.ability.ability))
      });
    }
  }

  execute(context: ICommandExecutionContext): void {
    if (!this.id) {
      this.id = context.idGen.getNextId(EntryType.AbilityUsage);
    }
    let jobMap: JobMap;
    if (this.jobActor) {
      jobMap = context.holders.jobs.getByActor(this.jobActor);
    }
    else {
      jobMap = context.holders.jobs.get(this.jobGroup);
    }

    const abilityMap = context.holders.abilities.getByParentAndAbility(jobMap.id, this.abilityName);

    const item = new AbilityUsageMap(context.presenter, this.id,
      abilityMap,
      this.settings,
      {
        start: this.time,
        loaded: this.loaded,
        showLoaded: context.highlightLoaded(),
        ogcdAsPoints: context.ogcdAttacksAsPoints(abilityMap.ability)
      });

    if (abilityMap.ability.overlapStrategy.check({
      ability: abilityMap.ability,
      holders: context.holders,
      id: this.id,
      group: abilityMap.id,
      start: item.start,
      end: item.end,
      selectionRegistry: null
    })) {
      return;
    }

    context.holders.itemUsages.add(item);

    context.update({
      abilityChanged: item.ability,
      updateBossAttacks: context.holders.bossAttacks.getAffectedAttacks(
        this.time,
        calculateDuration(abilityMap.ability))
    });
  }
}

export class RemoveAbilityCommand extends Command {

  private ability: IAbility;
  private time: Date;
  private abilityMapId: string;
  private loaded: boolean;
  private settings: any[];

  constructor(private id: string, private updateBossAttack: boolean) {
    super();
  }

  serialize(): ICommandData {
    return {
      name: "removeAbility",
      params: {
        id: this.id,
        updateBossAttack: this.updateBossAttack
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    const amap = context.holders.abilities.get(this.abilityMapId);

    context.holders.itemUsages.add(new AbilityUsageMap(context.presenter, this.id, amap, this.settings,
      {
        start: this.time,
        loaded: this.loaded,
        showLoaded: context.highlightLoaded(),
        ogcdAsPoints: context.ogcdAttacksAsPoints(this.ability)
      }));
    context.update({
      abilityChanged: amap,
      updateBossAttacks: context.holders.bossAttacks.getAffectedAttacks(
        this.time as Date,
        calculateDuration(this.ability))
    });
  }

  execute(context: ICommandExecutionContext): void {

    const item = context.holders.itemUsages.get(this.id);
    this.ability = item.ability.ability;
    this.abilityMapId = item.ability.id;
    this.time = item.start;
    this.loaded = item.loaded;
    this.settings = item.settings;
    context.holders.itemUsages.remove([this.id]);
    context.update({
      abilityChanged: item.ability,
      updateBossAttacks: context.holders.bossAttacks.getAffectedAttacks(item.start as Date, item.calculatedDuration)
    });
  }
}

export class SwitchTargetCommand extends Command {
  constructor(private prevTarget: string, private newTarget: string) {
    super();
  }

  serialize(): ICommandData {
    return {
      name: "switchTarget",
      params: {
        prevTarget: this.prevTarget,
        newTarget: this.newTarget
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    context.holders.bossTargets.initialBossTarget = this.prevTarget;
    context.update({ updateBossTargets: true });
  }

  execute(context: ICommandExecutionContext): void {
    context.holders.bossTargets.initialBossTarget = this.newTarget;
    context.update({ updateBossTargets: true });
  }
}

export class ChangeJobStats extends Command {
  private prevData: string;

  constructor(private id: string, private newData: IJobStats) {
    super();
  }

  reverse(context: ICommandExecutionContext): void {
    const job = context.holders.jobs.get(this.id);
    job.applyData({ stats: JSON.parse(this.prevData) });
  }
  execute(context: ICommandExecutionContext): void {
    const job = context.holders.jobs.get(this.id);
    this.prevData = JSON.stringify(job.stats || {});
    job.applyData({ stats: this.newData });
  }

  serialize(): ICommandData {
    return {
      name: "changeJobStats",
      params: {
        id: this.id,
        newData: JSON.stringify(this.newData)
      }

    };
  }

}

export class ChangeAbilitySettingsCommand extends Command {
  private prevSettings: string;

  serialize(): ICommandData {
    return {
      name: "changeAbilitySettings",
      params: {
        id: this.id,
        newSettings: this.newSettings
      }
    };
  }

  constructor(private id: string, private newSettings: any) {
    super();
    this.newSettings = JSON.stringify(newSettings);
  }

  reverse(context: ICommandExecutionContext): void {
    const item = context.holders.itemUsages.get(this.id);
    item.settings = JSON.parse(this.prevSettings);

    context.holders.itemUsages.update([item]);

    context.update({ updateBossTargets: true });
  }

  execute(context: ICommandExecutionContext): void {
    const item = context.holders.itemUsages.get(this.id);
    this.prevSettings = JSON.stringify(item.settings);
    let settings = JSON.parse(this.newSettings);
    if (typeof settings === "string") {
      settings = JSON.parse(settings);
    }
    item.settings = settings;
    context.holders.itemUsages.update([item]);

    context.update({ updateBossTargets: true });
  }
}

export type DowntimeData = { start: Date; startId: string; end: Date; endId: string };

export class AddDowntimeCommand extends Command {

  serialize(): ICommandData {
    return {
      name: "addDowntime",
      params: {
        id: this.id,
        start: Utils.formatTime(this.data.start),
        end: Utils.formatTime(this.data.end),
        color: this.color,
        comment: this.comment
      }
    };
  }

  constructor(private id: string, private data: DowntimeData, private color: string, private comment: string) {
    super();
  }

  reverse(context: ICommandExecutionContext): void {
    context.holders.bossDownTime.remove([this.id]);
    context.update({ updateDowntimeMarkers: true });
  }

  execute(context: ICommandExecutionContext): void {


    context.holders.bossDownTime.add(new BossDownTimeMap(context.presenter, this.id,
      this.data.startId || Guid.create().toString(),
      this.data.endId || Guid.create().toString(),
      {
        start: this.data.start,
        end: this.data.end,
        color: this.color || "",
        comment: this.comment || ""
      }));

    context.update({ updateDowntimeMarkers: true });
  }
}

export class ChangeDowntimeCommand extends Command {

  private prevStartDate: Date;
  private prevEndDate: Date;

  constructor(private id: string, private start: Date, private end: Date) {
    super();
  }

  serialize(): ICommandData {

    return {
      name: "changeDowntime",
      params: {
        id: this.id,
        start: Utils.formatTime(this.start),
        end: Utils.formatTime(this.end)
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    const value = context.holders.bossDownTime.get(this.id);

    value.applyData({ start: this.prevStartDate, end: this.prevEndDate });

    context.holders.bossDownTime.update([value]);

    context.update({ updateDowntimeMarkers: true });
  }

  execute(context: ICommandExecutionContext): void {
    const value = context.holders.bossDownTime.get(this.id);

    this.prevStartDate = value.start;
    this.prevEndDate = value.end;

    value.applyData({ start: this.start, end: this.end });

    context.holders.bossDownTime.update([value]);

    context.update({ updateDowntimeMarkers: true });
  }
}

export class ChangeDowntimeColorCommand extends Command {

  private prevColor: string;


  constructor(private id: string, private newColor: string) {
    super();
  }

  serialize(): ICommandData {

    return {
      name: "changeDowntimeColor",
      params: {
        id: this.id,
        newColor: this.newColor
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    const value = context.holders.bossDownTime.get(this.id);

    value.applyData({
      color: this.prevColor
    });

    context.holders.bossDownTime.update([value]);


    context.update({ updateDowntimeMarkers: true });
  }

  execute(context: ICommandExecutionContext): void {
    const value = context.holders.bossDownTime.get(this.id);

    this.prevColor = value.color;
    value.applyData({
      color: this.newColor
    });

    context.holders.bossDownTime.update([value]);

    context.update({ updateDowntimeMarkers: true });
  }
}

export class ChangeDowntimeCommentCommand extends Command {

  private comment: string;


  constructor(private id: string, private newComment: string) {
    super();
  }

  serialize(): ICommandData {

    return {
      name: "changeDowntimeComment",
      params: {
        id: this.id,
        newComment: this.newComment
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    const value = context.holders.bossDownTime.get(this.id);

    value.applyData({
      comment: this.comment
    });

    context.holders.bossDownTime.update([value]);


    context.update({ updateDowntimeMarkers: true });
  }

  execute(context: ICommandExecutionContext): void {
    const value = context.holders.bossDownTime.get(this.id);

    this.comment = value.comment;
    value.applyData({
      comment: this.newComment
    });

    context.holders.bossDownTime.update([value]);

    context.update({ updateDowntimeMarkers: true });
  }
}

export class RemoveDownTimeCommand extends Command {
  private data: { start: Date; startId: string, end: Date, endId: string };
  private prevColor: string;
  constructor(private id: string) {
    super();
  }

  serialize(): ICommandData {
    return {
      name: "removeDowntime",
      params: {
        id: this.id
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    context.holders.bossDownTime.add(new BossDownTimeMap(context.presenter, this.id, this.data.startId, this.data.endId,
      {
        start: this.data.start,
        end: this.data.end,
        color: this.prevColor
      }));

    context.update({ updateDowntimeMarkers: true });
  }

  execute(context: ICommandExecutionContext): void {
    const item = context.holders.bossDownTime.get(this.id);
    this.data = { start: item.start, startId: item.startId, end: item.end, endId: item.endId };
    this.prevColor = item.color;
    context.holders.bossDownTime.remove([this.id]);

    context.update({ updateDowntimeMarkers: true });
  }
}

export class SetJobPetCommand extends Command {
  private prevPet: string;

  constructor(private id: string, private pet: string) {
    super();
  }

  reverse(context: ICommandExecutionContext): void {
    const map = context.holders.jobs.get(this.id);
    map.pet = this.prevPet;

    context.update({ updateFilters: true });
  }

  execute(context: ICommandExecutionContext): void {
    const map = context.holders.jobs.get(this.id);
    this.prevPet = map.pet;
    map.pet = this.pet;

    context.update({ updateFilters: true });
  }

  serialize(): ICommandData {
    return {
      name: "setJobPet",
      params: {
        id: this.id,
        pet: this.pet
      }
    };
  }
}

export class AddStanceCommand extends Command {

  constructor(
    private id: string,
    private jobGroup: string,
    private abilityName: string,
    private start: Date,
    private end: Date,
    private loaded: boolean) {
    super();
  }

  reverse(context: ICommandExecutionContext): void {
    context.holders.stances.remove([this.id]);
  }

  execute(context: ICommandExecutionContext): void {
    const jobmap = context.holders.jobs.get(this.jobGroup);
    const stancesAbility = context.holders.abilities.getStancesAbility(this.jobGroup);
    const ability = jobmap.job.stances.find((it) => it.ability.name === this.abilityName).ability;

    context.holders.stances.add(new JobStanceMap(context.presenter, this.id, stancesAbility, ability,
      {
        start: this.start,
        end: this.end,
        loaded: this.loaded,
        showLoaded: context.highlightLoaded()
      }));
  }

  serialize(): ICommandData {
    return {
      name: "addStance",
      params: {
        id: this.id,
        jobGroup: this.jobGroup,
        abilityName: this.abilityName,
        start: Utils.formatTime(this.start),
        end: Utils.formatTime(this.end),
      }
    };
  }
}

export class RemoveStanceCommand extends Command {

  private ability: IAbility;
  private start: Date;
  private end: Date;
  private abilityMapId: string;
  private loaded: boolean;

  constructor(private id: string, private updateBossAttack: boolean) {
    super();
  }

  serialize(): ICommandData {
    return {
      name: "removeStance",
      params: {
        id: this.id,
        updateBossAttack: this.updateBossAttack,
        loaded: this.loaded
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    const abMap = context.holders.abilities.get(this.abilityMapId);
    context.holders.stances.add(new JobStanceMap(context.presenter, this.id, abMap, this.ability,
      {
        start: this.start,
        end: this.end,
        loaded: this.loaded,
        showLoaded: context.highlightLoaded()
      }));
  }

  execute(context: ICommandExecutionContext): void {
    const itemMap = context.holders.stances.get(this.id);

    this.ability = itemMap.stanceAbility;
    this.start = itemMap.start;
    this.end = itemMap.end;
    this.abilityMapId = itemMap.ability.id;
    this.loaded = itemMap.loaded;

    context.holders.stances.remove([this.id]);
  }
}

export class MoveStanceCommand extends Command {
  private moveStartFrom: Date;
  private moveEndFrom: Date;

  constructor(private id: string, private moveStartTo: Date, private moveEndTo: Date) {
    super();
  }

  serialize(): ICommandData {
    return {
      name: "moveStance",
      params: {
        id: this.id,
        moveStartTo: Utils.formatTime(this.moveStartTo),
        moveEndTo: Utils.formatTime(this.moveEndTo),
      }
    };
  }


  reverse(context: ICommandExecutionContext): void {
    const item = context.holders.stances.get(this.id);
    if (item === undefined || item === null) { return; }

    if (item.start !== this.moveStartFrom || item.end !== this.moveEndFrom) {
      item.applyData({
        start: this.moveStartFrom,
        end: this.moveEndFrom
      });

      context.holders.stances.update([item]);
    }
  }

  execute(context: ICommandExecutionContext): void {
    const item = context.holders.stances.get(this.id);
    if (item === undefined || item === null) { return; }

    this.moveStartFrom = item.start;
    this.moveEndFrom = item.end;

    if (item.start !== this.moveStartTo || item.end !== this.moveEndTo) {
      item.applyData({
        start: this.moveStartTo,
        end: this.moveEndTo
      });

      context.holders.stances.update([item]);
    }
  }
}

export class AttachPresetCommand extends Command {
  constructor(private id: string, private preset: IPresetTemplate) {
    super();
  }

  serialize(): ICommandData {
    return {
      name: "attachPreset",
      params: {
        id: this.id,
        preset: this.preset
      }
    };
  }

  get undoredo(): boolean {
    return false;
  }

  reverse(context: ICommandExecutionContext): void {
  }

  execute(context: ICommandExecutionContext): void {
    context.presenter.addPreset(this.id, this.preset);
  }
}


