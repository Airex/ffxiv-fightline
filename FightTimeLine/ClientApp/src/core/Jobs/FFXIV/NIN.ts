import { IJob, Role, AbilityType } from "../../Models"
import { getAbilitiesFrom, meleeSharedAbilities, medicine } from "./shared"

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
      abilityType: AbilityType.SelfShield,
      defensiveStats: {
        shieldPercent: 20
      },
      levelAcquired: 2
    },
    {
      name: "Mug",
      duration: 0,
      cooldown: 120,
      xivDbId: "2248",
      requiresBossTarget: true,
      icon: ("33_Ninja/8813_Mug"),
      abilityType: AbilityType.Damage,
      levelAcquired: 15
    },
    {
      name: "Trick Attack",
      duration: 15,
      cooldown: 60,
      xivDbId: "2258",
      requiresBossTarget: true,
      icon: ("33_Ninja/2258_Trick Attack"),
      abilityType: AbilityType.PartyDamageBuff,
      levelAcquired: 18
    },
    {
      name: "Kassatsu",
      duration: 0,
      cooldown: 60,
      xivDbId: "2264",
      requiresBossTarget: true,
      icon: ("33_Ninja/2264_Kassatsu"),
      abilityType: AbilityType.Damage,
      levelAcquired: 50
    },
    {
      name: "Dream Within a Dream",
      duration: 15,
      cooldown: 60,
      xivDbId: "3566",
      requiresBossTarget: true,
      icon: ("33_Ninja/3566_Dream Within A Dream"),
      abilityType: AbilityType.Damage,
      levelAcquired: 56
    },
    {
      name: "Bhavacakra",
      duration: 0,
      cooldown: 1,
      xivDbId: "7402",
      requiresBossTarget: true,
      icon: ("33_Ninja/8815_Bhavacakra"),
      abilityType: AbilityType.Damage,
      levelAcquired: 68
    },
    {
      name: "Ten Chi Jin",
      duration: 6,
      cooldown: 120,
      xivDbId: "7403",
      requiresBossTarget: true,
      icon: ("33_Ninja/7403_Ten Chi Jin"),
      abilityType: AbilityType.SelfDamageBuff,
      levelAcquired: 70
    },
    {
      name: "Meisui",
      duration: 0,
      cooldown: 60,
      xivDbId: "16489",
      requiresBossTarget: true,
      icon: ("33_Ninja/icon_24"),
      abilityType: AbilityType.Damage,
      levelAcquired: 72
    },
    {
      name: "Bunshin",
      duration: 30,
      cooldown: 90,
      xivDbId: "16493",
      requiresBossTarget: true,
      icon: ("33_Ninja/icon_25"),
      abilityType: AbilityType.SelfDamageBuff,
      levelAcquired: 80
    },
    ...getAbilitiesFrom(meleeSharedAbilities),
    medicine["Dexterity"]
  ]
};


