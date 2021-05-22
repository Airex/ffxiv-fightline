import { byBuffApply } from "src/core/AbilityDetectors";
import { IJob, Role, AbilityType  } from "../../Models"
import { settings, abilitySortFn, getAbilitiesFrom, medicine, meleeSharedAbilities } from "./shared"

export const DRG: IJob = {
  name: "DRG",
  fullName:"Dragoon",
  role: Role.Melee,
  icon: ("JobIcons/Dragoon_Icon_10"),
  abilities: [
    {
      name: "Lance Charge",
      duration: 20,
      cooldown: 90,
      xivDbId: "85",
      icon: ("32_Dragoon/0085_Blood For Blood"),
      abilityType: AbilityType.SelfDamageBuff,
      levelAcquired: 30
    },
    {
      name: "Life Surge",
      duration: 5,
      cooldown: 45,
      xivDbId: "83",
      icon: ("32_Dragoon/0083_Life Surge"),
      abilityType: AbilityType.SelfDamageBuff,
      levelAcquired: 6
    },
    {
      name: "Dragon Sight",
      duration: 20,
      cooldown: 120,
      xivDbId: "10032",
      icon: ("32_Dragoon/10032_Dragon Sight"),
      abilityType: AbilityType.PartyDamageBuff | AbilityType.SelfDamageBuff,
      settings: [settings.target],
      detectStrategy: byBuffApply(1001454, "Dragon Sight"),
      levelAcquired: 66
    },
    {
      name: "Battle Litany",
      duration: 20,
      cooldown: 180,
      xivDbId: "3557",
      icon: ("32_Dragoon/3557_Battle Litany"),
      abilityType: AbilityType.PartyDamageBuff,
      levelAcquired: 52
    },
    {
      name: "Dragonfire Dive",
      duration: 0,
      cooldown: 120,
      xivDbId: "96",
      requiresBossTarget: true,
      icon: ("32_Dragoon/0096_Dragonfire Dive"),
      abilityType: AbilityType.Damage,
      levelAcquired: 50
    },
    {
      name: "Geirskogul",
      duration: 0,
      cooldown: 30,
      xivDbId: "3555",
      requiresBossTarget: true,
      icon: ("32_Dragoon/3555_Geirskogul"),
      abilityType: AbilityType.Damage,
      levelAcquired: 60
    },
    {
      name: "High Jump",
      duration: 0,
      cooldown: 30,
      xivDbId: "16478",
      requiresBossTarget: true,
      icon: ("32_Dragoon/icon_23"),
      abilityType: AbilityType.Damage,
      levelAcquired: 74
    },
    {
      name: "Spineshatter Dive",
      duration: 0,
      cooldown: 60,
      xivDbId: "95",
      requiresBossTarget: true,
      icon: ("32_Dragoon/8802_Spineshatter Dive"),
      abilityType: AbilityType.Damage,
      levelAcquired: 45
    },
    {
      name: "Stardiver",
      duration: 0,
      cooldown: 30,
      xivDbId: "16480",
      requiresBossTarget: true,
      icon: ("32_Dragoon/icon_24"),
      abilityType: AbilityType.Damage,
      levelAcquired: 80
    },
    ...getAbilitiesFrom(meleeSharedAbilities),
    medicine["Strength"]
  ].sort(abilitySortFn)
};


