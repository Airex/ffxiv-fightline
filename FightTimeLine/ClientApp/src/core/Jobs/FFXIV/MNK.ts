import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, medicine, meleeSharedAbilities } from "./shared"

export const MNK: IJob = {
  name: "MNK",
  fullName:"Monk",
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
    },
    {
      name: "Perfect Balance",
      duration: 10,
      cooldown: 90,
      xivDbId: "69",
      icon: ("31_Monk/0069_Perfect Balance"),
      abilityType: AbilityType.SelfDamageBuff,
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
      }
    },
    {
      name: "Elixir Field",
      duration: 0,
      cooldown: 30,
      xivDbId: "3545",
      icon: ("31_Monk/3545_Elixir Field"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Tornado Kick",
      duration: 0,
      cooldown: 45,
      xivDbId: "3543",
      icon: ("31_Monk/3543_Tornado Kick"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Riddle of Earth",
      duration: 6,
      cooldown: 30,
      xivDbId: "7394",
      icon: ("31_Monk/7394_Riddle Of Earth"),
      abilityType: AbilityType.Utility,
      charges: {
        count: 3,
        cooldown: 30
      }
    },
    {
      name: "Riddle of Fire",
      duration: 20,
      cooldown: 90,
      xivDbId: "7395",
      icon: ("31_Monk/7395_Riddle Of Fire"),
      abilityType: AbilityType.SelfDamageBuff,
    },
    {
      name: "Brotherhood",
      duration: 15,
      cooldown: 90,
      xivDbId: "7396",
      icon: ("31_Monk/7396_Brotherhood"),
      abilityType: AbilityType.PartyDamageBuff,
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
    medicine["Strength"]
  ]
};


