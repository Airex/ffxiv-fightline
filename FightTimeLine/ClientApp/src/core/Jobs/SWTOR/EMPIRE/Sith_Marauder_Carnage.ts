import { IJob, Role, AbilityType } from "../../../Models"
import { settings } from "../../FFXIV/shared"
import * as Fractions from "../fractions";

export const Sith_Marauder_Carnage: IJob = {
  name: "Carnage",
  role: Role.Melee,
  fraction: Fractions.SWTORFractions.Empire,
  baseClass: "Sith Marauder",
  icon: ("EMPIRE/SITH Marauder/Carnage/!!!SpecIcon.jpg"),
  abilities: [
    {
      name: "Predation",
      duration: 10,
      cooldown: 30,
      icon: ("EMPIRE/SITH Marauder/predation"),
      abilityType: AbilityType.Utility | AbilityType.PartyDefense,
    },
    {
      name: "Cloak of Pain",
      duration: 30,
      cooldown: 60,
      icon: ("EMPIRE/SITH Marauder/cloak of rage"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Undying Rage",
      duration: 4,
      cooldown: 180,
      icon: ("EMPIRE/SITH Marauder/Undying"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Saber Ward",
      duration: 12,
      cooldown: 180,
      icon: ("EMPIRE/SITH Marauder/saber ward"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Force Camouflage",
      duration: 5,
      cooldown: 45,
      icon: ("EMPIRE/SITH Marauder/force_camouflage"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Mad Dash",
      duration: 2,
      cooldown: 45,
      icon: ("EMPIRE/SITH Marauder/mad dash"),
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
      icon: ("EMPIRE/SITH Marauder/intimidating roar"),
      abilityType: AbilityType.Utility,
      settings: [settings.target],
    },
    {
      name: "Obfuscate",
      duration: 6,
      cooldown: 45,
      icon: "EMPIRE/SITH Marauder/obfuscate",
      requiresBossTarget: true,
      abilityType: AbilityType.Utility | AbilityType.PartyDefense,
    },
    {
      name: "Unleash",
      duration: 4,
      cooldown: 120,
      icon: ("EMPIRE/SITH Marauder/unleash"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Disruption",
      duration: 4,
      cooldown: 12,
      requiresBossTarget: true,
      icon: ("EMPIRE/SITH Marauder/disruption"),
      abilityType: AbilityType.Utility,
      settings: [settings.target],
    }
  ]
};
