import * as FF from "./FFLogs"
import {Holders} from "./Holders";
//import {AbilitySelectionHolder} from "./Holders/AbilitySelectionHolder";
import {AbilityUsageMap} from "./Maps/index";
import * as FFLogsCollectors from "./FflogsCollectors/FFLogsCollectors";

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
}

export interface ICommandEntry {
  userName: string;
  fight: string;
  data: string;
  timeStamp: Date;
}

export interface IHubCommand {
  body: string;
  userId: string;
}

export interface IHubUser {
  id: string;
  name: string;
}

export interface IContextMenuData {
  text: string;
  item: any;
  icon?: string;
  handler: (item: any) => void;
  isDivider?: boolean;
  isDowntime?: boolean;
  filter?: IAbilityFilter;
  pets?: any[];
  isCheckBox?: boolean;
  checked?: boolean;
  hidden?: any[];
}

export const byName = (ids: string[], names: string[]) => {
  return new ByNameDetecor(ids, names);
}

export const byBuffApply = (id: number, abilityName?: string) => {
  return new ByBuffApplyDetector(id, abilityName);
}

export const byBuffRemove = (id: number, abilityName?: string, offsetCorrect?: number) => {
  return new ByBuffRemoveDetector(id, abilityName, offsetCorrect);
}

const isAbility = (ev: FF.Event): ev is FF.AbilityEvent => {
  return (ev.type === "cast");
}

const isBuffApply = (ev: FF.Event): ev is FF.BuffEvent => {
  return (ev.type === "applybuff");
}

const isBuffRemove = (ev: FF.Event): ev is FF.BuffEvent => {
  return (ev.type === "removebuff");
}

export interface IDetectionDependencies {
  abilities: number[];
  buffs: number[];
}

export interface IDetectionStrategy {
  process(ev: FF.Event): { offset: number, name: string };
  deps: IDetectionDependencies;
}

export interface IOverlapCheckContext {
  holders: Holders;
  id: string;
  ability: IAbility;
  group: string;
  start: Date;
  end: Date;
  selectionRegistry: string[];
}

export interface IOverlapStrategy {
  check(context: IOverlapCheckContext): boolean;
  getDependencies(): string[];
}


class ByNameDetecor implements IDetectionStrategy {
  constructor(private ids: string[], private names: string[]) {
    this.names = names;
  }

  process(ev: FF.Event): { offset: number; name: string } {
    if (isAbility(ev)) {
      if (this.names.some((n => n === ev.ability.name) as any)) {
        return { offset: ev.timestamp, name: this.names[0] }
      }
    }
    return null;
  }

  get deps(): IDetectionDependencies {
    return {
      abilities: this.ids.map(it => parseInt(it)),
      buffs: []
    }
  }
}

export class BaseOverlapStrategy implements IOverlapStrategy {
  getDependencies(): string[] {
    return null;
  }

  check(context: IOverlapCheckContext): boolean {

    const result = context.holders.itemUsages.getByAbility(context.group).some((x: AbilityUsageMap) => {
      const chargesBased = !!x.ability.ability.charges;
      if (chargesBased) return false;

      const idCheck = (context.id === undefined || x.id !== context.id);
      const timeCheck = x.start < context.end && x.end > context.start;
      const selectionCheck = (!context.selectionRegistry || !(x.id in context.selectionRegistry));
      const result = idCheck && timeCheck && selectionCheck;
      return result as any;
    });
    return result;
  }
}

export class SharedOverlapStrategy implements IOverlapStrategy {
  getDependencies(): string[] {
    return this.sharesWith;
  }

  constructor(private sharesWith: string[]) {

  }
  check(context: IOverlapCheckContext): boolean {
    const map = context.holders.abilities.get(context.group);
    const items = context.holders.itemUsages.getByAbility(context.group);
    const sharedAbility = context.holders.abilities.getByParentAndAbility(map.job.id, this.sharesWith[0]);
    const sharedItems = context.holders.itemUsages.getByAbility(sharedAbility.id);
    

    const result = [...items,...sharedItems].some((x: AbilityUsageMap) => {
      const chargesBased = !!x.ability.ability.charges;
      if (chargesBased) return false;

      const idCheck = (context.id === undefined || x.id !== context.id);
      const timeCheck = x.start < context.end && x.end > context.start;
      const selectionCheck = (!context.selectionRegistry || x.id in context.selectionRegistry);
      const result = idCheck && timeCheck && selectionCheck;
      return result as any;
    });
    return result;
  }
}

