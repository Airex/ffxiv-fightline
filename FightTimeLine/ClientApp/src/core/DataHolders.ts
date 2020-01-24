import * as M from "./Models";
import { ClassNameBuilder } from "./ClassNameBuilder";
import {DataSetDataItem, DataItem, DataSetDataGroup, DataGroup } from "vis-timeline"
import { Utils } from "./Utils";
import * as lod from "lodash";
import * as Shared from "./Jobs/FFXIV/shared";


interface IItemHolder<TI> {
  item: TI;
}

export interface IBaseHolderItem<TKey> {
  id: TKey;
}

export interface IMoveable {
  start: Date;
  move(delta: number): boolean;
}

abstract class BaseMap<TKey, TItem extends { className?: string }, TData> implements IBaseHolderItem<TKey> {
  id: TKey;
  protected item: TItem;
  protected data: TData = <TData>({});

  constructor(id: TKey, item?: TItem) {
    this.id = id;
    this.item = item;
  }

  protected buildClass(cls: { [value: string]: boolean }): string {
    const b = new ClassNameBuilder("");
    b.set(cls);
    return b.build() || "dummy";
  }

  applyData(data?: TData): void {
    if (data)
      this.data = lod.merge(this.data, data);
    this.onDataUpdate(this.data);
  }

  abstract onDataUpdate(data: TData): void;

  setItem(item: TItem): void {
    if (!this.item)
      this.item = item;
    else {
      Object.assign(this.item, item);
    }
  }
}

export interface ITimelineContainer {
  items: DataSetDataItem;
  groups: DataSetDataGroup;
}

export class Holders {
  itemUsages: AbilityUsageHolder;
  abilities: AbilitiesMapHolder;
  selectionRegistry: AbilitySelectionHolder;
  jobs: JobsMapHolder;
  bossAttacks: BossAttacksHolder;
  bossDownTime: BossDownTimeHolder;
  heatMaps: BuffHeatmapHolder;
  bossTargets: BossTargetHolder;
  stances: StancesHolder;
  abilityAvailability: AbilityAvailablityHolder;

  constructor(mainTimeLine: ITimelineContainer, bossTimeLine: ITimelineContainer) {
    this.itemUsages = new AbilityUsageHolder(mainTimeLine.items);
    this.abilities = new AbilitiesMapHolder(mainTimeLine.groups);
    this.selectionRegistry = new AbilitySelectionHolder();
    this.jobs = new JobsMapHolder(mainTimeLine.groups);
    this.bossAttacks = new BossAttacksHolder(bossTimeLine.items, mainTimeLine.items);
    this.bossDownTime = new BossDownTimeHolder(bossTimeLine.items, mainTimeLine.items);
    this.heatMaps = new BuffHeatmapHolder(mainTimeLine.items);
    this.bossTargets = new BossTargetHolder(mainTimeLine.items, "boss");
    this.stances = new StancesHolder(mainTimeLine.items);
    this.abilityAvailability = new AbilityAvailablityHolder(mainTimeLine.items);
  }

  setHighLightLoadedView(highlightLoaded: boolean): void {
    this.itemUsages.setHighlightLoaded(highlightLoaded);
    this.stances.setHighlightLoaded(highlightLoaded);
  }
}

export class AbilitySelectionMap extends BaseMap<string, DataItem, any> {
  onDataUpdate(data): void { }

  constructor(id: string, time: Date) {
    super(id);
    this.time = time;
  }
  time: Date;
}

export interface IAbilityMapData {
  hidden?: boolean;
  isCompact?: boolean;
  filtered?: boolean;
}
export class AbilityMap extends BaseMap<string, DataGroup, IAbilityMapData> {
  onDataUpdate(data: IAbilityMapData): void {
    this.setItem(this.isStance ? this.createStances(this.id, data.hidden) : this.createJobAbility(this.ability, this.id, data.isCompact, data.hidden || data.filtered));
  }

  constructor(id: string, job: JobMap, ability: M.IAbility, isStance: boolean, data?: IAbilityMapData) {
    super(id);
    this.job = job;
    this.ability = ability;
    this.isStance = isStance;

    this.applyData(Object.assign({ hidden: false, isCompact: false }, data) as IAbilityMapData);
  }

  job: JobMap;
  ability: M.IAbility;
  isStance: boolean;


  public getSettingOfType(type: string): M.IAbilitySetting {
    return this.ability.settings && this.ability.settings.find(it => it.type === type);
  }

  private hasValue(toCheck: M.AbilityType):boolean {
    return (this.ability.abilityType & toCheck) === toCheck;
  }

  private hasAnyValue(...toCheck: M.AbilityType[]): boolean {
    return toCheck.some(it=>this.hasValue(it));
  }

