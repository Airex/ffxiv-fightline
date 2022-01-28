import * as FF from "./FFLogs"
import * as FFLogsCollectors from "./FflogsCollectors/FFLogsCollectors";
import { Holders } from "./Holders";
import { IOverlapCheckData } from "./Maps/BaseMap";

type Map<T, U> = {
  [Prop in keyof T]: U
};

export function MapMe<T extends JobStatuses>(input: T): Map<T, IAbilityStatus> {
  return input
}

export enum Role {
  Tank,
  Healer,
  Melee,
  Range,
  Caster
}

export interface IJob {
  name: string;
  fullName?: string;
  icon?: string;
  abilities: IAbility[];
  role: Role;
  baseClass?: string;
  pets?: IPet[];
  defaultPet?: string;
  stances?: IStance[];
  fraction?: IFraction;
  settings?: IAbilitySetting[];
}

export interface IJobStats {
  weaponDamage?: number;
  mainStat?: number;
  criticalHit?: number;
  determination?: number;
  directHit?: number;
  speed?: number;
  hp?: number;
}

export interface IFraction {
  name: string;
  icon: string;
}

export interface IPet {
  name: string;
  icon?: string;
}

export interface IStance {
  ability: IAbility;
}

export enum AbilityType {
  SelfDefense = 1,
  PartyDefense = 256,
  SelfShield = 1024,
  PartyShield = 2048,
  TargetDefense = 4096,
  SelfDamageBuff = 2,
  PartyDamageBuff = 64,
  Healing = 4,
  Utility = 8,
  Damage = 16,
  HealingBuff = 32,
  Pet = 128,
  Enmity = 512
}

export interface IBoss {
  id: string;
  name: string;
  userName: string;
  data: string;
  isPrivate: boolean;
  ref: number;
  game: string;
}

export interface IBossSearchEntry {
  id: string;
  name: string;
  canRemove?: boolean;
  createDate?: Date;
  modifiedDate?: Date;
}

export interface IFight {
  id: string;
  name: string;
  userName: string;
  data: string;
  isDraft?: boolean;
  dateModified?: Date;
  dateCreated?: Date;
  game: string;
  level?: number;
}

export interface ICommandEntry {
  userName: string;
  fight: string;
  data: string;
  timeStamp?: Date;
}

export interface IHubCommand {
  id: string;
  userId: string;
}

export interface IHubUser {
  id: string;
  name: string;
}


export interface IDetectionDependencies {
  abilities: number[];
  buffs: number[];
}

export interface IDetectionStrategy {
  process(ev: FF.BaseEventFields): { offset: number, name: string };
  deps: IDetectionDependencies;
}

export type IOverlapCheckContext = IOverlapCheckData & {
  ability: IAbility;
}

export interface IOverlapStrategy {
  check(context: IOverlapCheckContext): boolean;
  getDependencies(): string[];
}

export type JobStatuses = {
  [name: string]: IAbilityStatus
}

export interface IJobInfo {
  id: number;
  petids: number[];
  guid: number;
  petguids: number[];
  job: string;
  actorName: string;
  role?: number;
  rid?: string;
}

export interface IAbility {
  name: string;
  cooldown: number;
  requiresBossTarget?: boolean;
  iconPrefix?: string;
  icon?: string;
  xivDbId?: string | number;
  xivDbType?: string;
  relatedAbilities?: IRelatedAbilitiesOptions;
  extendDurationOnNextAbility?: number;
  settings?: IAbilitySetting[] | null;
  abilityType: AbilityType;
  resetsPrevious?: boolean;
  detectStrategy?: IDetectionStrategy;
  overlapStrategy?: IOverlapStrategy;
  charges?: IAbilityCharges;
  levelAcquired: number;
  statuses?: IAbilityStatus[] | null;
  isOgcd?: boolean;
}

export interface IAbilityStatus {
  name?: string;
  xivDbId?: string;
  duration: number;
  effects?: IAbilityEffect[] | null;
  shareGroup?: string;
}

export interface IMitigator {
  apply(context: MitigationVisitorContext);
}

export type MitigationVisitorContext = {
  jobId: string
  abilityId: string
  holders: Holders
  addMitigationForTarget(value: number, damageType: DamageType)
  addMitigationForParty(value: number, damageType: DamageType)
  addShieldForTarget(value: number)
  addShieldForParty(value: number)
  original?: {
    value: number,
    damageType: DamageType
  }
}

export interface IEffectVisitor {
  mitigate(mitigator: IMitigator);
  delay(value: number);
}

export function runEffectVisitor<T extends IEffectVisitor>(t: new () => T, input: IAbility | IAbility[]) {
  var visitor = new t();

  const iter = Array.isArray(input) ? input : [input];
  iter.forEach(ab => {
    ab.statuses?.forEach(st => {
      st.effects?.forEach(ef => {
        ef.visit(visitor);
      })
    })
  })
  return visitor;
}

export interface IAbilityEffect {
  visit(visitor: IEffectVisitor);
}

export interface IAbilityCharges {
  initialCount?: number;
  count: number;
  cooldown: number;
  sharesWith?: string[];
}

export interface IAbilitySetting {
  name: string;
  displayName: string;
  description: string;
  type: string;
  default: any;
  process?: (context: FFLogsCollectors.ICollectorContext, data: FF.AbilityEvent) => string;
}

export interface ISettingData {
  name: string;
  value: any;
}

