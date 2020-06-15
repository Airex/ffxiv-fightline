import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../../Models"
import { settings, IAbilities, getAbilitiesFrom, meleeSharedAbilities, medicine } from "./shared"

export const NIN: IJob = {
  name: "NIN",
  fullName:"Ninja",
  role: Role.Melee,
  icon: ("JobIcons/Ninja_Icon_10"),
  abilities: [
    {
      name: "Shade Shift",
      duration: 20,
      cooldown: 120,
      xivDbId: "2241",
      icon: ("33_Ninja/2241_Shade Shift"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Mug",
      duration: 0,
      cooldown: 120,
      xivDbId: "2248",
      requiresBossTarget: true,
      icon: ("33_Ninja/8813_Mug"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Trick Attack",
      duration: 15,
      cooldown: 60,
      xivDbId: "2258",
      requiresBossTarget: true,
      icon: ("33_Ninja/2258_Trick Attack"),
      abilityType: AbilityType.PartyDamageBuff,
    },
    {
      name: "Kassatsu",
      duration: 0,
      cooldown: 60,
      xivDbId: "2264",
      requiresBossTarget: true,
      icon: ("33_Ninja/2264_Kassatsu"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Dream Within a Dream",
      duration: 15,
      cooldown: 60,
      xivDbId: "3566",
      requiresBossTarget: true,
      icon: ("33_Ninja/3566_Dream Within A Dream"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Bhavacakra",
      duration: 0,
      cooldown: 1,
      xivDbId: "7402",
      requiresBossTarget: true,
      icon: ("33_Ninja/8815_Bhavacakra"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Ten Chi Jin",
      duration: 6,
      cooldown: 120,
      xivDbId: "7403",
      requiresBossTarget: true,
      icon: ("33_Ninja/7403_Ten Chi Jin"),
      abilityType: AbilityType.SelfDamageBuff,
    },
    {
      name: "Meisui",
      duration: 0,
      cooldown: 60,
      xivDbId: "16489",
      requiresBossTarget: true,
      icon: ("33_Ninja/icon_24"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Bunshin",
      duration: 30,
      cooldown: 90,
      xivDbId: "16493",
      requiresBossTarget: true,
      icon: ("33_Ninja/icon_25"),
      abilityType: AbilityType.SelfDamageBuff,
    },
    ...getAbilitiesFrom(meleeSharedAbilities),
    medicine["Dexterity"]
  ]
};


