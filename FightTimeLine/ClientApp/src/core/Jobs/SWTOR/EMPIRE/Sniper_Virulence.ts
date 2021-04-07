import { AbilityType, IJob, Role } from "../../../Models"
import * as Fractions from "../fractions";

export const Sniper_Virulence: IJob = {
  name: "Virulence",
  role: Role.Melee,
  fraction: Fractions.SWTORFractions.Empire,
  baseClass: "Sniper",
  icon: ("EMPIRE/Sniper/Virulence/!!!SpecIcon.jpg"),
  abilities: [
    {
      name: "Ballistic Shield",
      duration: 25,
      cooldown: 150,
      icon: ("EMPIRE/Sniper/Deployed Shields"),
      abilityType: AbilityType.PartyDefense,
    },
    {
      name: "Diversion",
      duration: 8,
      cooldown: 54,
      icon: ("EMPIRE/Sniper/diversion"),
      abilityType: AbilityType.PartyDefense,
    },
    {
      name: "Evasion",
      duration: 3,
      cooldown: 60,
      icon: ("EMPIRE/Sniper/evasion"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Shield Probe",
      duration: 10,
      cooldown: 25,
      icon: ("EMPIRE/Sniper/shield probe"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Entrench",
      duration: 20,
      cooldown: 60,
      icon: ("EMPIRE/Sniper/entrench"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Imperial Preparation ",
      duration: 4,
      cooldown: 135,
      icon: ("EMPIRE/Sniper/imperial_preparation"),
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
      name: "Adrenal",
      duration: 15,
      cooldown: 180,
      icon: ("CrossRole/07_dps_adrenal.png"),
      abilityType: AbilityType.SelfDamageBuff
    },
    {
      name: "Escape",
      duration: 4,
      cooldown: 120,
      icon: ("EMPIRE/Sniper/escape"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Distraction",
      duration: 4,
      cooldown: 18,
      requiresBossTarget: true,
      icon: ("EMPIRE/Sniper/distraction"),
      abilityType: AbilityType.Utility,
    }
  ]
};
