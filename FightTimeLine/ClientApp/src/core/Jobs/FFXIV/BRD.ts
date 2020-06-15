import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, rangeSharedAbilities, medicine } from "./shared"

export const BRD: IJob = {
  name: "BRD",
  fullName: "Bard",
  role: Role.Range,
  icon: ("JobIcons/Bard_Icon_10"),
  abilities: [
    {
      name: "Raging Strikes",
      duration: 20,
      cooldown: 80,
      xivDbId: "101",
      icon: ("41_Bard/0101_Raging Strikes"),
      abilityType: AbilityType.SelfDamageBuff,
    },
    {
      name: "Barrage",
      duration: 10,
      cooldown: 80,
      xivDbId: "107",
      icon: ("41_Bard/0107_Barrage"),
      abilityType: AbilityType.SelfDamageBuff,
    },
    {
      name: "Mage's Ballad",
      duration: 30,
      cooldown: 80,
      xivDbId: "114",
      requiresBossTarget: true,
      icon: ("41_Bard/0114_Mages Ballad"),
      abilityType: AbilityType.Damage,
      relatedAbilities:
      {
        affects: ["Army's Paeon", "The Wanderer's Minuet"],
        affectedBy: ["Army's Paeon", "The Wanderer's Minuet"],
        parentOnly: true
      },
    },
    {
      name: "Army's Paeon",
      duration: 30,
      cooldown: 80,
      xivDbId: "116",
      requiresBossTarget: true,
      icon: ("41_Bard/8844_Armys Paeon"),
      abilityType: AbilityType.Damage,
      relatedAbilities:
      {
        affects: ["Mage's Ballad", "The Wanderer's Minuet"],
        affectedBy: ["Mage's Ballad", "The Wanderer's Minuet"],
        parentOnly: true
      },
    },
    {
      name: "Battle Voice",
      duration: 20,
      cooldown: 180,
      requiresBossTarget: true,
      xivDbId: "118",
      icon: ("41_Bard/0118_Battle Voice"),
      abilityType: AbilityType.PartyDamageBuff,
    },
    {
      name: "The Wanderer's Minuet",
      duration: 30,
      cooldown: 80,
      xivDbId: "3559",
      icon: ("41_Bard/8843_The Wanderers Minuet"),
      abilityType: AbilityType.Damage,
      relatedAbilities:
      {
        affects: ["Mage's Ballad", "Army's Paeon"],
        affectedBy: ["Mage's Ballad", "Army's Paeon"],
        parentOnly: true
      },
      detectStrategy: byName(["3559"], ["The Wanderer's Minuet", "the Wanderer's Minuet"])
    },
    {
      name: "Sidewinder",
      duration: 0,
      cooldown: 60,
      xivDbId: "3562",
      requiresBossTarget: true,
      icon: ("41_Bard/8841_Sidewinder"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Troubadour",
      duration: 15,
      cooldown: 120,
      requiresBossTarget: true,
      xivDbId: "7405",
      icon: ("41_Bard/7405_Troubadour"),
      abilityType: AbilityType.PartyDefense,
    },
    {
      name: "Nature's Minne",
      duration: 15,
      cooldown: 90,
      xivDbId: "7408",
      icon: ("41_Bard/7408_Natures Minne"),
      abilityType: AbilityType.HealingBuff,
      settings: [settings.target],
    },
    {
      name: "Shadowbite",
      duration: 0,
      cooldown: 60,
      xivDbId: "16494",
      icon: ("41_Bard/icon_25 (1)"),
      abilityType: AbilityType.Damage
    },
    ...getAbilitiesFrom(rangeSharedAbilities),
    medicine["Dexterity"]
  ]
};