  public get isDef(): boolean {
    return this.isPartyDef || this.isSelfDef;
  }

  public get isSelfDef(): boolean {
    return this.hasValue(M.AbilityType.SelfDefense) || this.hasValue(M.AbilityType.SelfShield) || this.hasValue(M.AbilityType.TargetDefense);
  }

  public get isPartyDef(): boolean {
    return this.hasValue(M.AbilityType.PartyDefense) || this.hasValue(M.AbilityType.PartyShield);
  }

  public get isDamage(): boolean {
    return this.isSelfDamage || this.isPartyDamage;
  }

  public get isSelfDamage(): boolean {
    return this.hasValue(M.AbilityType.SelfDamageBuff);
  }

  public get isPartyDamage(): boolean {
    return this.hasValue(M.AbilityType.PartyDamageBuff);
  }

  createStances(id: string, hidden: boolean): DataGroup {
    const key: any = { sgDummy: true };
    key[`sg${id}`] = false;

    return <DataGroup>{
      id: id,
      visible: !hidden,
      subgroupStack: key,
      content: "Stance",
    }
  }

  createJobAbility(ability: M.IAbility, id: string, compact: boolean, hidden: boolean): DataGroup {
    const key: any = { sgDummy: true };
    key[`sg${id}`] = false;

    return {
      id: id,
      subgroupStack: key,
      className: this.buildClass({ compact: compact }),
      visible: !hidden,
      content: ability.icon
        ? `<span><img class='abilityIcon' src='${ability.icon}'/><span class='abilityName'>${ability.name}</span></span>`
        : ability.name,
    } as DataGroup;
  }

  get hidden(): boolean {
    return this.data.hidden;
  }

  get filtered(): boolean {
    return this.data.filtered;
  }

  get isCompact(): boolean {
    return this.data.isCompact;
  }
}

export interface IJobMapData {
  actorName?: string;
  collapsed?: boolean;
}
export class JobMap extends BaseMap<string, DataGroup, IJobMapData> {
  onDataUpdate(data: IJobMapData): void {
    if (this.abilityIds)
      this.setItem(this.createJob(this.job, data.actorName, this.id, this.abilityIds, data.collapsed));
  }

  static jobIndex = 0;

  constructor(id: string, job: M.IJob, data: IJobMapData, filter?: M.IAbilityFilter, pet?: string) {
    super(id);
    this.job = job;
    this.filter = filter ||
      {
        damage: undefined,
        selfDefence: undefined,
        partyDefence: undefined,
        healing: undefined,
        healingBuff: undefined,
        partyDamageBuff: undefined,
        selfDamageBuff: undefined,
        unused: undefined,
        pet: undefined,
        utility: undefined
      };
    this.pet = pet || job.defaultPet;
    this.applyData(data);
  }

  job: M.IJob;
  filter?: M.IAbilityFilter;
  pet: string;
  isCompact: boolean = false;

  get actorName(): string {
    return this.data.actorName || "";
  }

  getDisplayName(): string {
    return this.job.name + " " + this.data.actorName;
  }

  createJob(job: M.IJob, actorName: string, id: string, abilityIds: string[], collapsed: boolean): DataGroup {

    return <DataGroup>{
      id: id,
      subgroupStack: false,
      nestedGroups: abilityIds,
      content: `<img class='abilityIcon' src='${job.icon}'/><span class='jobName'>${job.name}<span>`,
      showNested: !collapsed,
      value: JobMap.jobIndex++,
      title: actorName,
    }
  }

  get collapsed(): boolean {
    return this.data.collapsed || false;
  }

  private abilityIds: string[];

  useAbilities(abilityIds: string[]) {
    this.abilityIds = abilityIds;
    this.applyData({});
  }

  detectAbility(event: any): { offset: number, name: string } {
    const data = this.job.abilities.map(a => a.detectStrategy.process(event)).filter(a => !!a);
    if (data.length > 1)
      throw Error("More then 1 ability");
    return data[0];
  }

  getShowNested() { return this.item.showNested; }

  get order(): string {
    return (this.item as any).value;
  }
}

export interface IBossAttackMapData {
  vertical?: boolean;
  attack?: M.IBossAbility;
}
export class BossAttackMap extends BaseMap<string, DataItem, IBossAttackMapData> implements IMoveable {
  onDataUpdate(data: IBossAttackMapData): void {
    this.setItem(this.createBossAttack(this.id, data.attack, data.vertical));
  }

  constructor(id: string, data: IBossAttackMapData) {
    super(id);
    this.applyData(data);
  }

  get start(): Date {
    return this.item.start as Date;
  }

