import { IJob, Role, AbilityType,  } from "../../Models"
import { getAbilitiesFrom, meleeSharedAbilities, medicine } from "./shared"

export const SAM: IJob = {
  name: "SAM",
  fullName:"Samurai",
  role: Role.Melee,
  icon: ("JobIcons/Samurai_Icon_10"),
  abilities: [
    {
      name: "Meikyo Shisui",
      duration: 15,
      cooldown: 55,
      xivDbId: "7499",
      icon: ("34_Samurai/7499_Meikyo Shisui"),
      abilityType: AbilityType.Utility,
      levelAcquired: 50
    },
//    {
//      name: "Meditate",
//      duration: 15,
//      cooldown: 45,
//      xivDbId: "7497",
//      icon: ("34_Samurai/7497_Meditate"),
//      abilityType: AbilityType.Utility,
//    },
    {
      name: "Ikishoten",
      duration: 0,
      cooldown: 60,
      xivDbId: "16482",
      icon: ("34_Samurai/icon_22"),
      abilityType: AbilityType.Utility,
      levelAcquired: 68
    },
    {
      name: "Hissatsu: Guren",
      duration: 0,
      cooldown: 120,
      xivDbId: "7496",
      icon: ("34_Samurai/7496_Hissatsu Guren"),
      abilityType: AbilityType.Damage,
      levelAcquired: 70
    },
    {
      name: "Hissatsu: Senei",
      duration: 0,
      cooldown: 120,
      xivDbId: "16481",
      icon: ("34_Samurai/icon_24"),
      abilityType: AbilityType.Damage,
      levelAcquired: 72
    },
    {
      name: "Tsubame-gaeshi",
      duration: 0,
      cooldown: 60,
      xivDbId: "16483",
      icon: ("34_Samurai/icon_25"),
      abilityType: AbilityType.Damage,
      levelAcquired: 76
    },
    {
      name: "Shoha",
      duration: 0,
      cooldown: 15,
      xivDbId: "16487",
      icon: ("34_Samurai/icon_26"),
      abilityType: AbilityType.Damage,
      levelAcquired: 80
    },

    ...getAbilitiesFrom(meleeSharedAbilities),
    medicine["Strength"]
  ]
};


