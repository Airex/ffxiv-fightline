import { byBuffApply } from "src/core/AbilityDetectors";
import { IJob, Role, AbilityType, IAbility, MapStatuses, settings, IJobTemplate, ITrait } from "../../core/Models";
import { getAbilitiesFrom, medicine, meleeSharedAbilities, toAbilities } from "./shared";
import { abilityRemovedTrait, abilityTrait } from "./traits";


const statuses = MapStatuses({
  lanceCharge: {
    duration: 20
  },
  lifeSurge: {
    duration: 5
  },
  dragonSight: {
    duration: 20
  },
  battleLitany: {
    duration: 15
  }
});

const abilities = [
  {
    name: "Life Surge",
    translation: {
      de: "Vitalwallung",
      ja: "\u30E9\u30A4\u30D5\u30B5\u30FC\u30B8",
      en: "Life Surge",
      fr: "Souffle de vie"
    },
    cooldown: 40,
    xivDbId: "83",
    statuses: [statuses.lifeSurge],
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 6
  },
  {
    name: "Lance Charge",
    translation: {
      de: "Lanzensch\u00E4rfung",
      ja: "\u30E9\u30F3\u30B9\u30C1\u30E3\u30FC\u30B8",
      en: "Lance Charge",
      fr: "Lance ac\u00E9r\u00E9e"
    },
    cooldown: 60,
    xivDbId: "85",
    statuses: [statuses.lanceCharge],
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 30
  },
  {
    name: "Jump",
    translation: {
      de: "Sprung",
      en: "Jump",
      fr: "Saut",
      ja: "ジャンプ"
    },
    cooldown: 30,
    xivDbId: "92",
    abilityType: AbilityType.Damage,
    levelAcquired: 30
  },
  {
    name: "Dragon Sight",
    translation: {
      de: "Drachenblick",
      ja: "\u30C9\u30E9\u30B4\u30F3\u30B5\u30A4\u30C8",
      en: "Dragon Sight",
      fr: "Vue de dragon"
    },
    cooldown: 120,
    xivDbId: "10032",
    statuses: [statuses.dragonSight],
    abilityType: AbilityType.PartyDamageBuff | AbilityType.SelfDamageBuff,
    settings: [settings.target],
    detectStrategy: byBuffApply(1001454, "Dragon Sight"),
    levelAcquired: 66
  },
  {
    name: "Battle Litany",
    translation: {
      de: "Litanei der Schlacht",
      ja: "\u30D0\u30C8\u30EB\u30EA\u30BF\u30CB\u30FC",
      en: "Battle Litany",
      fr: "Litanie combattante"
    },
    cooldown: 120,
    xivDbId: "3557",
    statuses: [statuses.battleLitany],
    abilityType: AbilityType.PartyDamageBuff,
    levelAcquired: 52
  },
  {
    name: "Dragonfire Dive",
    translation: {
      de: "Wyrmodem",
      ja: "\u30C9\u30E9\u30B4\u30F3\u30C0\u30A4\u30D6",
      en: "Dragonfire Dive",
      fr: "Piqu\u00E9 du dragon"
    },
    cooldown: 120,
    xivDbId: "96",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 50
  },
  {
    name: "Geirskogul",
    translation: {
      de: "Geirskogul",
      ja: "\u30B2\u30A4\u30EB\u30B9\u30B3\u30B0\u30EB",
      en: "Geirskogul",
      fr: "Geirsk\u00F6gul"
    },
    cooldown: 30,
    xivDbId: "3555",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 60
  },
  {
    name: "High Jump",
    translation: {
      de: "Hochsprung",
      ja: "\u30CF\u30A4\u30B8\u30E3\u30F3\u30D7",
      en: "High Jump",
      fr: "Grand saut"
    },
    cooldown: 30,
    xivDbId: "16478",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 74
  },
  {
    name: "Spineshatter Dive",
    translation: {
      de: "Wirbelsprenger",
      ja: "\u30B9\u30D1\u30A4\u30F3\u30C0\u30A4\u30D6",
      en: "Spineshatter Dive",
      fr: "Piqu\u00E9 brise-\u00E9chine"
    },
    cooldown: 60,
    xivDbId: "95",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 45
  },
  {
    name: "Stardiver",
    translation: {
      de: "Sternensturz",
      ja: "\u30B9\u30BF\u30FC\u30C0\u30A4\u30D0\u30FC",
      en: "Stardiver",
      fr: "Plongeon c\u00E9leste"
    },
    cooldown: 30,
    xivDbId: "16480",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 80
  },
  {
    name: "Wyrmwind Thrust",
    translation: {
      de: "Zwillingswyrm",
      ja: "\u5929\u7ADC\u70B9\u775B",
      en: "Wyrmwind Thrust",
      fr: "Perc\u00E9e des dragons anciens"
    },
    cooldown: 10,
    xivDbId: "25773",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 90
  },
  ...getAbilitiesFrom(meleeSharedAbilities),
  medicine.Strength
] as IAbility[];

const traits: ITrait[] = [
  {
    name: "Enhanced Life Surge",
    level: 88,
    apply: abilityTrait("Life Surge", {
      charges: {
        count: 2,
        cooldown: 45
      }
    })
  },
  {
    name: "Jump Mastery",
    level: 74,
    apply: abilityRemovedTrait("Jump", 74)
  },
  {
    name: "Enhanced Spineshatter Dive",
    level: 84,
    apply: abilityTrait("Spineshatter Dive", {
      charges: {
        count: 2,
        cooldown: 60
      }
    })
  }
];

export const DRG: IJobTemplate = {

  translation: {
    de: "DRG",
    ja: "DRG",
    en: "DRG",
    fr: "DRG"
  },

  fullNameTranslation: {
    de: "Dragoon",
    ja: "\u7ADC\u9A0E\u58EB",
    en: "Dragoon",
    fr: "Chevalier Dragon"
  },
  role: Role.Melee,
  abilities,
  traits
};