  get startAsNumber(): number {
    return this.start.valueOf() as number;
  }

  get attack(): M.IBossAbility {
    return this.data.attack;
  }

  createBossAttack(id: string, attack: M.IBossAbility, vertical: boolean): DataItem {
    const cls = { bossAttack: true, vertical: vertical };
    cls[M.DamageType[attack.type]] = true;
    return {
      id: id,
      content: this.createBossAttackElement(attack),
      start: Utils.getDateFromOffset(attack.offset),
      group: "boss",
      type: "box",
      className: this.buildClass(cls),
      title: attack.offset
    }
  }

  private createBossAttackElement(ability: M.IBossAbility): string {
    return "<div><div class='marker'></div><div class='name'>" +
      Utils.escapeHtml(ability.name) +
      "</div></div>";
  }

  move(delta: number): boolean {
    const newDate = new Date(this.startAsNumber + delta * 1000);
    this.applyData({ attack: { offset: Utils.formatTime(newDate) } });
    return true;
  }
}

export interface IAbilityUsageMapData {
  start?: Date;
  ogcdAsPoints?: boolean;
  loaded?: boolean;
  showLoaded?: boolean;
}
export class AbilityUsageMap extends BaseMap<string, DataItem, IAbilityUsageMapData> implements IMoveable {


  onDataUpdate(data: IAbilityUsageMapData): void {
    this.setItem(this.createAbilityUsage(this.id, this.ability, data));
  }

  constructor(id: string, ability: AbilityMap, settings: M.IAbilitySettingData[], data: IAbilityUsageMapData) {
    super(id);
    this.ability = ability;
    this.calculatedDuration = ability.ability.duration;
    this.settings = settings;

    this.applyData(Object.assign({ ogcdAsPoints: false, loaded: false, showLoaded: false }, data));
  }

  ability: AbilityMap;
  calculatedDuration: number;
  settings: M.IAbilitySettingData[];


  get start(): Date {
    return this.item.start as Date;
  }

  get end(): Date {
    return this.item.end as Date;
  }

  get startAsNumber(): number {
    return this.item.start.valueOf() as number;
  }

  get endAsNumber(): number {
    return this.item.end.valueOf() as number;
  }

  getSettingData(name: string): M.IAbilitySettingData {
    return this.settings && this.settings.find(it => it.name === name);
  }

  getSetting(name: string): M.IAbilitySetting {
    return this.ability.ability.settings && this.ability.ability.settings.find(it => it.name === name);
  }

  createAbilityUsage(id: string, ability: AbilityMap, data: IAbilityUsageMapData): DataItem {
    const start = data.start;
    const end = new Date(start.valueOf() as number + ability.ability.cooldown * 1000);

    return <DataItem>{
      id: id,
      start: start,
      end: end,
      group: ability.id,
      className: this.buildClass({ ability: true, compact: ability.isCompact, loaded: data.showLoaded && data.loaded }),
      content: "",
      subgroup: "sg" + ability.id,
      type: data.ogcdAsPoints || !!ability.ability.charges ? "point" : "range",
      title: `<img class='tooltipAbilityIcon' src='${ability.ability.icon}'/><span>${Utils.formatTime(start)} - ${Utils.formatTime(end)}</span>`,
    };
  }

  get loaded(): boolean {
    return this.data.loaded;
  }

  move(delta: number): boolean {
    const newDate = new Date(this.startAsNumber + delta * 1000);
    this.applyData({ start: newDate });
    return true;
  }
}


export interface IBossDownTimeMapData {
  start?: Date;
  end?: Date;
  color?: string;
}
export class BossDownTimeMap extends BaseMap<string, DataItem, IBossDownTimeMapData> {
  onDataUpdate(data: IBossDownTimeMapData): void {
    this.setItem(this.createDownTime(this.id, data.start, data.end, data.color));
  }

  startId: string;
  endId: string;

  get start(): Date {
    return this.data.start as Date;
  }

  get end(): Date {
    return this.data.end as Date;
  }

  set start(v: Date) {
    this.data.start = v;
  }

  set end(v: Date) {
    this.data.end = v;
  }

  constructor(id: string, startId: string, endId: string, data: IBossDownTimeMapData) {
    super(id);
    this.startId = startId;
    this.endId = endId;
    this.applyData(data);
  }

  createDownTime(id: string, start: Date, end: Date, color: string): DataItem {
    return {
      start: start,
      end: end,
      id: id,
      content: "",
      type: "background",
      className: "downtime " + color
    }
  }

  get color(): string {
    return this.data.color;
  }
}

