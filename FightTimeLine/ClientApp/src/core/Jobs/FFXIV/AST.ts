import { IJob, Role, AbilityType } from "../../Models"
import { settings, getAbilitiesFrom, healerSharedAbilities, medicine } from "./shared"

export const AST: IJob = {
  name: "AST",
  role: Role.Healer,
  icon: ("JobIcons/Astrologian_Icon_10"),
  abilities: [
    {
      name: "Lightspeed",
      duration: 15,
      cooldown: 90,
      xivDbId: "3606",
      icon: ("23_Astrologian/3606_Lightspeed"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Essential Dignity",
      duration: 0,
      cooldown: 40,
      xivDbId: "3614",
      icon: ("23_Astrologian/3614_Essential Dignity"),
      abilityType: AbilityType.Healing,
      settings: [settings.target],
      charges: {
        count: 2,
        cooldown: 40
      }
    },
    {
      name: "Synastry",
      duration: 20,
      cooldown: 120,
      xivDbId: "3612",
      icon: ("23_Astrologian/3612_Synastry"),
      abilityType: AbilityType.Healing,
      settings: [settings.target],
    },
    {
      name: "Divination",
      duration: 15,
      cooldown: 120,
      xivDbId: "16552",
      icon: ("23_Astrologian/icon_19"),
      abilityType: AbilityType.PartyDamageBuff,
    },
    {
      name: "Collective Unconscious",
      duration: 20,
      cooldown: 60,
      xivDbId: "3613",
      icon: ("23_Astrologian/3613_Collective Unconscious"),
      abilityType: AbilityType.PartyDefense,
    },
    {
      name: "Celestial Opposition",
      duration: 0,
      cooldown: 60,
      xivDbId: "16553",
      icon: ("23_Astrologian/3616_Celestial Opposition"),
      abilityType: AbilityType.Healing,
    },
    {
      name: "Earthly Star",
      duration: 21,
      cooldown: 60,
      xivDbId: "7439",
      icon: ("23_Astrologian/7439_Earthly Star"),
      abilityType: AbilityType.Healing,
    },
    {
      name: "Sleeve Draw",
      duration: 0,
      cooldown: 180,
      xivDbId: "7448",
      icon: ("23_Astrologian/7448_Sleeve Draw"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Celestial Intersection",
      duration: 0,
      cooldown: 30,
      xivDbId: "16556",
      icon: ("23_Astrologian/icon_28"),
      abilityType: AbilityType.Healing,
    },
    {
      name: "Horoscope",
      duration: 30,
      cooldown: 60,
      xivDbId: "16557",
      icon: ("23_Astrologian/icon_29"),
      abilityType: AbilityType.Healing,
    },
    {
      name: "Neutral Sect",
      duration: 20,
      cooldown: 120,
      xivDbId: "16559",
      icon: ("23_Astrologian/icon_30"),
      abilityType: AbilityType.HealingBuff,
    },
  
    ...getAbilitiesFrom(healerSharedAbilities),
    medicine["Mind"]
  ]
};


