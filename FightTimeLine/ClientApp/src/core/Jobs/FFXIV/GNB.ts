import { IJob, Role, AbilityType } from "../../Models"
import { settings, getAbilitiesFrom, tankSharedAbilities, abilitySortFn, medicine } from "./shared"

export const GNB: IJob = {
  name: "GNB",
  fullName:"Gunbreaker",
  role: Role.Tank,
  icon: ("JobIcons/Gunbreaker"),
  abilities: [
    {
      name: "No Mercy",
      duration: 20,
      cooldown: 60,
      xivDbId: "16138",
      icon: ("Gunbreaker/icon_02"),
      abilityType: AbilityType.SelfDamageBuff,
    },
    {
      name: "Camouflage",
      duration: 20,
      cooldown: 90,
      xivDbId: "16140",
      icon: ("Gunbreaker/icon_04"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Nebula",
      duration: 15,
      cooldown: 120,
      xivDbId: "16148",
      icon: ("Gunbreaker/icon_11"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Aurora",
      duration: 18,
      cooldown: 60,
      xivDbId: "16151",
      icon: ("Gunbreaker/icon_13"),
      abilityType: AbilityType.Healing,
      settings: [settings.target]
    },
    {
      name: "Superbolide",
      duration: 8,
      cooldown: 360,
      xivDbId: "16152",
      icon: ("Gunbreaker/icon_14"),
      abilityType: AbilityType.SelfDefense,
    },
    {
      name: "Rough Divide",
      duration: 0,
      cooldown: 30,
      xivDbId: "16154",
      icon: ("Gunbreaker/icon_16"),
      abilityType: AbilityType.Damage,
      charges: {
        count: 2,
        cooldown: 30
      }
    },
    {
      name: "Bow Shock",
      duration: 15,
      cooldown: 60,
      xivDbId: "16159",
      icon: ("Gunbreaker/icon_20"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Heart of Light",
      duration: 15,
      cooldown: 90,
      xivDbId: "16160",
      icon: ("Gunbreaker/icon_21"),
      abilityType: AbilityType.PartyDefense,
    },
    {
      name: "Heart of Stone",
      duration: 7,
      cooldown: 25,
      xivDbId: "16161",
      icon: ("Gunbreaker/icon_22"),
      abilityType: AbilityType.PartyDefense,
      settings: [settings.target]
    },
    {
      name: "Bloodfest",
      duration: 0,
      cooldown: 90,
      xivDbId: "16164",
      icon: ("Gunbreaker/icon_25"),
      abilityType: AbilityType.Utility,
    },
    {
      name: "Blasting Zone",
      duration: 0,
      cooldown: 30,
      xivDbId: "16165",
      icon: ("Gunbreaker/icon_26"),
      abilityType: AbilityType.Damage,
    },
    ...getAbilitiesFrom(tankSharedAbilities),
    medicine["Strength"]
  ].sort(abilitySortFn),
};


