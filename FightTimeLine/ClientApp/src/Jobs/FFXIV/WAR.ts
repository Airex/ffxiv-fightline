import Effects from "src/core/Defensives/effects";
import { SharedOverlapStrategy } from "src/core/Overlap";
import {
  Role,
  AbilityType,
  IAbility,
  IMitigator,
  MitigationVisitorContext,
  MapStatuses,
  settings,
  IJobTemplate,
  ITrait,
  IMitigatorOverride,
} from "../../core/Models";
import { getAbilitiesFrom, tankSharedAbilities, medicine } from "./shared";
import { abilityRemovedTrait, abilityTrait } from "./traits";

class ShakeItOffMitigationModifier implements IMitigator {
  constructor(private value: number) {}

  apply(context: MitigationVisitorContext) {
    const original = context.holders.itemUsages.get(context.sourceAbilityId);
    const sum = (acc, v) => (acc += v);

    const abs = ["Thrill of Battle", "Vengeance", "Bloodwhetting"];
    const total = abs
      .map((a) => {
        const ab = context.holders.abilities.getByParentAndAbility(
          context.sourceJobId,
          a
        );
        const has = context.holders.itemUsages
          .getByAbility(ab.id)
          .some((abc) => abc.checkCoversDate(original.start));
        return has ? 1 : 0;
      })
      .reduce(sum, 0);

    context.addShieldForParty(this.value + 2 * total);
  }
}

class ShakeItOffAbilityConsumedModifier implements IMitigatorOverride {
  apply(context: MitigationVisitorContext, original: IMitigator) {
    const orig = context.holders.itemUsages.get(context.sourceAbilityId);
    const ab = context.holders.abilities.getByParentAndAbility(
      context.sourceJobId,
      "Shake It Off"
    );
    const found =
      ab &&
      context.holders.itemUsages
        .getByAbility(ab.id)
        .filter((abc) => orig.checkCoversDate(abc.start));
    if (!found || found.length === 0 || found[0].start >= context.attackAt) {
      this.mitigate(context, original);
    }
  }

  mitigate(context: MitigationVisitorContext, original: IMitigator): void {
    original.apply(context);
  }
}

const statuses = MapStatuses({
  berserk: {
    duration: 15,
  },
  innerRelease: {
    duration: 15,
  },
  vengeance: {
    duration: 15,
    effects: [
      Effects.mitigation
        .solo(30)
        .withModifier(ShakeItOffAbilityConsumedModifier),
    ],
  },
  holmgang: {
    duration: 10,
    effects: [Effects.mitigation.solo(100)],
  },
  shakeItOff: {
    duration: 30,
    effects: [
      Effects.shield.party(15).withModifier(ShakeItOffMitigationModifier),
    ],
  },
  thrillOfBattle: {
    duration: 10,
    effects: [
      Effects.hpIncrease
        .self(20)
        .withModifier(ShakeItOffAbilityConsumedModifier),
      Effects.incomingHealingIncrease
        .solo(20)
        .withModifier(ShakeItOffAbilityConsumedModifier),
    ],
  },
  rawIntuition: {
    duration: 6,
    effects: [Effects.mitigation.solo(10)],
  },
  bloodWhetting: {
    duration: 8,
    effects: [
      Effects.mitigation
        .solo(10)
        .withModifier(ShakeItOffAbilityConsumedModifier),
    ],
  },
  bloodWhettingStem: {
    duration: 4,
    effects: [
      Effects.mitigation
        .solo(10)
        .withModifier(ShakeItOffAbilityConsumedModifier),
    ],
  },
  bloodWhettingTide: {
    duration: 20,
    effects: [
      Effects.shieldFromHeal
        .solo(100)
        .withModifier(ShakeItOffAbilityConsumedModifier),
    ],
    potency: 400,
  },
  nascentFlashPre82: {
    duration: 6,
    effects: [Effects.mitigation.solo(10)],
  },
  nascentFlash: {
    levelAcquired: 82,
    duration: 8,
    effects: [Effects.mitigation.solo(10)],
  },
  nascentFlashStem: {
    levelAcquired: 82,
    duration: 4,
    effects: [Effects.mitigation.solo(10)],
  },
  nascentFlashTide: {
    levelAcquired: 82,
    duration: 20,
    effects: [Effects.shieldFromHeal.solo(100)],
    potency: 400,
  },
});