export interface IHeatmapMapData {
  start?: Date;
  end?: Date;
}
export class HeatmapMap extends BaseMap<string, DataItem, IHeatmapMapData> {
  onDataUpdate(data: IHeatmapMapData): void {
    this.setItem(this.createHeatMap(data.start, data.end, this.id, this.target));
  }

  constructor(id: string, target: string, data: IHeatmapMapData) {
    super(id);
    this.target = target;
    this.applyData(data);
  }

  get start(): Date {
    return this.item.start as Date;
  }

  get end(): Date {
    return this.item.end as Date;
  }

  set start(v: Date) {
    this.item.start = v;
  }

  set end(v: Date) {
    this.item.end = v;
  }

  target: string;

  createHeatMap(start: Date, end: Date, id: string, group?: string) {
    const result = <DataItem>{
      start: start,
      end: end,
      id: id,
      content: "",
      type: "background",
      className: "buffMap",
    };
    if (group) {
      result.group = group;
    }
    return result;
  }
}

export interface IBossTargetMapData {
  start?: Date;
  end?: Date;
}
export class BossTargetMap extends BaseMap<string, DataItem, IBossTargetMapData> {
  onDataUpdate(data: IBossTargetMapData): void {
    this.setItem(this.createBossTarget(this.id, data.start, data.end, this.target));
  }

  constructor(id: string, target: string, data: IBossTargetMapData) {
    super(id);
    this.target = target;
    this.applyData(data);
  }
  target: string;

  get start(): Date {
    return this.item.start as Date;
  }

  get end(): Date {
    return this.item.end as Date;
  }

  set start(v: Date) {
    this.item.start = v;
  }

  set end(v: Date) {
    this.item.end = v;
  }

  createBossTarget(id: string, start: Date, end: Date, target: string): DataItem {
    return {
      id: id,
      start: start,
      end: end,
      group: target,
      className: "targets",
      type: "background",
      content: "",
    }
  }
}

export interface IJobStanceMapData {
  start?: Date;
  end?: Date;
  loaded?: boolean;
  showLoaded?: boolean;
}
export class JobStanceMap extends BaseMap<string, DataItem, IJobStanceMapData> implements IMoveable {
  move(delta: number): boolean {
    const newDateStart = new Date(this.start.valueOf() as number + delta * 1000);
    const newDateEnd = new Date(this.end.valueOf() as number + delta * 1000);
    this.applyData({
      start: newDateStart,
      end: newDateEnd
    });
    return true;
  }

  onDataUpdate(data: IJobStanceMapData): void {
    this.setItem(this.createStanceUsage(this.stanceAbility, this.id, this.ability.id, data.start, data.end, data.loaded, data.showLoaded));
  }

  constructor(id: string, ability: AbilityMap, stanceAbility: M.IAbility, data: IJobStanceMapData) {
    super(id);
    this.ability = ability;
    this.stanceAbility = stanceAbility;
    this.applyData(Object.assign({ loaded: false, showLoaded: false }, data));
  }

  ability: AbilityMap;
  stanceAbility: M.IAbility;
  loaded: boolean;

  get start(): Date {
    return this.item.start as Date;
  }

  get end(): Date {
    return this.item.end as Date;
  }

  set start(v: Date) {
    this.item.start = v;
  }

  set end(v: Date) {
    this.item.end = v;
  }
  createStanceUsage(ability: M.IAbility, id: string, parentId: string, start: Date, end: Date, loaded: boolean, showLoaded: boolean): DataItem {

    return <DataItem>{
      id: id,
      start: start,
      end: end,
      group: parentId,
      className: this.buildClass({ stance: true, loaded: loaded && showLoaded }),
      content: "<img class='abilityIcon' src='" + ability.icon + "'/>",
      subgroup: "sg" + parentId,
      type: "range",
      title: `<img class='tooltipAbilityIcon' src='${ability.icon}'/>${ability.name}  ${Utils.formatTime(start)} - ${Utils.formatTime(end)}`,
    };
  }
}

export interface IAbilityAvailabilityMap {
  start?: Date;
  end?: Date;
  available?: boolean;
}
export class AbilityAvailabilityMap extends BaseMap<string, DataItem, IAbilityAvailabilityMap> {
  onDataUpdate(data: IAbilityAvailabilityMap): void {
    this.setItem(this.createAbilityAvailability(this.id, this.ability.id, data.start, data.end, data.available));
  }

  constructor(id: string, ability: AbilityMap, data?: IAbilityAvailabilityMap) {
    super(id);
    this.ability = ability;
    this.applyData(data);
  }

  ability: AbilityMap;

  createAbilityAvailability(id: string, abilityId: string, start: Date, end: Date, available: boolean): DataItem {
    return {
      start: start,
      end: end,
      id: id,
      content: "",
      group: abilityId,
      editable: false,
      type: "background",
      className: "availability " + (available ? "available" : "notAvailable")
    }
  }
}


