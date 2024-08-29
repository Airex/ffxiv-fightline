import Effects from "../../core/Defensives/effects";
import {
  Role,
  AbilityType,
  IAbility,
  MapStatuses,
  IMitigator,
  MitigationVisitorContext,
  DamageType,
  SettingsEnum,
  settings,
  IJobTemplate,
  ITrait,
} from "../../core/Models";
import { withTankSharedAbilities } from "./shared";
import { abilityRemovedTrait, abilityTrait } from "./traits";

class InterventionMitigationModifier implements IMitigator {
  constructor(private value: number, private damageType: DamageType) {}
  apply(context: MitigationVisitorContext) {
    const original = context.holders.itemUsages.get(context.sourceAbilityId);

    const target = original.getSettingData(SettingsEnum.Target);

    if (!target || !target.value || context.sourceJobId === target.value) {
      return;
    }

    const abs = ["Rampart", "Sentinel", "Guardian"];

    const mts = abs.some((abName) => {
      const ab = context.holders.abilities.getByParentAndAbility(
        context.sourceJobId,
        abName
      );
      const has = context.holders.itemUsages
        .getByAbility(ab.id)
        .some((a) => a.checkCoversDate(original.start));
      return has;
    });

    const mitigation = mts ? this.value + 10 : this.value;
    context.addMitigationForTarget(mitigation, this.damageType);
  }
}

class DivineVeilMitigationModifier implements IMitigator {
  constructor(private value: number) {}
  apply(context: MitigationVisitorContext) {
    return context.addShieldForParty(this.value, context.sourceJobId);
  }
}

class CoverMitigationModifier implements IMitigator {
  constructor(private value: number, private damageType: DamageType) {}
  apply(context: MitigationVisitorContext) {
    const original = context.holders.itemUsages.get(context.sourceAbilityId);
    const target = original?.getSettingData(SettingsEnum.Target);
    if (!target || !target.value || context.sourceJobId === target.value) {
      return;
    }

    return context.addMitigationForTarget(this.value, this.damageType);
  }
}

const statuses = MapStatuses({
  fightOrFlight: {
    duration: 20,
  },
  circleOfScorn: {
    duration: 15,
  },
  requiescat: {
    duration: 30,
  },
  imperator: {
    duration: 30,
  },
  sentinel: {
    duration: 15,
    effects: [Effects.mitigation.solo(30)],
  },
  guardian: {
    duration: 15,
    effects: [Effects.mitigation.solo(40), Effects.shieldFromHeal.solo(1000)],
  },
  hallowedGround: {
    duration: 10,
    effects: [Effects.mitigation.solo(100)],
  },
  divineVeil: {
    duration: 30,
    effects: [
      Effects.shield.party(10).withModifier(DivineVeilMitigationModifier),
    ],
  },
  passageOfArms: {
    duration: 18,
    effects: [Effects.mitigation.party(15)],
  },
  cover: {
    duration: 12,
    effects: [
      Effects.mitigation.solo(100).withModifier(CoverMitigationModifier),
    ],
  },
  bulwark: {
    duration: 10,
    effects: [Effects.mitigation.solo(18)],
  },
  sheltron: {
    duration: 6,
    effects: [Effects.mitigation.solo(15)],
  },
  sheltron74Plus: {
    duration: 6,
    effects: [Effects.mitigation.solo(18)],
  },
  holySheltron: {
    duration: 8,
    effects: [Effects.mitigation.solo(15)],
  },
  holySheltronResolve: {
    duration: 4,
    effects: [Effects.mitigation.solo(15)],
  },
  interventionPre74: {
    duration: 6,
    effects: [
      Effects.mitigation.solo(10).withModifier(InterventionMitigationModifier),
    ],
  },
  intervention: {
    duration: 8,
    effects: [
      Effects.mitigation.solo(10).withModifier(InterventionMitigationModifier),
    ],
  },
  interventionResolve: {
    duration: 4,
    effects: [Effects.mitigation.solo(10)],
  },
});

