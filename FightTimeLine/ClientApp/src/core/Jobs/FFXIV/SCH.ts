import { IJob, Role, AbilityType } from "../../Models"
import { settings, abilitySortFn, getAbilitiesFrom, healerSharedAbilities, medicine } from "./shared"

export const SCH: IJob = {
  name: "SCH",
  fullName: "Scholar",
  role: Role.Healer,
  icon: ("JobIcons/Scholar_Icon_10"),
  abilities: [
    {
      name: "Succor",
      duration: 30,
      cooldown: 30,
      xivDbId: "186",
      icon: ("62_PetsFairy/0186_Succor"),
      abilityType: AbilityType.PartyShield,
      defensiveStats: {
        shieldPercent: 10
      }
    },
    {
      name: "Adloquium",
      duration: 30,
      cooldown: 30,
      xivDbId: "185",
      icon: ("62_PetsFairy/0185_Adloquium"),
      abilityType: AbilityType.PartyShield,
      defensiveStats: {
        shieldPercent: 15
      }
    },
    {
      name: "Whispering Dawn",
      duration: 21,
      cooldown: 60,
      xivDbId: "803",
      icon: ("62_PetsFairy/0803_Whispering Dawn"),
      abilityType: AbilityType.Healing,
    },
    {
      name: "Fey Illumination",
      duration: 20,
      cooldown: 120,
      xivDbId: "805",
      icon: ("62_PetsFairy/0805_Fey Illumination"),
      abilityType: AbilityType.HealingBuff | AbilityType.PartyDefense,
      defensiveStats: {
        mitigationPercent: 5
      }
    },
    {
      name: "Aetherflow",
      duration: 0,
      cooldown: 60,
      icon: ("62_PetsFairy/8908_Aetherflow"),
      xivDbId: "166",
      abilityType: AbilityType.Utility,
    },
    {
      name: "Lustrate",
      duration: 0,
      cooldown: 1,
      xivDbId: "0189",
      icon: ("62_PetsFairy/0189_Lustrate"),
      abilityType: AbilityType.Healing,
      settings: [settings.target],
    },
    {
      name: "Energy Drain",
      duration: 0,
      cooldown: 3,
      xivDbId: "0167",
      icon: ("52_Summoner/0167_Energy Drain"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Sacred Soil",
      duration: 15,
      cooldown: 30,
      xivDbId: "188",
      icon: ("62_PetsFairy/0188_Sacred Soil"),
      abilityType: AbilityType.PartyDefense,
      defensiveStats: {
        mitigationPercent : 10
      }
    },
    {
      name: "Indomitability",
      duration: 0,
      cooldown: 30,
      xivDbId: "3583",
      icon: ("62_PetsFairy/3583_Indomitability"),
      abilityType: AbilityType.Healing,
    },
    {
      name: "Deployment Tactics",
      duration: 0,
      cooldown: 120,
      xivDbId: "3585",
      icon: ("62_PetsFairy/3585_Deployment Tactics"),
      abilityType: AbilityType.Healing,
    },
    {
      name: "Dissipation",
      duration: 30,
      cooldown: 180,
      xivDbId: "3587",
      icon: ("62_PetsFairy/3587_Dissipation"),
      abilityType: AbilityType.Healing,
    },
    {
      name: "Excogitation",
      duration: 45,
      cooldown: 45,
      xivDbId: "7434",
      requiresBossTarget: false,
      icon: ("62_PetsFairy/7434_Excogitation"),
      abilityType: AbilityType.Healing,
      settings: [settings.target],
    },
    {
      name: "Chain Stratagem",
      duration: 15,
      cooldown: 120,
      xivDbId: "7436",
      requiresBossTarget: true,
      icon: ("62_PetsFairy/7436_Chain Stratagem"),
      abilityType: AbilityType.PartyDamageBuff,
    },
    {
      name: "Aetherpact",
      duration: 0,
      cooldown: 1,
      xivDbId: "7437",
      icon: ("62_PetsFairy/7437_Aetherpact"),
      abilityType: AbilityType.Healing,
    },
    {
      name: "Recitation",
      duration: 15,
      cooldown: 90,
      xivDbId: "16542",
      icon: ("Scholar/icon_27"),
      abilityType: AbilityType.Healing,
    },
    {
      name: "Fey Blessing",
      duration: 0,
      cooldown: 60,
      xivDbId: "16543",
      icon: ("Scholar/icon_28"),
      abilityType: AbilityType.Healing,
    },
    {
      name: "Summon Seraph",
      duration: 20,
      cooldown: 120,
      xivDbId: "16545",
      icon: ("Scholar/icon_29"),
      abilityType: AbilityType.Healing,
    },
    {
      name: "Consolation",
      duration: 0,
      cooldown: 30,
      xivDbId: "16546",
      icon: ("Scholar/icon_30"),
      abilityType: AbilityType.Healing | AbilityType.PartyShield,
      charges: {
        count: 2,
        cooldown: 20
      },
      defensiveStats: {
        shieldPercent: 12
      }
      //      detectStrategy: byName()
    },

    ...getAbilitiesFrom(healerSharedAbilities),
    medicine.Mind
  ].sort(abilitySortFn)
};