export interface IRelatedAbilitiesOptions {
  affectedBy?: string[];
  affects?: string[];
  abilities?: string[];
  parentOnly?: boolean;
}

export enum EntryType {
  Unknown = 'unknown',
  BossAttack = 'b',
  AbilityUsage = 'u',
  BossTarget = 't',
  BossDownTime = 'd',
  BuffMap = 'hm',
  CompactViewAbilityUsage = 'c',
  Job = 'j',
  Ability = 'a',
  StanceUsage = 's',
  AbilityAvailability = 'v'
}

export enum DefaultTagsEnum {
  TankBuster,
  AoE,
  ShareDamage
}

export const DefaultTags = ["Tank Buster", "AoE", "Share Damage"];

export interface IFightData {
  fight?: IFight;
  boss?: IBoss;
  importedFrom?: string;
}

export type BossAttackFFlogsData = {
  amount: number,
  unmitigated?: number,
  mitigated?: number,
  absorbed?: number,
  multiplier?: number
}

export type BossAttackFFlogs = {
  [jobId: string]: BossAttackFFlogsData
}

export interface IBossAbility {
  name?: string;
  type?: DamageType;
  offset: TimeOffset;
  tags?: string[];
  syncSettings?: string;
  syncDowntime?: string;
  syncPreDowntime?: string;
  description?: string;
  source?: string;
  rawDamage?: number | [number, number];
  pinned?: boolean;
  fflogsData?: BossAttackFFlogs,
  fflogsAttackSource?: "cast" | "damage"
}

export type TimeOffset<T extends number = number, D extends number = number> = `${'+'|'-'|''}${T}:${D}` & { minutes?: T, seconds?: D }

export interface ISyncData {
  offset: string;
  condition: Combined;
}

export interface ISyncSettingGroup {
  operation: SyncOperation,
  operands: Combined[];
}

export interface ISyncSetting {
  type: string;
  description: string;
  payload: any;
}

export type Combined = ISyncSetting | ISyncSettingGroup;

export const isSetting = (c: Combined): c is ISyncSetting => {
  return !!(<ISyncSetting>c).type;
}

export const isSettingGroup = (c: Combined): c is ISyncSettingGroup => {
  return !!(<ISyncSettingGroup>c).operation;
}



export enum SyncOperation {
  And = "and",
  Or = "or"
}

export enum DamageType {
  None = 0,
  Physical = 1,
  Magical = 2,
  All = DamageType.Physical | DamageType.Magical
}

export interface IAbilityFilter {
  selfDefence?: boolean;
  partyDefence?: boolean;
  selfDamageBuff?: boolean;
  partyDamageBuff?: boolean;
  damage?: boolean;
  healing?: boolean;
  healingBuff?: boolean;
  utility?: boolean;
  unused?: boolean;
  enmity?: boolean;
};

export interface IBossAttackFilter {
  tags: string[];
  sources: string[];
  isMagical: boolean;
  isPhysical: boolean;
  isUnaspected: boolean;
  fflogsSource?: "cast" | "damage";

  keywords: string[];
}

export interface JobFilter {
  filter?: IAbilityFilter,
  isCollapsed?: boolean;
  isCompact?: boolean;
  abilityCompact?: string[],
  abilityHidden?: string[]
}

export type JobFilters = {
  [id: string]: JobFilter
}

export interface IFilter {
  abilities: IAbilityFilter;
  attacks?: IBossAttackFilter;
}

export const defaultFilter: () => IFilter = () => ({
  abilities: {
    damage: true,
    selfDefence: true,
    partyDefence: true,
    enmity: true,
    healing: true,
    healingBuff: true,
    partyDamageBuff: true,
    selfDamageBuff: true,
    unused: true,
    utility: true,
  },
  attacks: {
    tags: DefaultTags.concat("Other"),
    sources: ["Other"],
    isMagical: true,
    isPhysical: true,
    isUnaspected: true,
    fflogsSource: "damage",
    keywords: []
  }
});

export interface IView {
  buffmap: boolean;
  ogcdAsPoints: boolean;
  showDowntimesInPartyArea: boolean;
  verticalBossAttacks: boolean;
  compactView: boolean;
  highlightLoaded: boolean;
  showAbilityAvailablity: boolean;
  colorfulDurations: boolean;
}

export const defaultView: () => IView = () => ({
  buffmap: false,
  ogcdAsPoints: false,
  showDowntimesInPartyArea: false,
  verticalBossAttacks: false,
  compactView: false,
  highlightLoaded: false,
  showAbilityAvailablity: false,
  colorfulDurations: false
});

export interface ITools {
  downtime: boolean;
  stickyAttacks: boolean;
  copypaste: boolean;
}

export interface IBossTemplate {
  name: string;
  encounter: number;
  rootPhase: IPhase;
}

export interface IPhase {
  name: string;
  nextPhases: IPhase[];
  syncData: ISyncData;
}

export interface IStorage {
  setString(key: string, value: string): void;
  getString(key: string): string;
  setObject(key: string, value: object): void;
  getObject<T>(key: string): T;
}

export interface IPresenterData {
  tags: string[];
  sources: string[];
  filter: IFilter;
  fightLevel: number;
  view: IView;
  jobFilter(jobId: string): JobFilter;
}

export interface IPresetTemplate {
  filter: IFilter;
  view: IView;
  jobFilters: { [job: string]: JobFilter }
}