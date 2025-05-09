import Effects from "../../core/Defensives/effects";
import {
  Role,
  AbilityType,
  DamageType,
  IAbility,
  MapStatuses,
  settings,
  IJobTemplate,
  ITrait,
} from "../../core/Models";
import { getAbilitiesFrom, withTankSharedAbilities } from "./shared";
import { abilityRemovedTrait } from "./traits";

const statuses = MapStatuses({
  noMercy: {
    duration: 20,
  },
  camouflage: {
    duration: 20,
    effects: [Effects.mitigation.solo(10)],
  },
  nebula: {
    duration: 15,
    effects: [Effects.mitigation.solo(30)],
  },
  greatNebula: {
    duration: 15,
    effects: [Effects.mitigation.solo(40), Effects.hpIncrease.self(20)],
  },
  aurora: {
    duration: 18,
  },
  superbolide: {
    duration: 10,
    effects: [Effects.mitigation.solo(100)],
  },
  bowShock: {
    duration: 15,
  },
  heartOfLight: {
    duration: 15,
    effects: [Effects.mitigation.party(10, DamageType.Magical), Effects.mitigation.party(5, DamageType.Physical)],
  },
  heartOfStone: {
    duration: 7,
    effects: [Effects.mitigation.solo(15)],
  },
  heartOfCorundum: {
    duration: 8,
    effects: [Effects.mitigation.solo(15)],
  },
  heartOfCorundumClarity: {
    duration: 4,
    effects: [Effects.mitigation.solo(15)],
  },
});

