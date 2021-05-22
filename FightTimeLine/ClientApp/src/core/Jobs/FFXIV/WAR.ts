import { SharedOverlapStrategy } from "src/core/Overlap";
import { IJob, Role, AbilityType, MitigationsModifier } from "../../Models"
import { abilitySortFn, getAbilitiesFrom, settings, tankSharedAbilities, medicine } from "./shared"

const ShakeItOffMitigationModifier: MitigationsModifier = (holders, jobId, abilityId) => {

  const original = holders.itemUsages.get(abilityId);

  const abs = ["Thrill of Battle", "Vengeance", "Raw Intuition"];
  const sum = abs
    .map(a => {
      const ab = holders.abilities.getByParentAndAbility(jobId, a);
      const has = holders.itemUsages.getByAbility(ab.id).some(ab => ab.checkCoversDate(original.start));
      return has ? 1 : 0;
    })
    .reduce((acc,v) => acc += v, 0)
  
  const sp = original.ability.ability.defensiveStats.shieldPercent;
  return {
    ...original.ability.ability.defensiveStats,
    shieldPercent: sp + 2 * sum
  };
}

export const WAR: IJob = {
  name: "WAR",
  fullName: "Warrior",
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
      },
      levelAcquired: 50
    },
    {
      name: "Inner Release",
      duration: 10,
      cooldown: 90,
      requiresBossTarget: true,
      xivDbId: "7389",
      icon: ("12_Warrior/7389_Inner Release"),
      abilityType: AbilityType.SelfDamageBuff,
      levelAcquired: 70
    },
    {
      name: "Onslaught",
      duration: 0,
      cooldown: 10,
      xivDbId: "7386",
      requiresBossTarget: true,
      icon: ("12_Warrior/7386_Onslaught"),
      abilityType: AbilityType.Damage,
      levelAcquired: 62
    },
    {
      name: "Upheaval",
      duration: 0,
      cooldown: 30,
      xivDbId: "7387",
      requiresBossTarget: true,
      icon: ("12_Warrior/7387_Upheaval"),
      abilityType: AbilityType.Damage,
      levelAcquired: 64
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
      },
      levelAcquired: 38
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
      },
      levelAcquired: 42
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
        shieldPercent: 15,
        modifier: ShakeItOffMitigationModifier
      },
      levelAcquired: 68
    },
    {
      name: "Thrill of Battle",
      duration: 10,
      cooldown: 90,
      xivDbId: "40",
      icon: ("12_Warrior/0040_Thrill Of Battle"),
      abilityType: AbilityType.SelfDefense,
      relatedAbilities: { affectedBy: ["Shake It Off"], parentOnly: true },
      levelAcquired: 30
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
        mitigationPercent: 20
      },
      levelAcquired: 56
    },
    {
      name: "Equilibrium",
      duration: 0,
      cooldown: 60,
      xivDbId: "3552",
      icon: ("12_Warrior/3552_Equilibrium"),
      abilityType: AbilityType.Healing,
      levelAcquired: 58
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
      },
      levelAcquired: 76
    },
    ...getAbilitiesFrom(tankSharedAbilities),
    medicine["Strength"]
  ].sort(abilitySortFn),
  stances: [
  ]
};
