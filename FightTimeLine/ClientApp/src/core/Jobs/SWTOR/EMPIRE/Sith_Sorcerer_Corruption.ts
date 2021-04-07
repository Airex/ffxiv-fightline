import { IJob, Role, AbilityType } from "../../../Models"
import { settings } from "../../FFXIV/shared"
import * as Fractions from "../fractions";

export const Sith_Sorcerer_Corruption: IJob = {
  name: "Corruption",
  role: Role.Melee,
  fraction: Fractions.SWTORFractions.Empire,
  baseClass: "Sith Sorcerer",
  icon: ("EMPIRE/SITH Sorcerer/Corruption/!!!SpecIcon.jpg"),
  abilities: [
    {
      name: "Unlimited Power",
      duration: 10,
      cooldown: 300,
      icon: ("EMPIRE/SITH Sorcerer/Corruption/unlimited_power"),
      abilityType: AbilityType.PartyDamageBuff,
      settings: [settings.target],
    },
    {
      name: "Force Barrier",
      duration: 8,
      cooldown: 180,
      icon: ("EMPIRE/SITH Sorcerer/Corruption/force_barrier"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Cloud Mind",
      duration: 6,
      cooldown: 45,
      icon: ("EMPIRE/SITH Sorcerer/suppression"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Polarity Shift",
      duration: 10,
      cooldown: 104,
      icon: ("EMPIRE/SITH Sorcerer/Corruption/polarity_shift"),
      abilityType: AbilityType.SelfDamageBuff
    },
    {
      name: "Recklesness",
      duration: 20,
      cooldown: 90,
      icon: ("EMPIRE/SITH Sorcerer/recklessness"),
      abilityType: AbilityType.SelfDamageBuff,
      settings: [settings.target],
    },
    {
      name: "Whirlwind",
      duration: 60,
      cooldown: 52,
      icon: ("EMPIRE/SITH Sorcerer/whirlwind"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Medpac",
      duration: 30,
      cooldown: 90,
      icon: ("CrossRole/05medpac"),
      abilityType: AbilityType.Healing,
    },
    {
      name: "Adrenal",
      duration: 15,
      cooldown: 180,
      icon: ("CrossRole/07_dps_adrenal.png"),
      abilityType: AbilityType.SelfDamageBuff
    },
    {
      name: "Phase Walk",
      duration: 4,
      cooldown: 60,
      icon: ("EMPIRE/SITH Sorcerer/phase walk"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Extrication",
      duration: 6,
      cooldown: 52,
      icon: ("EMPIRE/SITH Sorcerer/Corruption/extrication"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Stun Breaker",
      duration: 4,
      cooldown: 120,
      icon: ("EMPIRE/SITH Assassin/avoidance"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Jolt",
      duration: 1,
      cooldown: 18,
      requiresBossTarget: true,
      icon: ("EMPIRE/SITH Sorcerer/jolt"),
      abilityType: AbilityType.Utility,
      settings: [settings.target],
    }
  ]
};