const abilities = [
  {
    name: "Fight or Flight",
    translation: {
      de: "Verwegenheit",
      ja: "\u30D5\u30A1\u30A4\u30C8\u30FB\u30AA\u30A2\u30FB\u30D5\u30E9\u30A4\u30C8",
      en: "Fight or Flight",
      fr: "Combat acharn\u00E9",
      cn: "战逃反应",
    },
    statuses: [statuses.fightOrFlight],
    cooldown: 60,
    xivDbId: "20",
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 2,
  },
  {
    name: "Circle of Scorn",
    translation: {
      de: "Kreis der Verachtung",
      ja: "\u30B5\u30FC\u30AF\u30EB\u30FB\u30AA\u30D6\u30FB\u30C9\u30A5\u30FC\u30E0",
      en: "Circle of Scorn",
      fr: "Cercle du destin",
      cn: "厄运流转",
    },
    cooldown: 30,
    xivDbId: "23",
    statuses: [statuses.circleOfScorn],
    abilityType: AbilityType.Damage,
    levelAcquired: 50,
  },
  {
    name: "Requiescat",
    translation: {
      de: "Requiescat",
      ja: "\u30EC\u30AF\u30A4\u30A8\u30B9\u30AB\u30C3\u30C8",
      en: "Requiescat",
      fr: "Requiescat",
      cn: "安魂祈祷",
    },
    cooldown: 60,
    xivDbId: "7383",
    requiresBossTarget: true,
    statuses: [statuses.requiescat],
    abilityType: AbilityType.SelfDamageBuff | AbilityType.Damage,
    levelAcquired: 68,
  },
  {
    name: "Imperator",
    translation: {
      de: "Imperator",
      ja: "\u30A4\u30F3\u30DA\u30E9\u30C8\u30FC\u30EB",
      en: "Imperator",
      fr: "Imperator",
      cn: "帝王",
    },
    cooldown: 60,
    xivDbId: 36921,
    requiresBossTarget: true,
    statuses: [statuses.imperator],
    abilityType: AbilityType.SelfDamageBuff | AbilityType.Damage,
    levelAcquired: 96,
  },
  {
    name: "Sentinel",
    translation: {
      de: "Sentinel",
      ja: "\u30BB\u30F3\u30C1\u30CD\u30EB",
      en: "Sentinel",
      fr: "Sentinelle",
      cn: "预警",
    },
    cooldown: 120,
    xivDbId: "17",
    statuses: [statuses.sentinel],
    abilityType: AbilityType.SelfDefense,
    levelAcquired: 38,
  },
  {
    name: "Guardian",
    translation: {
      de: "W\u00E4chter",
      ja: "\u30AC\u30FC\u30CC",
      en: "Guardian",
      fr: "Gardien",
      cn: "守护",
    },
    cooldown: 120,
    xivDbId: 36920,
    statuses: [statuses.guardian],
    abilityType: AbilityType.SelfDefense,
    levelAcquired: 92,
  },
  {
    name: "Bulwark",
    translation: {
      de: "Bollwerk",
      ja: "\u30D6\u30EB\u30EF\u30FC\u30AF",
      en: "Bulwark",
      fr: "Forteresse",
      cn: "壁垒",
    },
    cooldown: 90,
    xivDbId: "22",
    statuses: [statuses.bulwark],
    abilityType: AbilityType.SelfDefense,
    levelAcquired: 52,
  },
  {
    name: "Hallowed Ground",
    translation: {
      de: "Heiliger Boden",
      ja: "\u30A4\u30F3\u30D3\u30F3\u30B7\u30D6\u30EB",
      en: "Hallowed Ground",
      fr: "Invincible",
      cn: "神圣领域",
    },
    cooldown: 420,
    xivDbId: "30",
    statuses: [statuses.hallowedGround],
    abilityType: AbilityType.SelfDefense,
    levelAcquired: 50,
  },
  {
    name: "Divine Veil",
    translation: {
      de: "Heiliger Quell",
      ja: "\u30C7\u30A3\u30F4\u30A1\u30A4\u30F3\u30F4\u30A7\u30FC\u30EB",
      en: "Divine Veil",
      fr: "Voile divin",
      cn: "圣光幕帘",
    },
    cooldown: 90,
    xivDbId: "3540",
    statuses: [statuses.divineVeil],
    abilityType: AbilityType.PartyShield,
    levelAcquired: 56,
    settings: [settings.activation],
  },
  {
    name: "Passage of Arms",
    translation: {
      de: "Waffengang",
      ja: "\u30D1\u30C3\u30BB\u30FC\u30B8\u30FB\u30AA\u30D6\u30FB\u30A2\u30FC\u30E0\u30BA",
      en: "Passage of Arms",
      fr: "Passe d\u0027armes",
      cn: "武装戍卫",
    },
    cooldown: 120,
    xivDbId: "7385",
    statuses: [statuses.passageOfArms],
    abilityType: AbilityType.PartyDefense,
    levelAcquired: 70,
  },
  {
    name: "Cover",
    translation: {
      de: "Deckung",
      ja: "\u304B\u3070\u3046",
      en: "Cover",
      fr: "Couverture",
      cn: "保护",
    },
    cooldown: 120,
    xivDbId: "27",
    statuses: [statuses.cover],
    abilityType: AbilityType.TargetDefense,
    settings: [settings.target],
    levelAcquired: 45,
  },
  {
    name: "Sheltron",
    translation: {
      de: "Schiltron",
      ja: "シェルトロン",
      en: "Sheltron",
      fr: "Schiltron",
      cn: "盾阵",
    },
    cooldown: 5,
    xivDbId: "3542",
    requiresBossTarget: true,
    statuses: [statuses.sheltron],
    abilityType: AbilityType.SelfDefense,
    levelAcquired: 35,
    charges: {
      count: 2,
      cooldown: 30,
    },
  },
  {
    name: "Holy Sheltron",
    translation: {
      de: "Heiliges Schiltron",
      ja: "\u30DB\u30FC\u30EA\u30FC\u30B7\u30A7\u30EB\u30C8\u30ED\u30F3",
      en: "Holy Sheltron",
      fr: "Schiltron sacr\u00E9",
      cn: "圣盾阵",
    },
    cooldown: 8,
    xivDbId: "25746",
    requiresBossTarget: true,
    statuses: [statuses.holySheltron, statuses.holySheltronResolve],
    abilityType: AbilityType.SelfDefense,
    levelAcquired: 82,
    charges: {
      count: 2,
      cooldown: 30,
    },
  },
  {
    name: "Intervention",
    translation: {
      de: "Intervention",
      ja: "\u30A4\u30F3\u30BF\u30FC\u30D9\u30F3\u30B7\u30E7\u30F3",
      en: "Intervention",
      fr: "Intervention",
      cn: "干预",
    },
    cooldown: 10,
    xivDbId: "7382",
    requiresBossTarget: true,
    statuses: [statuses.interventionPre74],
    abilityType: AbilityType.TargetDefense,
    settings: [settings.target],
    levelAcquired: 62,
  },
  {
    name: "Intervene",
    translation: {
      de: "Einschreiten",
      ja: "\u30A4\u30F3\u30BF\u30FC\u30F4\u30A3\u30FC\u30F3",
      en: "Intervene",
      fr: "Irruption brutale",
      cn: "调停",
    },
    cooldown: 0,
    xivDbId: "16461",
    requiresBossTarget: true,
    abilityType: AbilityType.Utility,
    charges: {
      count: 2,
      cooldown: 30,
    },
    levelAcquired: 74,
  },
  {
    name: "Expiacion",
    translation: {
      de: "Expiacion",
      ja: "\u30A8\u30AF\u30B9\u30D4\u30A2\u30B7\u30AA\u30F3",
      en: "Expiacion",
      fr: "Expiation",
      cn: "偿赎剑",
    },
    cooldown: 30,
    xivDbId: "25747",
    abilityType: AbilityType.Damage,
    levelAcquired: 86,
  },
  {
    name: "Spirits Within",
    translation: {
      de: "Selbsterhaltungstrieb",
      ja: "スピリッツウィズイン",
      en: "Spirits Within",
      fr: "Esprits intérieurs",
      cn: "深奥之灵",
    },
    cooldown: 30,
    xivDbId: "29",
    abilityType: AbilityType.Damage,
    levelAcquired: 30,
  },
  {
    name: "Blade of Honor",
    translation: {
      de: "Klinge der Ehre",
      ja: "ブレイド・オブ・オナー",
      en: "Blade of Honor",
      fr: "Lame d'honneur",
      cn: "荣誉之刃",
    },
    abilityType: AbilityType.Damage,
    cooldown: 1,
    levelAcquired: 100,
    requiresBossTarget: true,
    xivDbId: 36922,
  },
] as IAbility[];

