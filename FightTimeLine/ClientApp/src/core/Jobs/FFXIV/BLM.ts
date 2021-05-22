import { IJob, Role, AbilityType} from "../../Models"
import { getAbilitiesFrom, casterSharedAbilities, medicine } from "./shared"

export const BLM: IJob = {
  name: "BLM",
  fullName: "Black Mage",
  role: Role.Caster,
  icon: ("JobIcons/Black_Mage_Icon_10"),
  abilities: [
    {
      name: "Transpose",
      duration: 0,
      cooldown: 5,
      xivDbId: "149",
      icon: ("51_BlackMage/0149_Transpose"),
      abilityType: AbilityType.Utility,
      levelAcquired: 4
    },
    {
      name: "Manaward",
      duration: 20,
      cooldown: 120,
      xivDbId: "157",
      icon: ("51_BlackMage/0157_Manaward"),
      abilityType: AbilityType.SelfShield,
      levelAcquired: 30
    },

    {
      name: "Manafont",
      duration: 0,
      cooldown: 180,
      xivDbId: "158",
      icon: ("51_BlackMage/0158_Convert"),
      abilityType: AbilityType.Utility,
      levelAcquired: 30
    },
    {
      name: "Ley Lines",
      duration: 30,
      cooldown: 90,
      xivDbId: "3573",
      icon: ("51_BlackMage/3573_Ley Lines"),
      abilityType: AbilityType.SelfDamageBuff,
      levelAcquired: 52
    },
    {
      name: "Enochian",
      duration: 30,
      cooldown: 30,
      requiresBossTarget: true,
      xivDbId: "3575",
      icon: ("51_BlackMage/3575_Enochian"),
      abilityType: AbilityType.SelfDamageBuff,
      levelAcquired: 56
    },
    {
      name: "Triplecast",
      duration: 15,
      cooldown: 60,
      xivDbId: "7421",
      icon: ("51_BlackMage/7421_Triplecast"),
      abilityType: AbilityType.Utility,
      levelAcquired: 65
    },
    {
      name: "Sharpcast",
      duration: 15,
      cooldown: 30,
      xivDbId: "3574",
      icon: ("51_BlackMage/3574_Sharpcast"),
      abilityType: AbilityType.Utility,
      levelAcquired: 54
    },
    ...getAbilitiesFrom(casterSharedAbilities),
    medicine["Intelligence"]
  ]
};


