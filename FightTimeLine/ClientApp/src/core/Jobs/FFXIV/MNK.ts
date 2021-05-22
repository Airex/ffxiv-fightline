import { IJob, Role, AbilityType } from "../../Models"
import { getAbilitiesFrom, medicine, meleeSharedAbilities } from "./shared"

export const MNK: IJob = {
  name: "MNK",
  fullName: "Monk",
  role: Role.Melee,
  icon: ("JobIcons/Monk_Icon_10"),
  abilities: [
    {
      name: "Mantra",
      duration: 15,
      cooldown: 90,
      xivDbId: "65",
      icon: ("31_Monk/0065_Mantra"),
      abilityType: AbilityType.HealingBuff,
      levelAcquired: 42
    },
    {
      name: "Perfect Balance",
      duration: 10,
      cooldown: 90,
      xivDbId: "69",
      icon: ("31_Monk/0069_Perfect Balance"),
      abilityType: AbilityType.SelfDamageBuff,
      levelAcquired: 50
    },
    {
      name: "Shoulder Tackle",
      duration: 0,
      cooldown: 30,
      xivDbId: "71",
      icon: ("31_Monk/0071_Shoulder Tackle"),
      abilityType: AbilityType.Damage | AbilityType.Utility,
      charges: {
        count: 2,
        cooldown: 30
      },
      levelAcquired: 35
    },
    {
      name: "Elixir Field",
      duration: 0,
      cooldown: 30,
      xivDbId: "3545",
      icon: ("31_Monk/3545_Elixir Field"),
      abilityType: AbilityType.Damage,
      levelAcquired: 56
    },
    {
      name: "Tornado Kick",
      duration: 0,
      cooldown: 45,
      xivDbId: "3543",
      icon: ("31_Monk/3543_Tornado Kick"),
      abilityType: AbilityType.Damage,
      levelAcquired: 60
    },
    {
      name: "Riddle of Earth",
      duration: 10,
      cooldown: 30,
      xivDbId: "7394",
      icon: ("31_Monk/7394_Riddle Of Earth"),
      abilityType: AbilityType.Utility | AbilityType.SelfShield,
      defensiveStats: {
        shieldPercent: 10
      },
      charges: {
        count: 3,
        cooldown: 30
      },
      levelAcquired: 64
    },
    {
      name: "Riddle of Fire",
      duration: 20,
      cooldown: 90,
      xivDbId: "7395",
      icon: ("31_Monk/7395_Riddle Of Fire"),
      abilityType: AbilityType.SelfDamageBuff,
      levelAcquired: 68
    },
    {
      name: "Brotherhood",
      duration: 15,
      cooldown: 90,
      xivDbId: "7396",
      icon: ("31_Monk/7396_Brotherhood"),
      abilityType: AbilityType.PartyDamageBuff,
      levelAcquired: 70
    },
    //    {
    //      name: "Anatman",
    //      duration: 0,
    //      cooldown: 60,
    //      xivDbId: "16475",
    //      icon: ("31_Monk/icon_24"),
    //      abilityType: AbilityType.Utility,
    //    },
    ...getAbilitiesFrom(meleeSharedAbilities),
    medicine.Strength
  ]
};


