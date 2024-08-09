import Effects from "src/core/Defensives/effects";
import {
  Role,
  AbilityType,
  IAbility,
  MapStatuses,
  settings,
  IJobTemplate,
  ITrait,
} from "../../core/Models";
import {
  withHealerSharedAbilities,
} from "./shared";
import { abilityTrait } from "./traits";

const statuses = MapStatuses({
  lightSpeed: {
    duration: 15,
  },
  synastry: {
    duration: 20,
  },
  divination: {
    duration: 20,
  },
  collectiveUnconscious: {
    duration: 18,
    effects: [Effects.mitigation.party(10)],
  },
  celestialOpposition: {
    duration: 15,
  },
  celestialIntersection: {
    effects: [Effects.shieldFromHeal.solo(200)],
    potency: 200,
    duration: 30,
  },
  earthlyStar: {
    duration: 20,
  },
  horoscope: {
    duration: 30,
  },
  neutralSect: {
    duration: 20,
    Effects: [Effects.healingIncrease.solo(20)],
    // todo: When casting Aspected Benefic or Aspected Helios, erects a magicked barrier which nullifies damage
    // Aspected Benefic Effect: Nullifies damage equaling 250% of the amount of HP restored
    // Aspected Helios Effect: Nullifies damage equaling 125% of the amount of HP restored
  },
  exaltation: {
    duration: 8,
    effects: [Effects.mitigation.solo(10)],
  },
  macrocosmos: {
    duration: 15,
  },
  sunSign: {
    duration: 15,
    effects: [Effects.mitigation.party(10)],
  },
});