const abilities = [
  {
    name: "No Mercy",
    translation: {
      de: "Ohne Gnade",
      ja: "\u30CE\u30FC\u30FB\u30DE\u30FC\u30B7\u30FC",
      en: "No Mercy",
      fr: "Sans piti\u00E9",
      cn: "无情",
    },
    cooldown: 60,
    xivDbId: "16138",
    statuses: [statuses.noMercy],
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 2,
  },
  {
    name: "Camouflage",
    translation: {
      de: "Camouflage",
      ja: "\u30AB\u30E2\u30D5\u30E9\u30FC\u30B8\u30E5",
      en: "Camouflage",
      fr: "Camouflage",
      cn: "伪装",
    },
    cooldown: 90,
    xivDbId: "16140",
    abilityType: AbilityType.SelfDefense,
    statuses: [statuses.camouflage],
    levelAcquired: 6,
  },
  {
    name: "Nebula",
    translation: {
      de: "Nebula",
      ja: "\u30CD\u30D3\u30E5\u30E9",
      en: "Nebula",
      fr: "N\u00E9buleuse",
      cn: "星云",
    },
    cooldown: 120,
    xivDbId: "16148",
    statuses: [statuses.nebula],
    abilityType: AbilityType.SelfDefense,
    levelAcquired: 38,
    levelRemoved: 92,
  },
  {
    name: "Great Nebula",
    translation: {
      de: "Große Nebula",
      ja: "\u30B0\u30EC\u30FC\u30C8\u30CD\u30D3\u30E5\u30E9",
      en: "Great Nebula",
      fr: "Grande N\u00E9buleuse",
      cn: "大星云",
    },
    cooldown: 120,
    xivDbId: 36935,
    statuses: [statuses.greatNebula],
    abilityType: AbilityType.SelfDefense,
    levelAcquired: 92,
  },
  {
    name: "Aurora",
    translation: {
      de: "Aurora",
      ja: "\u30AA\u30FC\u30ED\u30E9",
      en: "Aurora",
      fr: "Aurore",
      cn: "极光",
    },
    cooldown: 60,
    xivDbId: "16151",
    statuses: [statuses.aurora],
    abilityType: AbilityType.Healing,
    settings: [settings.target],
    levelAcquired: 45,
    charges: {
      count: 2,
      cooldown: 60,
    },
  },
  {
    name: "Superbolide",
    translation: {
      de: "Meteoritenfall",
      ja: "\u30DC\u30FC\u30E9\u30A4\u30C9",
      en: "Superbolide",
      fr: "Bolide",
      cn: "超火流星",
    },
    cooldown: 360,
    xivDbId: "16152",
    statuses: [statuses.superbolide],
    abilityType: AbilityType.SelfDefense,
    levelAcquired: 50,
  },
  {
    name: "Trajectory",
    translation: {
      de: "Projektilbahn",
      ja: "\u30C8\u30E9\u30D3\u30A8\u30C3\u30C8",
      en: "Trajectory",
      fr: "Trajectoire",
      cn: "弹道",
    },
    cooldown: 30,
    xivDbId: "16154",
    abilityType: AbilityType.Utility,
    charges: {
      count: 2,
      cooldown: 30,
    },
    levelAcquired: 56,
  },
  {
    name: "Bow Shock",
    translation: {
      de: "Schockpatrone",
      ja: "\u30D0\u30A6\u30B7\u30E7\u30C3\u30AF",
      en: "Bow Shock",
      fr: "Arc de choc",
      cn: "弓形冲波",
    },
    cooldown: 60,
    xivDbId: "16159",
    statuses: [statuses.bowShock],
    abilityType: AbilityType.Damage,
    levelAcquired: 62,
  },
  {
    name: "Heart of Light",
    translation: {
      de: "Wackeres Herz",
      ja: "\u30CF\u30FC\u30C8\u30FB\u30AA\u30D6\u30FB\u30E9\u30A4\u30C8",
      en: "Heart of Light",
      fr: "C\u0153ur de Lumi\u00E8re",
      cn: "光之心",
    },
    cooldown: 90,
    xivDbId: "16160",
    statuses: [statuses.heartOfLight],
    abilityType: AbilityType.PartyDefense,
    levelAcquired: 64,
  },
  {
    name: "Heart of Stone",
    translation: {
      de: "Steinernes Herz",
      en: "Heart of Stone",
      fr: "Cœur de pierre",
      cn: "石之心",
      ja: "ハート・オブ・ストーン",
    },
    cooldown: 25,
    xivDbId: "16161",
    statuses: [statuses.heartOfStone],
    abilityType: AbilityType.TargetDefense,
    settings: [settings.target],
    levelAcquired: 68,
  },
  {
    name: "Heart of Corundum",
    translation: {
      de: "Herz des Korunds",
      ja: "\u30CF\u30FC\u30C8\u30FB\u30AA\u30D6\u30FB\u30B3\u30E9\u30F3\u30C0\u30E0",
      en: "Heart of Corundum",
      fr: "C\u0153ur de corindon",
      cn: "刚玉之心",
    },
    cooldown: 25,
    xivDbId: "25758",
    statuses: [statuses.heartOfCorundum, statuses.heartOfCorundumClarity],
    abilityType: AbilityType.TargetDefense,
    settings: [settings.target],
    levelAcquired: 82,
  },
  {
    name: "Bloodfest",
    translation: {
      de: "Blutpatronen",
      ja: "\u30D6\u30E9\u30C3\u30C9\u30BD\u30A4\u30EB",
      en: "Bloodfest",
      fr: "Cartouche de sang",
      cn: "血壤",
    },
    cooldown: 120,
    xivDbId: "16164",
    abilityType: AbilityType.Utility,
    levelAcquired: 76,
  },
  {
    name: "Danger Zone",
    translation: {
      de: "Sprengzone",
      en: "Danger Zone",
      fr: "Zone de danger",
      cn: "危险领域",
      ja: "デンジャーゾーン",
    },
    cooldown: 30,
    xivDbId: "16144",
    abilityType: AbilityType.Damage,
    levelAcquired: 18,
  },
  {
    name: "Blasting Zone",
    translation: {
      de: "Erda-Detonation",
      ja: "\u30D6\u30E9\u30B9\u30C6\u30A3\u30F3\u30B0\u30BE\u30FC\u30F3",
      en: "Blasting Zone",
      fr: "Zone de destruction",
      cn: "爆破领域",
    },
    cooldown: 30,
    xivDbId: "16165",
    abilityType: AbilityType.Damage,
    levelAcquired: 80,
  },
] as IAbility[];

const traits: ITrait[] = [
  {
    name: "Danger Zone Mastery",
    level: 80,
    apply: abilityRemovedTrait("Danger Zone", 80),
  },
  {
    name: "Heart of Stone Mastery",
    level: 82,
    apply: abilityRemovedTrait("Heart of Stone", 82),
  },
];

export const GNB: IJobTemplate = withTankSharedAbilities({
  translation: {
    de: "REV",
    ja: "GNB",
    en: "GNB",
    fr: "PSB",
    cn: "GNB",
  },

  fullNameTranslation: {
    de: "Revolverklinge",
    ja: "\u30AC\u30F3\u30D6\u30EC\u30A4\u30AB\u30FC",
    en: "Gunbreaker",
    fr: "Pistosabreur",
    cn: "绝枪战士",
  },
  role: Role.Tank,
  abilities,
  traits,
});