class BaseHolder<TK, TI, T extends IBaseHolderItem<TK>> {
  protected items: { [id: string]: T } = {};

  add(i: T): void {
    this.items[i.id as any] = i;
  }

  addRange(i: T[]): void {
    i.forEach(it => this.items[it.id as any] = it);
  }

  get(id: TK): T {
    return this.items[id as any];
  }

  protected get values(): T[] {
    return Object.values(this.items) as T[];
  }

  protected itemsOf(items: T[]): TI[] {
    return items.map((it) => (<IItemHolder<TI>><any>it).item);
  }

  protected itemOf(item: T): TI {
    return (<IItemHolder<TI>><any>item).item;
  }

  filter(predicate: (it: T) => boolean): T[] {
    return this.values.filter(predicate);
  }
  remove(ids: TK[]): void {
    ids.forEach(x => {
      const index = this.items[x as any];
      if (index) {
        delete this.items[x as any];
      }
    });

  }

  getAll(): T[] {
    return this.values;
  }

  getIds(): TK[] {
    return Object.keys(this.items) as any[];
  }

  getByIds(ids: (string | number)[]): T[] {
    if (!ids) return [];
    return ids.map(it => this.items[it]).filter(it => !!it);
  }

  clear(): void {
    delete this.items;
    this.items = {};
  }

  update(items: T[]) {

  }
}

export class StancesHolder extends BaseHolder<string, DataItem, JobStanceMap> {
  constructor(private visItems: DataSetDataItem) {
    super();
  }
  add(i: JobStanceMap): void {
    super.add(i);
    this.visItems.add(this.itemOf(i));
  }

  clear(): void {
    this.visItems.remove(this.getIds());
    super.clear();
  }

  remove(ids: string[]): void {
    super.remove(ids);
    this.visItems.remove(ids);
  }

  update(items: JobStanceMap[]) {
    this.visItems.update(this.itemsOf(items));
  }

  setHighlightLoaded(highlightLoaded: boolean) {
    const toUpdate: JobStanceMap[] = [];
    this.values.forEach(it => {
      if (it.loaded) {
        it.applyData({ showLoaded: highlightLoaded });
        toUpdate.push(it);
      }
    });
    this.update(toUpdate);
  }

  getNext(time: Date): Date {
    let minV: JobStanceMap = null;
    this.values.forEach(v => {
      if (v.start > time) {
        if (minV) {
          if (minV.start > v.start)
            minV = v;
        }
        else {
          minV = v;
        }
      }
    });
    if (minV) {
      return new Date((minV.start.valueOf() as number) - 1000);
    }
    return new Date(946677600000 + 30 * 60 * 1000);

  }

  getPrev(time: Date): Date {
    let maxV: JobStanceMap = null;
    this.values.forEach(v => {
      if (v.end < time) {
        if (maxV) {
          if (maxV.end < v.end)
            maxV = v;
        }
        else {
          maxV = v;
        }
      }
    });
    if (maxV) {
      return new Date((maxV.end.valueOf() as number) + 1000);
    }
    return new Date(946677600000);
  }
}

export class AbilitiesMapHolder extends BaseHolder<string, DataGroup, AbilityMap> {

  constructor(private visItems: DataSetDataGroup) {
    super();
  }

  add(i: AbilityMap): void {
    super.add(i);
    this.visItems.add(this.itemOf(i));
  }

  remove(ids: string[]): void {
    super.remove(ids);
    this.visItems.remove(ids);
  }

  clear(): void {
    this.visItems.remove(this.getIds());
    super.clear();

  }

  getByParentId(parentId: string): AbilityMap[] {
    return this.filter((b: AbilityMap) => b.job.id === parentId);
  }

  isBossTargetForGroup(group: string): boolean {
    return this.values.find((b: AbilityMap) => group === b.id && b.ability.settings && b.ability.settings.some((s => s.name === Shared.settings.changesTarget.name) as any) && b.job.id !== "boss") !== undefined;
  }

  getParent(group: string): string {
    return this.values.find((b: AbilityMap) => group === b.id).job.id;
  }

  getByParentAndAbility(jobId: string, ability: string): AbilityMap {
    return this.values.find((b: AbilityMap) => b.job.id === jobId && !!b.ability && (b.ability.name.toUpperCase() === ability.toUpperCase()));
  }

  getStancesAbility(jobGroup: string): AbilityMap {
    return this.values.find((b: AbilityMap) => b.job.id === jobGroup && b.isStance);
  }

