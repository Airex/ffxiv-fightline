import { IJob, Role, AbilityType } from "../../Models"
import { getAbilitiesFrom, casterSharedAbilities, medicine } from "./shared"

export const RDM: IJob = {
  name: "RDM",
  fullName:"Red Mage",
  role: Role.Caster,
  icon: ("JobIcons/Red_Mage_Icon_10"),
  abilities: [
    {
      name: "Embolden",
      duration: 20,
      cooldown: 120,
      xivDbId: "7520",
      icon: ("53_RedMage/7520_Embolden"),
      abilityType: AbilityType.PartyDamageBuff,
      levelAcquired: 60
    },
    {
      name: "Fleche",
      duration: 0,
      cooldown: 25,
      xivDbId: "7517",
      requiresBossTarget: true,
      icon: ("53_RedMage/7517_Fleche"),
      abilityType: AbilityType.Damage,
      levelAcquired: 45
    },
    {
      name: "Contre Sixte",
      duration: 0,
      cooldown: 35,
      xivDbId: "7519",
      requiresBossTarget: true,
      icon: ("53_RedMage/7519_Contre Sixte"),
      abilityType: AbilityType.Damage,
      levelAcquired: 56
    },
    {
      name: "Manafication",
      duration: 10,
      cooldown: 110,
      xivDbId: "7521",
      requiresBossTarget: true,
      icon: ("53_RedMage/7521_Manafication"),
      abilityType: AbilityType.SelfDamageBuff,
      levelAcquired: 60
    },
    {
      name: "Acceleration",
      duration: 20,
      cooldown: 55,
      xivDbId: "7518",
      requiresBossTarget: false,
      icon: ("53_RedMage/7518_Acceleration"),
      abilityType: AbilityType.Utility,
      levelAcquired: 50
    },
    ...getAbilitiesFrom(casterSharedAbilities),
    medicine["Intelligence"]
  ]
};