const abilities = [
  {
    name: "Lightspeed",
    translation: {
      de: "Lichtgeschwindigkeit",
      ja: "\u30E9\u30A4\u30C8\u30B9\u30D4\u30FC\u30C9",
      en: "Lightspeed",
      fr: "Vitesse de la lumi\u00E8re",
      cn: "光速",
    },
    cooldown: 120,
    xivDbId: "3606",
    statuses: [statuses.lightSpeed],
    abilityType: AbilityType.Utility,
    levelAcquired: 6,
  },
  {
    name: "Essential Dignity",
    translation: {
      de: "Essenzielle W\u00FCrde",
      ja: "\u30C7\u30A3\u30B0\u30CB\u30C6\u30A3",
      en: "Essential Dignity",
      fr: "Dignit\u00E9 essentielle",
      cn: "先天禀赋",
    },
    cooldown: 40,
    xivDbId: 3614,
    abilityType: AbilityType.Healing,
    settings: [settings.target],
    levelAcquired: 15,
  },
  {
    name: "Synastry",
    translation: {
      de: "Synastrie",
      ja: "\u30B7\u30CA\u30B9\u30C8\u30EA\u30FC",
      en: "Synastry",
      fr: "Synastrie",
      cn: "星位合图",
    },
    cooldown: 120,
    xivDbId: "3612",
    statuses: [statuses.synastry],
    abilityType: AbilityType.Healing,
    settings: [settings.target],
    levelAcquired: 50,
  },
  {
    name: "Divination",
    translation: {
      de: "Weissagung",
      ja: "\u30C7\u30A3\u30F4\u30A3\u30CD\u30FC\u30B7\u30E7\u30F3",
      en: "Divination",
      fr: "Divination",
      cn: "占卜",
    },
    cooldown: 120,
    xivDbId: "16552",
    statuses: [statuses.divination],
    abilityType: AbilityType.PartyDamageBuff,
    levelAcquired: 50,
  },
  {
    name: "Collective Unconscious",
    translation: {
      de: "Numinosum",
      ja: "\u904B\u547D\u306E\u8F2A",
      en: "Collective Unconscious",
      fr: "Inconscient collectif",
      cn: "命运之轮",
    },
    cooldown: 60,
    xivDbId: "3613",
    statuses: [statuses.collectiveUnconscious],
    abilityType: AbilityType.PartyDefense | AbilityType.PartyHealing,
    defensiveStats: {
      mitigationPercent: 10,
    },
    levelAcquired: 58,
  },
  {
    name: "Celestial Opposition",
    translation: {
      de: "Opposition",
      ja: "\u661F\u5929\u5BFE\u6297",
      en: "Celestial Opposition",
      fr: "Opposition c\u00E9leste",
      cn: "天星冲日",
    },
    cooldown: 60,
    xivDbId: "16553",
    statuses: [statuses.celestialOpposition],
    abilityType: AbilityType.PartyHealing,
    levelAcquired: 60,
  },
  {
    name: "Earthly Star",
    translation: {
      de: "Irdischer Stern",
      ja: "\u30A2\u30FC\u30B5\u30EA\u30FC\u30B9\u30BF\u30FC",
      en: "Earthly Star",
      fr: "\u00C9toile terrestre",
      cn: "地星",
    },
    cooldown: 60,
    xivDbId: "7439",
    statuses: [statuses.earthlyStar],
    abilityType: AbilityType.PartyHealing,
    levelAcquired: 62,
  },
  {
    name: "Minor Arcana",
    translation: {
      de: "Kleine Arkana",
      ja: "\u30DE\u30A4\u30CA\u30FC\u30A2\u30EB\u30AB\u30CA",
      en: "Minor Arcana",
      fr: "Arcane mineur",
      cn: "小奥秘卡",
    },
    cooldown: 60,
    xivDbId: "7443",
    requiresBossTarget: true,
    abilityType: AbilityType.Utility,
    levelAcquired: 70,
  },
  {
    name: "Celestial Intersection",
    translation: {
      de: "Kongruenz",
      ja: "\u661F\u5929\u4EA4\u5DEE",
      en: "Celestial Intersection",
      fr: "Rencontre c\u00E9leste",
      cn: "天星交错",
    },
    cooldown: 30,
    xivDbId: "16556",
    abilityType: AbilityType.Healing | AbilityType.SelfShield,
    levelAcquired: 74,
    charges: {
      count: 2,
      cooldown: 30,
    },
    statuses: [statuses.celestialIntersection],
  },
  {
    name: "Horoscope",
    translation: {
      de: "Horoskop",
      ja: "\u30DB\u30ED\u30B9\u30B3\u30FC\u30D7",
      en: "Horoscope",
      fr: "Horoscope",
      cn: "天宫图",
    },
    cooldown: 60,
    xivDbId: "16557",
    statuses: [statuses.horoscope],
    abilityType: AbilityType.PartyHealing,
    levelAcquired: 76,
  },
  {
    name: "Neutral Sect",
    translation: {
      de: "Neutral",
      ja: "\u30CB\u30E5\u30FC\u30C8\u30E9\u30EB\u30BB\u30AF\u30C8",
      en: "Neutral Sect",
      fr: "Adepte de la neutralit\u00E9",
      cn: "中间学派",
    },
    cooldown: 120,
    xivDbId: "16559",
    statuses: [statuses.neutralSect],
    abilityType: AbilityType.HealingBuff | AbilityType.PartyDefense,
    levelAcquired: 80,
  },
  {
    name: "Exaltation",
    translation: {
      de: "Exaltation",
      ja: "\u30A8\u30AF\u30B6\u30EB\u30C6\u30FC\u30B7\u30E7\u30F3",
      en: "Exaltation",
      fr: "Exaltation",
      cn: "擢升",
    },
    cooldown: 60,
    xivDbId: "25873",
    abilityType: AbilityType.SelfDefense | AbilityType.TargetDefense,
    levelAcquired: 86,
    settings: [settings.target],
    statuses: [statuses.exaltation],
  },
  {
    name: "Macrocosmos",
    translation: {
      de: "Makrokosmos",
      ja: "\u30DE\u30AF\u30ED\u30B3\u30B9\u30E2\u30B9",
      en: "Macrocosmos",
      fr: "Macrocosme",
      cn: "大宇宙",
    },
    cooldown: 180,
    xivDbId: 25874,
    abilityType: AbilityType.PartyHealing | AbilityType.Damage,
    levelAcquired: 90,
    statuses: [statuses.macrocosmos],
  },
  {
    name: "Oracle",
    translation: {
      de: "Orakel",
      ja: "\u30AA\u30E9\u30AF\u30EB",
      en: "Oracle",
      fr: "Oracle",
      cn: "神谕",
    },
    cooldown: 1,
    xivDbId: 37029,
    abilityType: AbilityType.Damage,
    levelAcquired: 92,
    requiresBossTarget: true,
  },
  {
    name: "Sun Sign",
    translation: {
      de: "Sonnensiegel",
      ja: "\u30B5\u30F3\u30B5\u30A4\u30F3",
      en: "Sun Sign",
      fr: "Signe sol",
      cn: "太阳印记",
    },
    cooldown: 1,
    xivDbId: 37030,
    abilityType: AbilityType.PartyDefense,
    statuses: [statuses.sunSign],
    levelAcquired: 100,
  },
] as IAbility[];

const traits: ITrait[] = [
  {
    name: "Hyper Lightspeed",
    level: 68,
    apply: abilityTrait("Lightspeed", {
      cooldown: 60,
      charges: { count: 2, cooldown: 60 },
    }),
  },
  {
    name: "Enhanced Essential Dignity",
    level: 78,
    apply: abilityTrait("Essential Dignity", {
      charges: {
        count: 2,
        cooldown: 40,
      },
    }),
  },
  {
    name: "Enhanced Essential Dignity II",
    level: 98,
    apply: abilityTrait("Essential Dignity", {
      charges: {
        count: 3,
        cooldown: 40,
      },
    }),
  },
  {
    name: "Enhanced Celestial Intersection",
    level: 88,
    apply: abilityTrait("Celestial Intersection", {
      charges: {
        count: 2,
        cooldown: 30,
      },
    }),
  },
];
export const AST: IJobTemplate = withHealerSharedAbilities({
  translation: {
    de: "AST",
    ja: "AST",
    en: "AST",
    fr: "AST",
    cn: "AST",
  },
  fullNameTranslation: {
    de: "Astrologe",
    ja: "\u5360\u661F\u8853\u5E2B",
    en: "Astrologian",
    fr: "Astromancien",
    cn: "占星术士",
  },
  role: Role.Healer,
  abilities,
  traits,
});