const traits: ITrait[] = [
  {
    name: "Enhanced Sheltron",
    level: 74,
    apply: abilityTrait("Sheltron", (ab) => {
      ab.statuses = [statuses.sheltron74Plus];
      ab.cooldown = 6;
    }),
  },
  {
    name: "Sheltron Mastery",
    level: 74,
    apply: abilityRemovedTrait("Sheltron", 82),
  },
  {
    name: "Enhanced Intervention",
    level: 82,
    apply: abilityTrait("Intervention", (ab) => {
      ab.statuses = [statuses.intervention, statuses.interventionResolve];
    }),
  },
  {
    name: "Spirits Within Mastery",
    level: 86,
    apply: abilityRemovedTrait("Spirits Within", 86),
  },
  {
    name: "Sentinel Mastery",
    level: 92,
    apply: abilityRemovedTrait("Sentinel", 92),
  },
  {
    name: "Requiescat Mastery",
    level: 96,
    apply: abilityRemovedTrait("Requiescat", 96),
  },
];

export const PLD: IJobTemplate = withTankSharedAbilities({
  translation: {
    de: "PLD",
    ja: "PLD",
    en: "PLD",
    fr: "PLD",
    cn: "PLD",
  },

  fullNameTranslation: {
    de: "Paladin",
    ja: "\u30CA\u30A4\u30C8",
    en: "Paladin",
    fr: "Paladin",
    cn: "\u9a91\u58eb",
  },
  role: Role.Tank,
  abilities,
  traits,
});
