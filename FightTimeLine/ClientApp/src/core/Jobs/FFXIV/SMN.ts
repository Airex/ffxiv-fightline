import { IJob, DamageType, IAbility, IAbilitySetting, Role, AbilityType, IStance, byName, byBuffApply, byBuffRemove } from "../../Models"
import { settings, IAbilities, abilitySortFn, getAbilitiesFrom, casterSharedAbilities, medicine } from "./shared"

export const SMN: IJob = {
  name: "SMN",
  fullName:"Summoner",
  role: Role.Caster,
  icon: ("JobIcons/Summoner_Icon_10"),
  abilities: [
//    {
//      name: "Egi Assault",
//      duration: 0,
//      cooldown: 30,
//      xivDbId: "16509",
//      icon: ("52_Summoner/icon_07"),
//      abilityType: AbilityType.Damage,
//      charges: {
//        count: 2,
//        cooldown: 30
//      },
//      detectStrategy: byName(["16797", "16799", "16795", "797"], ["Egi Assault","Aerial Slash","Crimson Cyclone", "Earthen Armor"])
//    },
    {
      name: "Energy Drain",
      duration: 0,
      cooldown: 30,
      xivDbId: "16508",
      icon: ("52_Summoner/0167_Energy Drain"),
      abilityType: AbilityType.Damage
    },
//    {
//      name: "Egi Assault II",
//      duration: 0,
//      cooldown: 30,
//      xivDbId: "16512",
//      icon: ("52_Summoner/icon_13"),
//      abilityType: AbilityType.Damage,
//      charges: {
//        count: 2,
//        cooldown: 30
//      },
//      detectStrategy: byName(["16798", "16800", "16796", "800"], ["Egi Assault II","Slipstream", "Flaming Crush", "Mountain Buster"])
//    },
    {
      name: "Enkindle",
      duration: 0,
      cooldown: 120,
      xivDbId: "184",
      icon: ("61_PetsEgi/0184_Enkindle"),
      requiresBossTarget: true,
      abilityType: AbilityType.Damage,
      detectStrategy: byName(["120", "16803"], ["Enkindle","Enkindle: Inferno"])
    },
    {
      name: "Tri-disaster",
      duration: 0,
      cooldown: 50,
      xivDbId: "3580",
      icon: ("61_PetsEgi/3580_Tri-disaster"),
      requiresBossTarget: true,
      abilityType: AbilityType.Damage,
    },
    {
      name: "Aetherpact",
      duration: 15,
      cooldown: 180,
      xivDbId: "7423",
      icon: ("61_PetsEgi/7423_Aetherpact"),
      abilityType: AbilityType.PartyDamageBuff,
    },
    ...getAbilitiesFrom(casterSharedAbilities),
    medicine["Intelligence"]
  ]
};


