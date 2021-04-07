import { IJob, Role, AbilityType } from "../../../Models"
import * as Fractions from "../fractions";

export const Powertech_Pyrotech: IJob = {
  name: "Pyrotech",
  role: Role.Melee,
  fraction: Fractions.SWTORFractions.Empire,
  baseClass: "Powertech",
  icon: ("EMPIRE/Powertech/Pyrotech/!!!SpecIcon.jpg"),
  abilities: [
    {
      name: "Energy Shield",
      duration: 15,
      cooldown: 110,
      icon: ("EMPIRE/Powertech/energy shield"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Explosive Fuel",
      duration: 15,
      cooldown: 120,
      icon: ("EMPIRE/Powertech/Shield Tech/explosive_fuel"),
      abilityType: AbilityType.SelfDamageBuff
    },
    {
      name: "Shoulder Cannon",
      duration: 15,
      cooldown: 90,
      icon: ("EMPIRE/Powertech/Shield Tech/shoulder_cannon"),
      abilityType: AbilityType.SelfDamageBuff
    },
    {
      name: "Sonic Missile",
      duration: 6,
      cooldown: 45,
      icon: ("EMPIRE/Powertech/Shield Tech/sonicmissle"),
      abilityType: AbilityType.PartyDamageBuff
    },
    {
      name: "Kolto Overload",
      duration: 60,
      cooldown: 180,
      icon: ("EMPIRE/Powertech/kolto overload"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Hydraulic Overrides",
      duration: 2,
      cooldown: 35,
      icon: ("EMPIRE/Powertech/hydraulic overrides"),
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
      name: "DPS Adrenal",
      duration: 15,
      cooldown: 180,
      icon: ("CrossRole/07_dps_adrenal.png"),
      abilityType: AbilityType.SelfDamageBuff
    },
    {
      name: "Carbonize",
      duration: 3,
      cooldown: 45,
      icon: ("EMPIRE/Powertech/Shield Tech/carbonize"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Determination",
      duration: 4,
      cooldown: 120,
      icon: ("EMPIRE/Powertech/determination"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Quell",
      duration: 4,
      cooldown: 12,
      requiresBossTarget: true,
      icon: ("EMPIRE/Powertech/Shield Tech/quell"),
      abilityType: AbilityType.Utility
    }
  ]
  ,};




