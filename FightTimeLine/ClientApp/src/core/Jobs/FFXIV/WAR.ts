import { IJob,  Role, AbilityType,  byName, SharedOverlapStrategy } from "../../Models"
import { abilitySortFn, getAbilitiesFrom, settings, tankSharedAbilities, medicine } from "./shared"

export const WAR: IJob = {
  name: "WAR",
  fullName:"Warrior",
  role: Role.Tank,
  icon: ("JobIcons/Warrior_Icon_10"),
  abilities: [
    {
      name: "Infuriate",
      duration: 0,
      cooldown: 60,
      xivDbId: "52",
      requiresBossTarget: true,
      icon: ("12_Warrior/0052_Infuriate"),
      abilityType: AbilityType.Utility,
      charges: {
        count: 2,
        cooldown: 60
      }
    },
    {
      name: "Inner Release",
      duration: 10,
      cooldown: 90,
      requiresBossTarget: true,
      xivDbId: "7389",
      icon: ("12_Warrior/7389_Inner Release"),
      abilityType: AbilityType.SelfDamageBuff,
    },
    {
      name: "Onslaught",
      duration: 0,
      cooldown: 10,
      xivDbId: "7386",
      requiresBossTarget: true,
      icon: ("12_Warrior/7386_Onslaught"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Upheaval",
      duration: 0,
      cooldown: 30,
      xivDbId: "7387",
      requiresBossTarget: true,
      icon: ("12_Warrior/7387_Upheaval"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Vengeance",
      duration: 15,
      cooldown: 120,
      xivDbId: "44",
      icon: ("12_Warrior/0044_Vengeance"),
      relatedAbilities: { affectedBy: ["Shake It Off"], parentOnly: true },
      abilityType: AbilityType.SelfDefense,
      defensiveStats: {
        mitigationPercent: 30
      }
    },
    {
      name: "Holmgang",
      duration: 8,
      cooldown: 240,
      xivDbId: "43",
      requiresBossTarget: true,
      icon: ("12_Warrior/0043_Holmgang"),
      isUltimateSave: true,
      abilityType: AbilityType.SelfDefense,
      defensiveStats: {
        mitigationPercent: 100
      }
    },
    {
      name: "Shake It Off",
      duration: 15,
      cooldown: 90,
      xivDbId: "7388",
      icon: ("12_Warrior/7388_Shake It Off"),
      abilityType: AbilityType.PartyShield,
      relatedAbilities:
      {
        affects: ["Thrill of Battle", "Vengence", "Raw Intuition"],
        parentOnly: true
      },
      defensiveStats: {
        shieldPercent: 15
      }
    },
    {
      name: "Thrill of Battle",
      duration: 10,
      cooldown: 90,
      xivDbId: "40",
      icon: ("12_Warrior/0040_Thrill Of Battle"),
      abilityType: AbilityType.SelfDefense,
      relatedAbilities: { affectedBy: ["Shake It Off"], parentOnly: true }
    },
    {
      name: "Raw Intuition",
      duration: 6,
      cooldown: 25,
      xivDbId: "3551",
      icon: ("12_Warrior/3551_Raw Intuition"),
      abilityType: AbilityType.SelfDefense,
      relatedAbilities: { affectedBy: ["Shake It Off"], parentOnly: true },
      overlapStrategy: new SharedOverlapStrategy(["Nascent Flash"]),
      defensiveStats: {
        mitigationPercent : 20
      }
    },
    {
      name: "Equilibrium",
      duration: 0,
      cooldown: 60,
      xivDbId: "3552",
      icon: ("12_Warrior/3552_Equilibrium"),
      abilityType: AbilityType.Healing,
    },
    {
      name: "Nascent Flash",
      duration: 6,
      cooldown: 25,
      xivDbId: "16464",
      icon: ("12_Warrior/icon_24 (1)"),
      abilityType: AbilityType.TargetDefense,
      settings: [settings.target],
      overlapStrategy: new SharedOverlapStrategy(["Raw Intuition"]), 
      defensiveStats: {
        mitigationPercent: 10
      }
    },
    ...getAbilitiesFrom(tankSharedAbilities),
    medicine["Strength"]
  ].sort(abilitySortFn),
  stances: [
  ]
};
