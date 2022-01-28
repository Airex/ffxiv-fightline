import { byBuffRemove } from "src/core/AbilityDetectors";
import Effects from "src/core/Effects";
import { IAbility, IAbilitySetting, AbilityType, DamageType } from "../../Models"

export type IAbilities = {
  [name: string]: IAbility
}

export const abilitySortFn = (a1: IAbility, a2: IAbility): number => {
  const st: AbilityType[] = [
    AbilityType.PartyDefense,
    AbilityType.PartyShield,
    AbilityType.TargetDefense,
    AbilityType.SelfShield,
    AbilityType.SelfDefense,
    AbilityType.PartyDamageBuff,
    AbilityType.SelfDamageBuff,
    AbilityType.Utility,
    AbilityType.Enmity,
    AbilityType.Damage,
    AbilityType.Healing,
    AbilityType.HealingBuff,
    AbilityType.Pet
  ];

  const ar1 = st.map((it, i) => it & a1.abilityType ? i + 1 : 0).find((it) => it > 0);
  const ar2 = st.map((it, i) => it & a2.abilityType ? i + 1 : 0).find((it) => it > 0);

  return ar1 - ar2;
}

export const getAbilitiesFrom = (arr: IAbilities): IAbility[] => {
  return Object.values(arr);
}

export enum SettingsEnum {
  Target = "target",
  ChangesTarget = "changesTarget",
  HealShield = "healShield",
  Note = "note",
  Activation = "activation"
}

export type SettingsType = { [T in SettingsEnum]: IAbilitySetting }


export const settings: SettingsType = {
  target: {
    name: "target",
    displayName: "Target",
    description: "Determines target of ability",
    type: "partyMember",
    default: "",
    process: (context, data) => {
      const target = context.parser.players.find(it1 => it1.id === data.targetID);
      return target && target.rid || null;
    }
  },
  changesTarget: <IAbilitySetting>{
    name: "changesTarget",
    displayName: "Changes target",
    description: "Determines if ability changes boss target",
    type: "boolean",
    default: true
  },
  healShield: <IAbilitySetting>{
    name: "healShield",
    displayName: "Shield?",
    description: "Determines if ability applies shield",
    type: "boolean",
    default: false
  },
  note: {
    name: "note",
    displayName: "Note",
    description: "",
    type: "text",
    default: ""
  },
  activation: {
    name: "activation",
    displayName: "Activated in",
    description: "Sets delay of status activation in seconds",
    type: "number",
    default: 0
  }
}

export const tankSharedAbilities: IAbilities = {
  Rampart: {
    name: "Rampart", cooldown: 90, xivDbId: "7531", iconPrefix: "tank", abilityType: AbilityType.SelfDefense,
    levelAcquired: 8,
    statuses: [{
      duration: 20,
      effects: [Effects.mitigation.solo(20)]
    }]
  },
  Reprisal: {
    name: "Reprisal", cooldown: 60, xivDbId: "7535", iconPrefix: "tank", abilityType: AbilityType.PartyDefense, requiresBossTarget: false,
    levelAcquired: 22,
    statuses: [{
      duration: 10,
      effects: [Effects.mitigation.party(10)]
    }]
  },
  Provoke: { name: "Provoke", levelAcquired: 15, cooldown: 30, xivDbId: "7533", iconPrefix: "tank", abilityType: AbilityType.Enmity, settings: [settings.changesTarget], requiresBossTarget: true, },
  Shirk: { name: "Shirk", levelAcquired: 48, cooldown: 120, xivDbId: "7537", iconPrefix: "tank", abilityType: AbilityType.Enmity }
};

const magicSharedAbilities: IAbilities = {
  Swiftcast: { name: "Swiftcast", levelAcquired: 18, cooldown: 60, iconPrefix: ("mrange"), xivDbId: "7561", abilityType: AbilityType.Utility },
  Surecast: {
    name: "Surecast", levelAcquired: 44, cooldown: 120, xivDbId: "7559", iconPrefix: ("mrange"), abilityType: AbilityType.Utility,
    statuses: [{
      duration: 6
    }]
  },
  LucidDreaming: {
    name: "Lucid Dreaming", levelAcquired: 24, cooldown: 60, xivDbId: "7562", iconPrefix: ("mrange"), abilityType: AbilityType.Utility, statuses: [
      { duration: 21 }
    ]
  },
};

export const meleeSharedAbilities: IAbilities = {
  Feint: {
    name: "Feint", cooldown: 90, xivDbId: "7549", iconPrefix: ("melee"), abilityType: AbilityType.PartyDefense, requiresBossTarget: true,
    levelAcquired: 2,
    statuses: [{
      duration: 10,
      effects: [Effects.mitigation.party(10, DamageType.Physical), Effects.mitigation.party(5, DamageType.Magical)]
    }]
  },
};
export const rangeSharedAbilities: IAbilities = {
};
export const casterSharedAbilities: IAbilities = {
  Addle: {
    name: "Addle", cooldown: 90, xivDbId: "7560", iconPrefix: ("mrange"), abilityType: AbilityType.PartyDefense, requiresBossTarget: true,
    levelAcquired: 8,
    statuses: [{
      duration: 10,
      effects: [Effects.mitigation.party(10, DamageType.Magical), Effects.mitigation.solo(5, DamageType.Physical)]
    }]
  },
  ...magicSharedAbilities
};
export const healerSharedAbilities: IAbilities = {
  ...magicSharedAbilities
};

enum MedicineEnum {
  Mind,
  Intelligence,
  Dexterity,
  Strength
}

const medicatedStatus = {
  duration: 10
}

export const medicine: { [TName in keyof typeof MedicineEnum]: IAbility } = {
  Mind: { name: "Medicine", statuses: [medicatedStatus], levelAcquired: 1, cooldown: 270, xivDbId: "27999", icon: ("Medicine/22451_Mind"), abilityType: AbilityType.SelfDamageBuff, xivDbType: "item", detectStrategy: byBuffRemove(1000049, "Medicine", 30) },
  Intelligence: { name: "Medicine", statuses: [medicatedStatus], levelAcquired: 1, cooldown: 270, xivDbId: "27998", icon: ("Medicine/22450_Intelligence"), abilityType: AbilityType.SelfDamageBuff, xivDbType: "item", detectStrategy: byBuffRemove(1000049, "Medicine", 30) },
  Dexterity: { name: "Medicine", statuses: [medicatedStatus], cooldown: 270, levelAcquired: 1, xivDbId: "27996", icon: ("Medicine/22448_Dexterity"), abilityType: AbilityType.SelfDamageBuff, xivDbType: "item", detectStrategy: byBuffRemove(1000049, "Medicine", 30) },
  Strength: { name: "Medicine", statuses: [medicatedStatus], cooldown: 270, levelAcquired: 1, xivDbId: "27995", icon: ("Medicine/22447_Strength"), abilityType: AbilityType.SelfDamageBuff, xivDbType: "item", detectStrategy: byBuffRemove(1000049, "Medicine", 30) },

};


