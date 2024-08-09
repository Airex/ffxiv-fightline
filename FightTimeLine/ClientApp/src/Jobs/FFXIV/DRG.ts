import {
  Role,
  AbilityType,
  IAbility,
  MapStatuses,
  IJobTemplate,
  ITrait,
} from "../../core/Models";
import { withStrengthMeleeSharedAbilities } from "./shared";
import { abilityRemovedTrait, abilityTrait } from "./traits";

const statuses = MapStatuses({
  lanceCharge: {
    duration: 20,
  },
  lifeSurge: {
    duration: 5,
  },
  dragonSight: {
    duration: 20,
  },
  battleLitany: {
    duration: 15,
  },
});

const abilities = [
  {
    name: "Life Surge",
    translation: {
      de: "Vitalwallung",
      ja: "\u30E9\u30A4\u30D5\u30B5\u30FC\u30B8",
      en: "Life Surge",
      fr: "Souffle de vie",
      cn: "龙剑",
    },
    cooldown: 40,
    xivDbId: "83",
    statuses: [statuses.lifeSurge],
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 6,
  },
  {
    name: "Winged Glide",
    translation: {
      de: "Schweben",
      ja: "\u30A6\u30A3\u30F3\u30B0\u30C9\u30A4\u30F3\u30B0",
      en: "Winged Glide",
      fr: "Glissade a\u00E9rienne",
      cn: "飞翔",
    },
    cooldown: 60,
    xivDbId: "36951",
    abilityType: AbilityType.Utility,
    levelAcquired: 45,
    requiresBossTarget: true,
  },
  {
    name: "Lance Charge",
    translation: {
      de: "Lanzensch\u00E4rfung",
      ja: "\u30E9\u30F3\u30B9\u30C1\u30E3\u30FC\u30B8",
      en: "Lance Charge",
      fr: "Lance ac\u00E9r\u00E9e",
      cn: "猛枪",
    },
    cooldown: 60,
    xivDbId: "85",
    statuses: [statuses.lanceCharge],
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 30,
  },
  {
    name: "Jump",
    translation: {
      de: "Sprung",
      en: "Jump",
      fr: "Saut",
      cn: "", // todo: translate
      ja: "ジャンプ",
    },
    cooldown: 30,
    xivDbId: "92",
    abilityType: AbilityType.Damage,
    levelAcquired: 30,
  },
  {
    name: "Battle Litany",
    translation: {
      de: "Litanei der Schlacht",
      ja: "\u30D0\u30C8\u30EB\u30EA\u30BF\u30CB\u30FC",
      en: "Battle Litany",
      fr: "Litanie combattante",
      cn: "战斗连祷",
    },
    cooldown: 120,
    xivDbId: "3557",
    statuses: [statuses.battleLitany],
    abilityType: AbilityType.PartyDamageBuff,
    levelAcquired: 52,
  },
  {
    name: "Dragonfire Dive",
    translation: {
      de: "Wyrmodem",
      ja: "\u30C9\u30E9\u30B4\u30F3\u30C0\u30A4\u30D6",
      en: "Dragonfire Dive",
      fr: "Piqu\u00E9 du dragon",
      cn: "龙炎冲",
    },
    cooldown: 120,
    xivDbId: "96",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 50,
  },
  {
    name: "Geirskogul",
    translation: {
      de: "Geirskogul",
      ja: "\u30B2\u30A4\u30EB\u30B9\u30B3\u30B0\u30EB",
      en: "Geirskogul",
      fr: "Geirsk\u00F6gul",
      cn: "武神枪",
    },
    cooldown: 60,
    xivDbId: "3555",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 60,
  },
  {
    name: "High Jump",
    translation: {
      de: "Hochsprung",
      ja: "\u30CF\u30A4\u30B8\u30E3\u30F3\u30D7",
      en: "High Jump",
      fr: "Grand saut",
      cn: "高跳",
    },
    cooldown: 30,
    xivDbId: "16478",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 74,
  },
  {
    name: "Stardiver",
    translation: {
      de: "Sternensturz",
      ja: "\u30B9\u30BF\u30FC\u30C0\u30A4\u30D0\u30FC",
      en: "Stardiver",
      fr: "Plongeon c\u00E9leste",
      cn: "坠星冲",
    },
    cooldown: 30,
    xivDbId: "16480",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 80,
  },
  {
    name: "Wyrmwind Thrust",
    translation: {
      de: "Zwillingswyrm",
      ja: "\u5929\u7ADC\u70B9\u775B",
      en: "Wyrmwind Thrust",
      fr: "Perc\u00E9e des dragons anciens",
      cn: "天龙点睛",
    },
    cooldown: 10,
    xivDbId: "25773",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 90,
  },
  {
    name: "Rise of the Dragon",
    translation: {
      de: "Drachenherz",
      ja: "\u30C9\u30E9\u30B4\u30F3\u30CF\u30FC\u30C4",
      en: "Rise of the Dragon",
      fr: "Ascension du dragon",
      cn: "龙之心",
    },
    cooldown: 1,
    abilityType: AbilityType.Damage,
    levelAcquired: 92,
    requiresBossTarget: true,
    xivDbId: 36953,
  },
  {
    name: "Starcross",
    translation: {
      de: "Sternenkreuz",
      ja: "\u30B9\u30BF\u30FC\u30AF\u30ED\u30B9",
      en: "Starcross",
      fr: "Croix c\u00E9leste",
      cn: "星交叉",
    },
    cooldown: 1,
    abilityType: AbilityType.Damage,
    levelAcquired: 100,
    requiresBossTarget: true,
    xivDbId: 36956,
  },
] as IAbility[];

const traits: ITrait[] = [
  {
    name: "Enhanced Life Surge",
    level: 88,
    apply: abilityTrait("Life Surge", {
      charges: {
        count: 2,
        cooldown: 45,
      },
    }),
  },
  {
    name: "Jump Mastery",
    level: 74,
    apply: abilityRemovedTrait("Jump", 74),
  },
  {
    name: "Enhanced Winged Glide",
    level: 84,
    apply: abilityTrait("Winged Glide", {
      charges: {
        count: 2,
        cooldown: 60,
      },
    }),
  },
];

export const DRG: IJobTemplate = withStrengthMeleeSharedAbilities({
  translation: {
    de: "DRG",
    ja: "DRG",
    en: "DRG",
    fr: "DRG",
    cn: "DRG",
  },

  fullNameTranslation: {
    de: "Dragoon",
    ja: "\u7ADC\u9A0E\u58EB",
    en: "Dragoon",
    fr: "Chevalier Dragon",
    cn: "龙骑士",
  },
  role: Role.Melee,
  abilities,
  traits,
});