class ChargesBasedOverlapStrategy implements IOverlapStrategy {
  getDependencies(): string[] {
    return null;
  }

  check(): boolean {
    return false;
  }
}

class ByBuffApplyDetector implements IDetectionStrategy {
  constructor(private id: number, private abilityName?: string) {
  }

  process(ev: FF.Event): { offset: number; name: string } {
    if (isBuffApply(ev)) {
      if (ev.ability.guid === this.id) {
        return { offset: ev.timestamp, name: this.abilityName || ev.ability.name }
      }
    }
    return null;
  }

  get deps(): IDetectionDependencies {
    return {
      abilities: [],
      buffs: [this.id]
    };
  }
}

class ByBuffRemoveDetector implements IDetectionStrategy {
  constructor(private id: number, private abilityName?: string, private offsetCorrection?: number) {
  }

  process(ev: FF.Event): { offset: number; name: string } {
    if (isBuffRemove(ev)) {
      if (ev.ability.guid === this.id && ev.sourceID === ev.targetID) {
        return { offset: ev.timestamp - (this.offsetCorrection || 0) * 1000, name: this.abilityName || ev.ability.name }
      }
    }
    return null;
  }

  get deps(): IDetectionDependencies {
    return {
      abilities: [],
      buffs: [this.id]
    };
  }
}

export interface IAbility {
  name: string;
  duration: number;
  cooldown: number;
  requiresBossTarget?: boolean;
  icon?: string;
  xivDbId?: string;
  xivDbType?: string;
  relatedAbilities?: IRelatedAbilitiesOptions;
  extendDurationOnNextAbility?: number;
  settings?: IAbilitySetting[] | null;
  abilityType: AbilityType;
  pet?: string;
  activationOffset?:number;
  detectStrategy?: IDetectionStrategy;
  overlapStrategy?: IOverlapStrategy;
  charges?: IAbilityCharges;
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

export interface IAbilitySettingData {
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
  BossAttack ='b',
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

export interface IFightData {
  fight?: IFight;
  boss?: IBoss;
  importedFrom?: string;
}

export interface IBossAbility {
  name?: string;
  type?: DamageType;
  offset?: string;
  isTankBuster?: boolean;
  isAoe?: boolean;
  isShareDamage?: boolean;
  syncSettings?: string;
  syncDowntime?: string;
  syncPreDowntime?: string;
  description?: string;
  source?:string;
}

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
  pet?: boolean;
  unused?: boolean;
  enmity?: boolean;
};

export interface IBossAttackFilter {
  isTankBuster: boolean;
  isAoe: boolean;
  isShareDamage: boolean;
  isOther: boolean;
  isMagical: boolean;
  isPhysical: boolean;
  isUnaspected: boolean;
  keywords: string[];
}

export interface IFilter {
  abilities: IAbilityFilter;
  attacks?: IBossAttackFilter;
}

export const defaultFilter: IFilter = {
  abilities: {
    damage: true,
    selfDefence: true,
    partyDefence: true,
    healing: true,
    healingBuff: true,
    partyDamageBuff: true,
    selfDamageBuff: true,
    pet: true,
    unused: true,
    utility: true,
  },
  attacks: {
    isAoe: true,
    isShareDamage: true,
    isTankBuster: true,
    isOther: true,
    isMagical: true,
    isPhysical: true,
    isUnaspected: true,
    keywords: []
  }
};

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

export const defaultView: IView = {
  buffmap: false,
  ogcdAsPoints: false,
  showDowntimesInPartyArea: false,
  verticalBossAttacks: false,
  compactView: false,
  highlightLoaded: false,
  showAbilityAvailablity: false,
  colorfulDurations: false
};

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