  getNonStancesAbilities(): AbilityMap[] {
    return this.filter(it => !it.isStance);
  }


  update(items: AbilityMap[]): void {
    this.visItems.update(this.itemsOf(items));
  }

  applyFilter(filter: M.IAbilityFilter, used: (a) => boolean) {
    this.values.forEach(value => {
      const jobMap = value.job;
      const visible = this.abilityFilter(value, filter, jobMap, used);
      value.applyData({ filtered: !visible });
    });
    this.update(this.values);
  }

  private abilityFilter(value: AbilityMap, filter: M.IAbilityFilter, jobMap: JobMap, used: (a) => boolean): boolean {
    const jobFilter = jobMap.filter;
    const filterUnit = (aType: M.AbilityType | M.AbilityType[], globalFilter: boolean, jobFilter: boolean) => {
      let visible = false;
      const valueArray: M.AbilityType[] = Array.isArray(aType) ? aType : [aType];
      if (valueArray.some(it => (value.ability.abilityType & it) === it)) {
        visible = globalFilter;
        if (jobFilter !== undefined)
          visible = jobFilter;
      }
      return visible;
    };
    let visible: boolean;
    if (!filter || !jobFilter || !value.ability) {
      visible = true;
    } else {
      if ((jobMap.pet || jobMap.job.defaultPet) && value.ability.pet && value.ability.pet !== (jobMap.pet || jobMap.job.defaultPet)) {
        visible = false;
      } else {
        visible = filterUnit([M.AbilityType.SelfDefense, M.AbilityType.SelfShield], filter.selfDefence, jobFilter.selfDefence);
        visible = visible || filterUnit([M.AbilityType.PartyDefense, M.AbilityType.PartyShield, M.AbilityType.TargetDefense], filter.partyDefence, jobFilter.partyDefence);
        visible = visible || filterUnit(M.AbilityType.SelfDamageBuff, filter.selfDamageBuff, jobFilter.selfDamageBuff);
        visible = visible || filterUnit(M.AbilityType.PartyDamageBuff, filter.partyDamageBuff, jobFilter.partyDamageBuff);
        visible = visible || filterUnit(M.AbilityType.Damage, filter.damage, jobFilter.damage);
        visible = visible || filterUnit(M.AbilityType.HealingBuff, filter.healingBuff, jobFilter.healingBuff);
        visible = visible || filterUnit(M.AbilityType.Healing, filter.healing, jobFilter.healing);
        visible = visible || filterUnit(M.AbilityType.Pet, filter.pet, jobFilter.pet);
        visible = visible || filterUnit(M.AbilityType.Utility, filter.utility, jobFilter.utility);
        visible = visible || filterUnit(M.AbilityType.Enmity, filter.enmity, jobFilter.enmity);

        if (!filter.unused ||
          (jobFilter.unused !== undefined && !jobFilter.unused)) {
          if (!jobFilter.unused)
            visible = visible && used(value.id);
        }
      }
    }

    visible = visible && !value.hidden;

    return visible;
  }


}

export class JobsMapHolder extends BaseHolder<string, DataGroup, JobMap> {

  constructor(private visItems: DataSetDataGroup) {
    super();
  }

  add(i: JobMap): void {
    super.add(i);
    this.visItems.add(this.itemOf(i));
    this.removeEmpty();
  }

  addRange(i: JobMap[]): void {
    super.addRange(i);
    this.visItems.add(this.itemsOf(i));
    this.removeEmpty();
  }

  remove(ids: string[]): void {
    super.remove(ids);
    this.visItems.remove(ids);
    this.addEmpty();
  }

  clear(): void {
    this.visItems.remove(this.getIds());
    super.clear();
    this.addEmpty();
  }

  update(items: JobMap[]): void {
    this.visItems.update(this.itemsOf(items));
  }

  getOrder(initialBossTarget: string): number {
    return this.values.findIndex(((value: JobMap) => value.id === initialBossTarget) as any);
  }

  getByName(name: string, actorName?: string): JobMap {
    return this.values.find((b: JobMap) => b.job.name === name && (!actorName || actorName === b.actorName));
  }

  getByActor(actorName: string): JobMap {
    return this.values.find((b: JobMap) => actorName === b.actorName);
  }

  private addEmpty(): void {
    if (this.values.length === 0 && !this.visItems.get(0)) {
      this.visItems.add({ id: 0, content: "" });
    }
  }

  private removeEmpty(): void {
    if (this.values.length > 0)
      this.visItems.remove(0);
  }
}

export class BossAttacksHolder extends BaseHolder<string, DataItem, BossAttackMap> {
  private prefix = "bossAttack_";

  constructor(private visBossItems: DataSetDataItem, private visMainItems: DataSetDataItem) {
    super();
  }

