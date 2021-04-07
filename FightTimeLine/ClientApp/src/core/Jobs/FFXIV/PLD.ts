import { IJob, Role, AbilityType, MitigationsModifier } from "../../Models"
import { settings, abilitySortFn, getAbilitiesFrom, tankSharedAbilities, medicine, SettingsEnum } from "./shared"

const InterventionMitigationModifier: MitigationsModifier = (holders, jobId, abilityId) => {

  const original = holders.itemUsages.get(abilityId);

  const target = original.getSettingData(SettingsEnum.Target);

  if (!target || !target.value || jobId === target.value) return {
    ...original.ability.ability.defensiveStats,
    mitigationPercent: 0
  };

  const abs = ["Rampart", "Sentinel"]

  const mts = abs
    .map(abName => {
      const ab = holders.abilities.getByParentAndAbility(jobId, abName);
      const has = holders.itemUsages.getByAbility(ab.id).some(ab => ab.checkCoversDate(original.start))
      return has ? ab.ability.defensiveStats.mitigationPercent : 0;
    })
    .reduce((acc, v) => { return acc *= (1 - v / 100) }, 1)

  const om = original.ability.ability.defensiveStats.mitigationPercent;
  return {
    ...original.ability.ability.defensiveStats,
    mitigationPercent: (1 - (1 - om / 100) * mts) * 100
  };
}

const CoverMitigationModifier: MitigationsModifier = (holders, jobId, abilityId) => {

  const original = holders.itemUsages.get(abilityId);

  const target = original.getSettingData(SettingsEnum.Target);

  if (!target || !target.value || jobId === target.value) return {
    ...original.ability.ability.defensiveStats,
    mitigationPercent: 0
  };

  return original.ability.ability.defensiveStats;
}

export const PLD: IJob = {
  name: "PLD",
  fullName: "Paladin",
  role: Role.Tank,
  icon: ("JobIcons/Paladin_Icon_10"),
  abilities: [
    {
      name: "Fight or Flight",
      duration: 25,
      cooldown: 60,
      xivDbId: "20",
      icon: ("11_Paladin/0020_Fight Or Flight"),
      abilityType: AbilityType.SelfDamageBuff,
    },
    {
      name: "Circle of Scorn",
      duration: 15,
      cooldown: 25,
      xivDbId: "23",
      icon: ("11_Paladin/0023_Circle Of Scorn"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Spirits Within",
      duration: 0,
      cooldown: 30,
      xivDbId: "29",
      requiresBossTarget: true,
      icon: ("11_Paladin/0029_Spirits Within"),
      abilityType: AbilityType.Damage,
    },
    {
      name: "Requiescat",
      duration: 12,
      cooldown: 60,
      xivDbId: "7383",
      requiresBossTarget: true,
      icon: ("11_Paladin/7383_Requiescat"),
      abilityType: AbilityType.SelfDamageBuff | AbilityType.Damage,
    },
    {
      name: "Sentinel",
      duration: 15,
      cooldown: 120,
      xivDbId: "17",
      icon: ("11_Paladin/0017_Sentinel"),
      abilityType: AbilityType.SelfDefense,
      defensiveStats: {
        mitigationPercent: 30
      }

    },
    {
      name: "Hallowed Ground",
      duration: 10,
      cooldown: 420,
      xivDbId: "30",
      icon: ("11_Paladin/0030_Hallowed Ground"),
      abilityType: AbilityType.SelfDefense,
      defensiveStats: {
        mitigationPercent: 100
      }
    },
    {
      name: "Divine Veil",
      duration: 30,
      cooldown: 90,
      xivDbId: "3540",
      icon: ("11_Paladin/3540_Divine Veil"),
      abilityType: AbilityType.PartyShield,
      defensiveStats: {
        shieldPercent: 10
      }
    },
    {
      name: "Passage of Arms",
      duration: 18,
      cooldown: 120,
      xivDbId: "7385",
      icon: ("11_Paladin/7385_Passage Of Arms"),
      abilityType: AbilityType.PartyDefense,
      defensiveStats: {
        mitigationPercent: 15
      }
    },
    {
      name: "Cover",
      duration: 12,
      cooldown: 120,
      xivDbId: "27",
      icon: ("11_Paladin/0027_Cover"),
      abilityType: AbilityType.TargetDefense,
      settings: [settings.target],
      defensiveStats: {
        mitigationPercent: 100,
        modifier: CoverMitigationModifier
      }
    },
    {
      name: "Sheltron",
      duration: 6,
      cooldown: 5,
      xivDbId: "3542",
      requiresBossTarget: true,
      icon: ("11_Paladin/3542_Sheltron"),
      abilityType: AbilityType.SelfDefense,
      defensiveStats: {
        mitigationPercent: 18
      }
    },
    {
      name: "Intervention",
      duration: 6,
      cooldown: 10,
      xivDbId: "7382",
      requiresBossTarget: true,
      icon: ("11_Paladin/7382_Intervention"),
      abilityType: AbilityType.TargetDefense,
      settings: [settings.target],
      defensiveStats: {
        mitigationPercent: 10,
        modifier: InterventionMitigationModifier
      }
    },
    {
      name: "Intervene",
      duration: 0,
      cooldown: 0,
      xivDbId: "16461",
      requiresBossTarget: true,
      icon: "11_Paladin/icon_25",
      abilityType: AbilityType.Utility,
      charges: {
        count: 2,
        cooldown: 30
      }
    },
    ...getAbilitiesFrom(tankSharedAbilities),
    medicine["Strength"]
  ].sort(abilitySortFn),
  stances: []
};
