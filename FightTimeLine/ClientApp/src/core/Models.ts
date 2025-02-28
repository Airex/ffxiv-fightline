import * as FFLogs from "./FFLogs";
import * as FFLogsCollectors from "./FflogsCollectors/FFLogsCollectors";
import { Holders } from "./Holders";
import { AbilityUsageMap } from "./Maps";
import { IOverlapCheckData } from "./Maps/BaseMap";

type Map<T, U> = {
  [Prop in keyof T]: U;
};

export function MapStatuses<T extends JobStatuses>(
  input: T
): Map<T, IAbilityStatus> {
  return input;
}

export enum Role {
  Tank,
  Healer,
  Melee,
  Range,
  Caster,
}

export interface IJob {
  name: string;
  translation?: Translation;
  fullName?: string;
  fullNameTranslation?: Translation;
  icon?: string;
  abilities: Record<string, IAbility>;
  role: Role;
  pets?: IPet[];
  defaultPet?: string;
  stances?: IStance[];
  traits?: ITrait[];
}

export interface IJobTemplate {
  translation?: Translation;
  fullNameTranslation?: Translation;
  abilities: IAbility[];
  role: Role;
  pets?: IPet[];
  defaultPet?: string;
  stances?: IStance[];
  traits?: ITrait[];
}

export type TraitFunction = (job: IJob) => void;

export interface ITrait {
  level: number;
  name: string;
  apply: TraitFunction;
}

export interface IJobStats {
  attackMagicPotency?: number;
  weaponDamage?: number;
  criticalHit?: number;
  determination?: number;
  tenacity?: number;
  directHit?: number;
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
  PartyHealing = 16384,
  Utility = 8,
  Damage = 16,
  HealingBuff = 32,
  PartyHealingBuff = 8192,
  Pet = 128,
  Enmity = 512,
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
  deps: IDetectionDependencies;
  process(ev: FFLogs.BaseEventFields): { offset: number; name: string } | null;
}

export type IOverlapCheckContext = IOverlapCheckData & {
  ability: IAbility;
};

export interface IOverlapStrategy {
  check(context: IOverlapCheckContext): boolean;
  getDependencies(): string[];
}

export type JobStatuses = {
  [name: string]: IAbilityStatus;
};

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

export enum SupportedLanguages {
  en = "en",
  fr = "fr",
  de = "de",
  ja = "ja",
  cn = "cn",
}

export type Translation = Record<SupportedLanguages, string>;

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
  levelRemoved?: number;
  statuses?: IAbilityStatus[] | null;
  isOgcd?: boolean;
  translation?: Translation;
  potency?: number;
  cantUseOnSelf?: boolean;
}

export interface IAbilityStatus {
  delay?: number;
  name?: string;
  xivDbId?: string;
  duration: number;
  effects?: IAbilityEffect[] | null;
  potency?: number;
  shareGroup?: string;
}

export interface IStatusSnapshot {
  status: IAbilityStatus;
  source: AbilityUsageMap;
  start: Date;
  target: string;
}

export interface IMitigator {
  apply(context: MitigationVisitorContext): void;
}

export interface IMitigatorOverride {
  apply(context: MitigationVisitorContext, original: IMitigator): void;
}

export type MitigationVisitorContext = MitigationCalculateContext & {
  addMitigationForTarget(value: number, damageType: DamageType): void;
  addMitigationForParty(value: number, damageType: DamageType): void;
  addShieldForTarget(value: number, hpFromJob?: string): void;
  addShieldForParty(value: number, hpFromJob?: string): void;
  addAbsorbFromAbilityForTarget(value: number): void;
  addAbsorbFromAbilityForParty(value: number): void;
  addHealIncreaseForTarget(value: number): void;
  addHealIncreaseForParty(value: number): void;
  addHealIncreaseForOwner(value: number): void;
  addHealIncreaseForSelf(value: number): void;
  addHpIncreaseForOwner(value: number): void;
  addHpIncreaseForTarget(value: number): void;
  addHpIncreaseForParty(value: number): void;
};

export type MitigationCalculateContext = {
  targetJobId: string | "party";
  attackAt?: Date;
  attackDamageType?: DamageType;
  sourceAbilityId: string;
  sourceJobId: string;
  status?: IAbilityStatus;
  effect?: IAbilityEffect;
  holders: Holders;
};
export interface IEffectVisitor {
  accept(mitigator: IMitigator, target: MitigationCalculateContext): void;
  delay(value: number): void;
}

export function runEffectVisitor<T extends IEffectVisitor>(
  t: new () => T,
  input: IAbility | IAbility[],
  context?: MitigationCalculateContext
) : T  {
  const visitor = new t();

  const iter = Array.isArray(input) ? input : [input];
  iter.forEach((ab) => {
    ab.statuses?.forEach((st) => {
      st.effects?.forEach((ef) => {
        ef.visit(visitor, context);
      });
    });
  });
  return visitor;
}

export interface IAbilityEffect {
  potency?: number;
  visit(
    visitor: IEffectVisitor,
    targetContext: MitigationCalculateContext
  ): void;
}

export interface IAbilityCharges {
  initialCount?: number;
  count: number;
  cooldown: number;
  sharesWith?: string[];
}

export type SettingValue = any;
export interface IAbilitySetting<T extends any = any> {
  name: string;
  displayName: string;
  description: string;
  type: string;
  default: T;
  process?: (
    context: FFLogsCollectors.ICollectorContext,
    data: FFLogs.AbilityEvent
  ) => SettingValue;
}

