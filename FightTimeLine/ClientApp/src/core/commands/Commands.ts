import { IBossAbility, ISettingData } from "../Models";
import { AbilityMap, AbilityUsageMap } from "../Maps/index";


export interface IAbilityWithUsages { map: AbilityMap; usages: AbilityUsageMap[]; }

export interface IAddAbilityParams {
  id: string;
  jobGroup: string;
  abilityName: string;
  time: string;
  loaded: boolean;
  jobActor: string;
  settings: ISettingData[];
}

export interface IAddBossAttackParams {
  id: string;
  attack: IBossAbility;
}


