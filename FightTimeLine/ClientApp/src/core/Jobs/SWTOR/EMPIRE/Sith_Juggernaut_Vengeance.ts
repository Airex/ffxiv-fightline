import { IJob, Role, AbilityType } from "../../../Models"
import { settings } from "../../FFXIV/shared"
import * as Fractions from "../fractions";

export const Sith_Juggernaut_Vengeance: IJob = {
  name: "Vengeance",
  role: Role.Melee,
  fraction: Fractions.SWTORFractions.Empire,
  baseClass: "Sith Juggernaut",
  icon: ("EMPIRE/SITH Juggernaut/Vengeance/!!!SpecIcon.jpg"),
  abilities: [
    {
      name: "Saber Reflect",
      duration: 5,
      cooldown: 60,
      icon: ("EMPIRE/SITH Juggernaut/Immortal/saber_reflect"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Endure Pain",
      duration: 10,
      cooldown: 60,
      icon: ("EMPIRE/SITH Juggernaut/Immortal/endure_pain"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Saber Ward",
      duration: 12,
      cooldown: 180,
      icon: ("EMPIRE/SITH Juggernaut/saber ward"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Enraged Defense",
      duration: 15,
      cooldown: 90,
      icon: ("EMPIRE/SITH Juggernaut/Through Passion"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Mad Dash",
      duration: 2,
      cooldown: 45,
      icon: ("EMPIRE/SITH Juggernaut/mad dash"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Medpac",
      duration: 30,
      cooldown: 90,
      icon: ("CrossRole/05medpac"),
      abilityType: AbilityType.Healing,
    },
    {
      name: "DPS Adrenal",
      duration: 15,
      cooldown: 180,
      icon: ("CrossRole/07_dps_adrenal.png"),
      abilityType: AbilityType.SelfDamageBuff
    },
    {
      name: "Intimidating Roar",
      duration: 6,
      cooldown: 60,
      icon: ("EMPIRE/SITH Juggernaut/intimidating roar"),
      abilityType: AbilityType.Utility,
      settings: [settings.target],
    },
    {
      name: "Unleash",
      duration: 4,
      cooldown: 120,
      icon: ("EMPIRE/SITH Juggernaut/unleash"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Disruption",
      duration: 4,
      cooldown: 12,
      requiresBossTarget: true,
      icon: ("EMPIRE/SITH Juggernaut/disruption"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Mass Taunt",
      duration: 6,
      cooldown: 45,
      icon: "EMPIRE/SITH Juggernaut/Immortal/11mass_taunt.png",
      abilityType: AbilityType.Utility,
    }
  ]
};