export interface ISettingData<T extends any = any> {
  name: string;
  value: T;
}

export interface IRelatedAbilitiesOptions {
  affectedBy?: string[];
  affects?: string[];
  abilities?: string[];
  parentOnly?: boolean;
}

export enum EntryType {
  Unknown = "unknown",
  BossAttack = "b",
  AbilityUsage = "u",
  BossTarget = "t",
  BossDownTime = "d",
  BuffMap = "hm",
  CompactViewAbilityUsage = "c",
  Job = "j",
  Ability = "a",
  StanceUsage = "s",
  AbilityAvailability = "v",
}

export enum DefaultTagsEnum {
  TankBuster,
  AoE,
  ShareDamage,
}

export const DefaultTags = ["Tank Buster", "AoE", "Share Damage"];

export interface IFightData {
  fight?: IFight;
  boss?: IBoss;
  importedFrom?: string;
}

export type BossAttackFFlogsData = {
  amount: number;
  unmitigated?: number;
  mitigated?: number;
  absorbed?: number;
  multiplier?: number;
};

export type BossAttackFFlogs = {
  [jobId: string]: BossAttackFFlogsData;
};

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
  rawDamage?: number;
  pinned?: boolean;
  color?: string;
  fflogsData?: BossAttackFFlogs;
  fflogsAttackSource?: "cast" | "damage";
}

export type TimeOffset<
  T extends number = number,
  D extends number = number
> = `${"+" | "-" | ""}${T}:${D}` & { minutes?: T; seconds?: D };

export interface ISyncData {
  offset: string;
  condition: Combined;
}

export interface ISyncSettingGroup {
  operation: SyncOperation;
  operands: Combined[];
}

export interface ISyncSetting {
  type: string;
  description: string;
  payload: any;
}

export type Combined = ISyncSetting | ISyncSettingGroup;

export const isSetting = (c: Combined): c is ISyncSetting => {
  return !!(c as ISyncSetting).type;
};

export const isSettingGroup = (c: Combined): c is ISyncSettingGroup => {
  return !!(c as ISyncSettingGroup).operation;
};

export enum SyncOperation {
  And = "and",
  Or = "or",
}

export enum DamageType {
  None = 0,
  Physical = 1,
  Magical = 2,
  All = DamageType.Physical | DamageType.Magical,
}

export interface IAbilityFilter {
  selfDefence?: boolean;
  partyDefence?: boolean;
  selfDamageBuff?: boolean;
  partyDamageBuff?: boolean;
  damage?: boolean;
  healing?: boolean;
  partyHealing?: boolean;
  healingBuff?: boolean;
  partyHealingBuff?: boolean;
  utility?: boolean;
  unused?: boolean;
  enmity?: boolean;
}

export interface IBossAttackFilter {
  tags: string[];
  sources: string[];
  isMagical: boolean;
  isPhysical: boolean;
  isUnaspected: boolean;
  fflogsSource?: "cast" | "damage";
  keywords: string[];
}

export interface JobPreset {
  filter?: IAbilityFilter;
  isCollapsed?: boolean;
  isCompact?: boolean;
  abilityCompact?: string[];
  abilityHidden?: string[];
  order?: number;
  abilityOrder?: Record<string, number>;
}

export type JobPresets = {
  [id: string]: JobPreset;
};

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
    keywords: [],
  },
});

export interface IView {
  statusesAsRows: boolean;
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
  colorfulDurations: false,
  statusesAsRows: false
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
  language: SupportedLanguages;
  tags: string[];
  sources: string[];
  filter: IFilter;
  fightLevel: number;
  view: IView;
  jobFilter(jobId: string): JobPreset;

  addPreset(id: string, preset: IPresetTemplate);
}

export interface IPresetTemplate {
  filter: IFilter;
  view: IView;
  jobFilters: { [job: string]: JobPreset };
}

export interface IPresetStorage {
  [name: string]: IPresetTemplate;
}

export enum SettingsEnum {
  Target = "target",
  ChangesTarget = "changesTarget",
  HealShield = "healShield",
  Note = "note",
  Activation = "activation",
  ImprovisationStacks = "improvisationStacks",
}

export type SettingsType = { [T in SettingsEnum]: IAbilitySetting };

export const settings: SettingsType = {
  target: {
    name: "target",
    displayName: "Target",
    description: "Determines target of ability",
    type: "partyMember",
    default: "",
    process: (context, data) => {
      const target = context.parser.players.find(
        (it1) => it1.id === data.targetID
      );
      return (target && target.rid) || null;
    },
  },
  changesTarget: {
    name: "changesTarget",
    displayName: "Changes target",
    description: "Determines if ability changes boss target",
    type: "boolean",
    default: true,
  } ,
  improvisationStacks: {
    name: "improvisationStacks",
    displayName: "Improvisation stacks",
    description: "Number of stacks of improvisation",
    type: "number",
    default: 1,
  } as IAbilitySetting,
  healShield: {
    name: "healShield",
    displayName: "Shield?",
    description: "Determines if ability applies shield",
    type: "boolean",
    default: false,
  } as IAbilitySetting,
  note: {
    name: "note",
    displayName: "Note",
    description: "",
    type: "text",
    default: "",
  },
  activation: {
    name: "activation",
    displayName: "Activated in",
    description: "Sets delay of status activation in seconds",
    type: "number",
    default: 0,
  },
} as const;
