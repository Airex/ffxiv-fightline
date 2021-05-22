import { IJob, Role, AbilityType } from "../../Models"
import { settings, getAbilitiesFrom, rangeSharedAbilities, abilitySortFn, medicine } from "./shared"

export const DNC: IJob = {
  name: "DNC",
  fullName: "Dancer",
  role: Role.Range,
  icon: ("JobIcons/Dancer"),
  abilities: [
    {
      name: "Shield Samba",
      duration: 15,
      cooldown: 120,
      xivDbId: "16012",
      icon: ("Dancer/icon_14"),
      abilityType: AbilityType.PartyDefense,
      defensiveStats: {
        mitigationPercent: 10,
        shareGroup: "rangeDef"
      },
      levelAcquired: 56
    },
    {
      name: "Improvisation",
      duration: 15,
      cooldown: 120,
      xivDbId: "16014",
      icon: ("Dancer/icon_21"),
      abilityType: AbilityType.Utility,
      levelAcquired: 80
    },
    {
      name: "Flourish",
      duration: 0,
      cooldown: 60,
      xivDbId: "16013",
      icon: ("Dancer/icon_19"),
      abilityType: AbilityType.Utility,
      levelAcquired: 72
    },
    {
      name: "Devilment",
      duration: 20,
      cooldown: 120,
      xivDbId: "16011",
      icon: ("Dancer/icon_16"),
      abilityType: AbilityType.SelfDamageBuff,
      levelAcquired: 62
    },
    {
      name: "Closed Position",
      duration: 0,
      cooldown: 30,
      xivDbId: "16006",
      icon: ("Dancer/icon_15"),
      abilityType: AbilityType.Utility,
      settings: [settings.target],
      levelAcquired: 60
    },
    {
      name: "Curing Waltz",
      duration: 0,
      cooldown: 60,
      xivDbId: "16015",
      icon: ("Dancer/icon_13"),
      abilityType: AbilityType.Healing,
      levelAcquired: 52
    },
    {
      name: "Standard Step",
      duration: 30,
      cooldown: 30,
      activationOffset: 2,
      xivDbId: "15997",
      icon: ("Dancer/icon_04"),
      abilityType: AbilityType.SelfDamageBuff,
      levelAcquired: 15
    },
    {
      name: "Technical Step",
      duration: 20,
      cooldown: 120,
      xivDbId: "15998",
      activationOffset: 4,
      icon: ("Dancer/icon_18"),
      abilityType: AbilityType.SelfDamageBuff | AbilityType.PartyDamageBuff,
      levelAcquired: 70
    },
    ...getAbilitiesFrom(rangeSharedAbilities),
    medicine["Dexterity"]
  ].sort(abilitySortFn),
};


