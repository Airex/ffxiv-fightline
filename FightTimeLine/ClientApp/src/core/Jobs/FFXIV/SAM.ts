import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../../Models"
import { settings, IAbilities, getAbilitiesFrom, meleeSharedAbilities, medicine } from "./shared"

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
    },
    {
      name: "Hissatsu: Guren",
      duration: 0,
      cooldown: 120,
      xivDbId: "7496",
      icon: ("34_Samurai/7496_Hissatsu Guren"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Hissatsu: Senei",
      duration: 0,
      cooldown: 120,
      xivDbId: "16481",
      icon: ("34_Samurai/icon_24"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Tsubame-gaeshi",
      duration: 0,
      cooldown: 60,
      xivDbId: "16483",
      icon: ("34_Samurai/icon_25"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Shoha",
      duration: 0,
      cooldown: 15,
      xivDbId: "16487",
      icon: ("34_Samurai/icon_26"),
      abilityType: AbilityType.Damage,
    },

    ...getAbilitiesFrom(meleeSharedAbilities),
    medicine["Strength"]
  ]
};