const abilities: IAbility[] = [
  {
    name: "Infuriate",
    translation: {
      de: "Schlachtruf",
      ja: "\u30A6\u30A9\u30FC\u30AF\u30E9\u30A4",
      en: "Infuriate",
      fr: "Cri de guerre",
      cn: "战嚎",
    },
    cooldown: 60,
    xivDbId: "52",
    requiresBossTarget: true,
    abilityType: AbilityType.Utility,
    charges: {
      count: 2,
      cooldown: 60,
    },
    levelAcquired: 50,
  },
  {
    name: "Berserk",
    translation: {
      de: "Tollwut",
      en: "Berserk",
      fr: "Berserk",
      cn: "狂暴",
      ja: "バーサク",
    },
    cooldown: 60,
    requiresBossTarget: true,
    statuses: [statuses.berserk],
    xivDbId: "38",
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 6,
  },
  {
    name: "Inner Release",
    translation: {
      de: "Urbefreiung",
      ja: "\u539F\u521D\u306E\u89E3\u653E",
      en: "Inner Release",
      fr: "Rel\u00E2chement bestial",
      cn: "原初的解放",
    },
    cooldown: 60,
    requiresBossTarget: true,
    statuses: [statuses.innerRelease],
    xivDbId: "7389",
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 70,
  },
  {
    name: "Onslaught",
    translation: {
      de: "Sturmlauf",
      ja: "\u30AA\u30F3\u30B9\u30ED\u30FC\u30C8",
      en: "Onslaught",
      fr: "Assaut violent",
      cn: "猛攻",
    },
    cooldown: 30,
    xivDbId: "7386",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 62,
    charges: {
      count: 3,
      cooldown: 30,
    },
  },
  {
    name: "Upheaval",
    translation: {
      de: "Umsturz",
      ja: "\u30A2\u30C3\u30D7\u30D2\u30FC\u30D0\u30EB",
      en: "Upheaval",
      fr: "R\u00E9volte",
      cn: "动乱",
    },
    cooldown: 30,
    xivDbId: "7387",
    overlapStrategy: new SharedOverlapStrategy(["Orogeny"]),
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 64,
  },
  {
    name: "Orogeny",
    translation: {
      de: "Orogenese",
      ja: "\u30AA\u30ED\u30B8\u30A7\u30CD\u30B7\u30B9",
      en: "Orogeny",
      fr: "Orogen\u00E8se",
      cn: "群山隆起",
    },
    cooldown: 30,
    xivDbId: "25752",
    requiresBossTarget: true,
    overlapStrategy: new SharedOverlapStrategy(["Upheaval"]),
    abilityType: AbilityType.Damage,
    levelAcquired: 86,
  },
  {
    name: "Vengeance",
    translation: {
      de: "Rachsucht",
      ja: "\u30F4\u30A7\u30F3\u30B8\u30A7\u30F3\u30B9",
      en: "Vengeance",
      fr: "Repr\u00E9sailles",
      cn: "复仇",
    },
    cooldown: 120,
    xivDbId: "44",
    statuses: [statuses.vengeance],
    relatedAbilities: { affectedBy: ["Shake It Off"], parentOnly: true },
    abilityType: AbilityType.SelfDefense,
    levelAcquired: 38,
  },
  {
    name: "Holmgang",
    translation: {
      de: "Holmgang",
      ja: "\u30DB\u30EB\u30E0\u30AE\u30E3\u30F3\u30B0",
      en: "Holmgang",
      fr: "Holmgang",
      cn: "死斗",
    },
    cooldown: 240,
    xivDbId: "43",
    requiresBossTarget: true,
    isUltimateSave: true,
    statuses: [statuses.holmgang],
    abilityType: AbilityType.SelfDefense,
    levelAcquired: 42,
  },
  {
    name: "Shake It Off",
    translation: {
      de: "Absch\u00FCtteln",
      ja: "\u30B7\u30A7\u30A4\u30AF\u30AA\u30D5",
      en: "Shake It Off",
      fr: "D\u00E9barrassage",
      cn: "摆脱",
    },
    cooldown: 90,
    xivDbId: "7388",
    abilityType: AbilityType.PartyShield,
    statuses: [statuses.shakeItOff],
    relatedAbilities: {
      affects: ["Thrill of Battle", "Vengence", "Raw Intuition"],
      parentOnly: true,
    },
    levelAcquired: 68,
  },
  {
    name: "Thrill of Battle",
    translation: {
      de: "Kampfrausch",
      ja: "\u30B9\u30EA\u30EB\u30FB\u30AA\u30D6\u30FB\u30D0\u30C8\u30EB",
      en: "Thrill of Battle",
      fr: "Frisson de la bataille",
      cn: "战栗",
    },
    cooldown: 90,
    xivDbId: "40",
    statuses: [statuses.thrillOfBattle],
    abilityType: AbilityType.SelfDefense | AbilityType.HealingBuff,
    relatedAbilities: { affectedBy: ["Shake It Off"], parentOnly: true },
    levelAcquired: 30,
  },
  {
    name: "Raw Intuition",
    translation: {
      de: "Urinstinkt",
      ja: "原初の直感",
      en: "Raw Intuition",
      fr: "Intuition pure",
      cn: "原初的直觉",
    },
    cooldown: 25,
    xivDbId: "3551",
    statuses: [statuses.rawIntuition],
    abilityType: AbilityType.SelfDefense,
    overlapStrategy: new SharedOverlapStrategy(["Nascent Flash"]),
    levelAcquired: 56,
  },
  {
    name: "Bloodwhetting",
    translation: {
      de: "Urimpuls",
      ja: "\u539F\u521D\u306E\u8840\u6C17",
      en: "Bloodwhetting",
      fr: "Intuition fougueuse",
      cn: "原初的血气",
    },
    cooldown: 25,
    xivDbId: "25751",
    statuses: [
      statuses.bloodWhetting,
      statuses.bloodWhettingStem,
      statuses.bloodWhettingTide,
    ], // todo: check to shield status
    abilityType: AbilityType.SelfDefense,
    relatedAbilities: { affectedBy: ["Shake It Off"], parentOnly: true },
    overlapStrategy: new SharedOverlapStrategy(["Nascent Flash"]),
    levelAcquired: 82,
  },
  {
    name: "Equilibrium",
    translation: {
      de: "\u00C4quilibrium",
      ja: "\u30A8\u30AF\u30EA\u30D6\u30EA\u30A6\u30E0",
      en: "Equilibrium",
      fr: "\u00C9quilibre",
      cn: "泰然自若",
    },
    cooldown: 60,
    xivDbId: "3552",
    abilityType: AbilityType.Healing,
    levelAcquired: 58,
  },
  {
    name: "Nascent Flash",
    translation: {
      de: "Urflackern",
      ja: "\u539F\u521D\u306E\u731B\u308A",
      en: "Nascent Flash",
      fr: "Exaltation naissante",
      cn: "原初的勇猛",
    },
    cooldown: 25,
    xivDbId: "16464",
    statuses: [statuses.nascentFlashPre82],
    abilityType: AbilityType.TargetDefense,
    settings: [settings.target],
    overlapStrategy: new SharedOverlapStrategy([
      "Bloodwhetting",
      "Raw Intuition",
    ]),
    levelAcquired: 76,
    cantUseOnSelf: true,
  },
  medicine.Strength,
  ...getAbilitiesFrom(tankSharedAbilities),
] as IAbility[];

const traits: ITrait[] = [
  {
    name: "Berserk Mastery",
    level: 70,
    apply: abilityRemovedTrait("Berserk", 70),
  },
  {
    name: "Raw Intuition Mastery",
    level: 82,
    apply: abilityRemovedTrait("Raw Intuition", 82),
  },
  {
    name: "Enhanced Nascent Flash",
    level: 82,
    apply: abilityTrait(
      "Nascent Flash",
      (ab) =>
        (ab.statuses = [
          statuses.nascentFlash,
          statuses.nascentFlashStem,
          statuses.nascentFlashTide,
        ])
    ),
  },
];

export const WAR: IJobTemplate = {
  translation: {
    de: "KRG",
    ja: "WAR",
    en: "WAR",
    fr: "GUE",
    cn: "WAR",
  },

  fullNameTranslation: {
    de: "Krieger",
    ja: "\u6226\u58EB",
    en: "Warrior",
    fr: "Guerrier",
    cn: "战士",
  },
  role: Role.Tank,
  abilities,
  traits,
};
