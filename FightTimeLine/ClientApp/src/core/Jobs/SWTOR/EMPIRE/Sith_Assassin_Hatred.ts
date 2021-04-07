import { IJob, Role, AbilityType } from "../../../Models"
import * as Fractions from "../fractions";

export const Sith_Assassin_Hatred: IJob = {
  name: "Hatred",
  role: Role.Melee,
  fraction: Fractions.SWTORFractions.Empire,
  baseClass: "Sith Assassin",
  icon: ("EMPIRE/SITH ASSASSIN/Hatred/!!!SpecIcon.jpg"),
  abilities: [
    {
      name: "Force Shroud",
      duration: 5,
      cooldown: 53,
      icon: ("EMPIRE/SITH ASSASSIN/Darkness/force_shroud.png"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Force Speed",
      duration: 2,
      cooldown: 15,
      icon: ("EMPIRE/SITH ASSASSIN/force speed"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Force Cloak",
      duration: 3,
      cooldown: 75,
      requiresBossTarget: true,
      icon: ("EMPIRE/SITH ASSASSIN/Fade"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Deflection",
      duration: 15,
      cooldown: 110,
      icon: ("EMPIRE/SITH ASSASSIN/Darkness/deflection.png"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Overcharge Saber",
      duration: 15,
      cooldown: 120,
      icon: ("EMPIRE/SITH ASSASSIN/Darkness/overcharge.png"),
      abilityType: AbilityType.SelfDefense,

    },
    {
      name: "Medpac",
      duration: 30,
      cooldown: 90,
      icon: ("CrossRole/05medpac.jpg"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Shield Adrenal",
      duration: 15,
      cooldown: 180,
      icon: ("CrossRole/06shield_adrenal"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Recklesness",
      duration: 12,
      cooldown: 120,
      icon: ("EMPIRE/SITH ASSASSIN/recklessness"),
      abilityType: AbilityType.SelfDamageBuff,
    },
    {
      name: "Avoidance",
      duration: 1,
      cooldown: 90,
      icon: ("EMPIRE/SITH ASSASSIN/Avoidance"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Jolt",
      duration: 1,
      cooldown: 16,
      requiresBossTarget: true,
      icon: ("EMPIRE/SITH ASSASSIN/Jolt"),
      abilityType: AbilityType.PartyDefense,
    },
    {
      name: "Mass Taunt",
      duration: 1,
      cooldown: 40,
      icon: "EMPIRE/SITH ASSASSIN/Darkness/11mass_taunt.png",
      abilityType: AbilityType.Utility | AbilityType.Enmity,
    }
  ]
};


