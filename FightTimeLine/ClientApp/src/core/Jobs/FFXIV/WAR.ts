import Effects from "src/core/Effects";
import { SharedOverlapStrategy } from "src/core/Overlap";
import { IJob, Role, AbilityType, IAbility, IMitigator, MitigationVisitorContext, MapMe } from "../../Models"
import { abilitySortFn, getAbilitiesFrom, settings, tankSharedAbilities, medicine } from "./shared"

class ShakeItOffMitigationModifier implements IMitigator {

  constructor(private value: number) {

  }

  apply(context: MitigationVisitorContext) {
    const original = context.holders.itemUsages.get(context.abilityId);

    const abs = ["Thrill of Battle", "Vengeance", "Bloodwhetting"];
    const sum = abs
      .map(a => {
        const ab = context.holders.abilities.getByParentAndAbility(context.jobId, a);
        const has = context.holders.itemUsages.getByAbility(ab.id).some(ab => ab.checkCoversDate(original.start));
        return has ? 1 : 0;
      })
      .reduce((acc, v) => acc += v, 0)

    context.addShieldForParty(this.value + 2 * sum)
  }
}

const statuses = MapMe({
  innerRelease: {
    duration: 10
  },
  vengence: {
    duration: 15,
    effects: [Effects.mitigation.solo(30)]
  },
  holmgang: {
    duration: 10,
    effects: [Effects.mitigation.solo(100)]
  },
  shakeItOff: {
    duration: 15,
    effects: [Effects.shield.party(15).withModifier(ShakeItOffMitigationModifier)]
  },
  thrillOfBattle: {
    duration: 10,
    effects:[Effects.shield.solo(20)]
  },
  bloodwhetting: {
    duration: 8,
    effects:[Effects.mitigation.solo(10)],    
  },
  bloodwhettingStem: {
    duration: 4,
    effects:[Effects.mitigation.solo(10)],    
  },
  nascentFlash: {
    duration: 8,
    effects: [Effects.mitigation.solo(10)]
  },
  nascentFlashStem: {
    duration: 4,
    effects: [Effects.mitigation.solo(10)]
  }

});

const abilities: IAbility[] = <IAbility[]>[
  {
    name: "Infuriate",
    cooldown: 60,
    xivDbId: "52",
    requiresBossTarget: true,
    abilityType: AbilityType.Utility,
    charges: {
      count: 2,
      cooldown: 60
    },
    levelAcquired: 50
  },
  {
    name: "Inner Release",
    cooldown: 90,
    requiresBossTarget: true,
    statuses: [statuses.innerRelease],
    xivDbId: "7389",
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 70
  },
  {
    name: "Onslaught",
    cooldown: 30,
    xivDbId: "7386",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 62,
    charges: {
      count: 3,
      cooldown: 30
    }
  },
  {
    name: "Upheaval",
    cooldown: 30,
    xivDbId: "7387",
    overlapStrategy: new SharedOverlapStrategy(["Orogeny"]),
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 64
  },
  {
    name: "Orogeny",
    cooldown: 30,
    xivDbId: "25752",
    requiresBossTarget: true,
    overlapStrategy: new SharedOverlapStrategy(["Upheaval"]),
    abilityType: AbilityType.Damage,
    levelAcquired: 86
  },
  {
    name: "Vengeance",
    cooldown: 120,
    xivDbId: "44",
    statuses: [statuses.vengence],
    relatedAbilities: { affectedBy: ["Shake It Off"], parentOnly: true },
    abilityType: AbilityType.SelfDefense,
    levelAcquired: 38
  },
  {
    name: "Holmgang",
    cooldown: 240,
    xivDbId: "43",
    requiresBossTarget: true,
    isUltimateSave: true,
    statuses: [statuses.holmgang],
    abilityType: AbilityType.SelfDefense,
    levelAcquired: 42
  },
  {
    name: "Shake It Off",    
    cooldown: 90,
    xivDbId: "7388",
    abilityType: AbilityType.PartyShield,
    statuses:[statuses.shakeItOff],
    relatedAbilities: {
      affects: ["Thrill of Battle", "Vengence", "Raw Intuition"],
      parentOnly: true
    },
    levelAcquired: 68
  },
  {
    name: "Thrill of Battle",    
    cooldown: 90,
    xivDbId: "40",
    abilityType: AbilityType.SelfDefense,
    relatedAbilities: { affectedBy: ["Shake It Off"], parentOnly: true },
    levelAcquired: 30
  },
  {
    name: "Bloodwhetting",    
    cooldown: 25,
    xivDbId: "25751",
    statuses:[statuses.bloodwhetting, statuses.bloodwhettingStem], //todo: check to shield status
    abilityType: AbilityType.SelfDefense,
    relatedAbilities: { affectedBy: ["Shake It Off"], parentOnly: true },
    overlapStrategy: new SharedOverlapStrategy(["Nascent Flash"]),    
    levelAcquired: 56
  },
  {
    name: "Equilibrium",    
    cooldown: 60,
    xivDbId: "3552",
    abilityType: AbilityType.Healing,
    levelAcquired: 58
  },
  {
    name: "Nascent Flash",    
    cooldown: 25,
    xivDbId: "16464",
    statuses: [statuses.nascentFlash, statuses.nascentFlashStem],
    abilityType: AbilityType.TargetDefense,
    settings: [settings.target],
    overlapStrategy: new SharedOverlapStrategy(["Bloodwhetting"]),    
    levelAcquired: 76
  },
  medicine.Strength,
  ...getAbilitiesFrom(tankSharedAbilities),
].sort(abilitySortFn);

export const WAR: IJob = {
  name: "WAR",
  fullName: "Warrior",
  role: Role.Tank,
  abilities  
};