  add(i: BossAttackMap): void {
    super.add(i);
    this.addToBoard(i);
  }

  addRange(i: BossAttackMap[]): void {
    super.addRange(i);
    this.addRangeToBoard(i);
  }

  private addToBoard(i: BossAttackMap) {
    this.visBossItems.add(this.itemOf(i));
    this.visMainItems.add({
      id: this.prefix + i.id,
      start: i.start,
      end: new Date(i.startAsNumber + 10),
      type: 'background',
      content: "",
      className: "bossAttack",
      title: i.attack.name
    });
  }

  private addRangeToBoard(i: BossAttackMap[]) {
    this.visBossItems.add(this.itemsOf(i));
    this.visMainItems.add(i.map(it => {
      return {
        id: this.prefix + it.id,
        start: it.start,
        end: new Date(it.startAsNumber + 10),
        type: 'background',
        content: "",
        className: "bossAttack",
        title: it.attack.name
      }
    }));
  }

  private removeFromBoard(i: BossAttackMap) {
    this.visBossItems.remove(i.id);
    this.visMainItems.remove(this.prefix + i.id);
  }

  remove(ids: string[]): void {
    super.remove(ids);
    this.visBossItems.remove(ids);
    this.visMainItems.remove(ids.map(it => this.prefix + it));
  }

  clear(): void {
    const ids = this.getIds();
    this.visBossItems.remove(ids);
    this.visMainItems.remove(ids.map(it => this.prefix + it));
    super.clear();

  }

  getByName(name: string): BossAttackMap[] {
    return this.filter((b: BossAttackMap) => b.attack.name === name);
  }

  update(itemsToUpdate: BossAttackMap[]): void {
    this.visBossItems.update(this.itemsOf(itemsToUpdate.filter(x => !!this.visBossItems.get(x.id))));
    this.visMainItems.update(itemsToUpdate.map(it => {
      const item = this.visMainItems.get(this.prefix + it.id);
      if (!item) return null;
      item.start = it.start;
      item.end = new Date(item.start.valueOf() + 10);
      return item;
    }).filter(x => !!x));
  }

  applyFilter(filter: M.IBossAttackFilter): void {
    if (!filter) return;
    this.values.forEach(it => {
      let visible = (filter.isTankBuster && it.attack.isTankBuster);
      visible = visible || (filter.isAoe && it.attack.isAoe);
      visible = visible || (filter.isShareDamage && it.attack.isShareDamage);

      if (!visible) {
        visible = filter.isOther && !(it.attack.isTankBuster || it.attack.isAoe || it.attack.isShareDamage);
      }

      visible = visible && (filter.isMagical && it.attack.type === M.DamageType.Magical || filter.isPhysical && it.attack.type === M.DamageType.Physical || filter.isUnaspected && it.attack.type === M.DamageType.None);


      const item = this.visBossItems.get(it.id);

      if (visible) {
        if (!item) {
          this.addToBoard(it);
        }
      } else {
        if (!!item) {
          this.removeFromBoard(it);
        }
      }

    });
  }

  setVertical(verticalBossAttacks: boolean): void {
    this.values.forEach(it => {
      it.applyData({ vertical: verticalBossAttacks });
    });
    this.update(this.values);
  }

  getAffectedAttacks(start: Date, calculatedDuration: number): string[] {
    return this.filter(it => it.start >= start &&
      new Date(start.valueOf() + calculatedDuration * 1000) >= it.start).map(it => it.id);
  }

  sync(id: string, date: Date) {
    const item = this.visMainItems.get(this.prefix + id);
    item.start = date;
    item.end = new Date(item.start.valueOf() + 10);
    this.visMainItems.update([item]);
  }
}

export class AbilitySelectionHolder extends BaseHolder<string, DataItem, AbilitySelectionMap> {
  updateDate(id: string, time: Date): void {
    const found = this.items[id];
    if (found === null || found === undefined) {
      console.warn("Unable to update abilityUsage with id:" + id);
      return;
    }
    found.time = time;
  }

  get length(): number {
    return this.values.length;
  }
}

export class BossDownTimeHolder extends BaseHolder<string, DataItem, BossDownTimeMap> {
  showInPartyArea = false;

  setShowInPartyArea(showDowntimesInPartyArea: boolean): void {
    this.showInPartyArea = showDowntimesInPartyArea;
    if (this.showInPartyArea) {
      this.values.forEach(it => this.visPartyItems.add(this.itemOf(it)));
    } else {
      this.values.forEach(it => this.visPartyItems.remove(it.id));
    }
  }

  constructor(private visBossItems: DataSetDataItem, private visPartyItems: DataSetDataItem) {
    super();
  }

  add(i: BossDownTimeMap): void {
    super.add(i);
    const item = this.itemOf(i);
    this.visBossItems.add(item);
    if (this.showInPartyArea)
      this.visPartyItems.add(item);
  }

  remove(ids: string[]): void {
    super.remove(ids);
    this.visBossItems.remove(ids);
    if (this.showInPartyArea)
      this.visPartyItems.remove(ids);
  }

  clear(): void {
    this.visBossItems.remove(this.getIds());
    if (this.showInPartyArea)
      this.visPartyItems.remove(this.getIds());
    super.clear();
  }

  update(items: BossDownTimeMap[]): void {
    const tu = this.itemsOf(items);
    this.visBossItems.update(tu);
    if (this.showInPartyArea)
      this.visPartyItems.update(tu);
  }

  getById(id: string): BossDownTimeMap {
    return this.values.find((it) => it.endId === id || it.startId === id);
  }
}

export class AbilityUsageHolder extends BaseHolder<string, DataItem, AbilityUsageMap> {

  setHighlightLoaded(highlightLoaded: boolean) {
    const toUpdate: AbilityUsageMap[] = [];
    this.values.forEach(it => {
      if (it.loaded) {
        it.applyData({ showLoaded: highlightLoaded });
        toUpdate.push(it);
      }
    });
    this.update(toUpdate);
  }

  constructor(private visItems: DataSetDataItem) {
    super();
  }

  add(i: AbilityUsageMap): void {
    super.add(i);
    this.visItems.add(this.itemOf(i));
  }

  addRange(i: AbilityUsageMap[]): void {
    super.addRange(i);
    this.visItems.add(this.itemsOf(i));
  }

  clear(): void {
    this.visItems.remove(this.getIds());
    super.clear();
  }

  remove(ids: string[]): void {
    super.remove(ids);
    this.visItems.remove(ids);
  }

  update(items: AbilityUsageMap[]) {
    this.visItems.update(this.itemsOf(items));
  }

  getByAbility(id: string): AbilityUsageMap[] {
    return this.filter(it => it.ability.id === id);
  }

  getSetting(id: string, name: string): any {
    const settings = this.get(id).settings;
    if (settings) {
      const v = settings.find((it) => it.name === name);
      return v;

    }
    return null;
  }


}

export class BuffHeatmapHolder extends BaseHolder<string, DataItem, HeatmapMap> {

  constructor(private visItems: DataSetDataItem) {
    super();
  }

  add(i: HeatmapMap): void {
    super.add(i);
    this.visItems.add(this.itemOf(i));
  }

  addRange(i: HeatmapMap[]): void {
    super.addRange(i);
    this.visItems.add(this.itemsOf(i));
  }

  clear(): void {
    this.visItems.remove(this.getIds());
    super.clear();
  }

  remove(ids: string[]): void {
    super.remove(ids);
    this.visItems.remove(ids);
  }

  update(items: HeatmapMap[]) {
    this.visItems.update(this.itemsOf(items));
  }
}

export class BossTargetHolder extends BaseHolder<string, DataItem, BossTargetMap> {

  constructor(private visItems: DataSetDataItem, private initial: string) {
    super();
  }

  add(i: BossTargetMap): void {
    super.add(i);
    this.visItems.add(this.itemOf(i));
  }

  clear(): void {
    this.visItems.remove(this.getIds());
    super.clear();
  }

  remove(ids: string[]): void {
    super.remove(ids);
    this.visItems.remove(ids);
  }

  update(items: BossTargetMap[]) {
    this.visItems.update(this.itemsOf(items));
  }

  get initialBossTarget(): string { return this.initial; }

  set initialBossTarget(v: string) { this.initial = v; }
}

export class AbilityAvailablityHolder extends BaseHolder<string, DataItem, AbilityAvailabilityMap> {
  constructor(private visItems: DataSetDataItem) {
    super();
  }

  add(i: AbilityAvailabilityMap): void {
    super.add(i);
    this.visItems.add(this.itemOf(i));
  }

  addRange(i: AbilityAvailabilityMap[]): void {
    super.addRange(i);
    this.visItems.add(this.itemsOf(i));
  }

  clear(): void {
    this.visItems.remove(this.getIds());
    super.clear();
  }

  remove(ids: string[]): void {
    super.remove(ids);
    this.visItems.remove(ids);
  }

  update(items: AbilityAvailabilityMap[]) {
    this.visItems.update(this.itemsOf(items));
  }

  removeForAbility(id: string): void {
    const ids = this.filter(it => it.ability.id === id);
    this.remove(ids.map(it => it.id));
  }
}


