import {
  AbilityType,
  IAbility,
  IJobTemplate,
  MapStatuses,
  Role,
} from "src/core/Models";
import {
  casterSharedAbilities,
  casterSharedTraits,
  getAbilitiesFrom,
  medicine,
} from "./shared";
import Effects from "src/core/Defensives/effects";

const statuses = MapStatuses({
  starryMuse: {
    duration: 20,
  },
  temperaCoat: {
    duration: 10,
    effects: [Effects.shield.solo(10)],
  },
  temperaGrassa: {
    duration: 10,
    effects: [Effects.shield.party(10)],
  },
});

const abilities = [
  {
    name: "Tempera Coat",
    translation: {
      de: "Tempera-Schicht",
      ja: "\u30C6\u30F3\u30DA\u30E9\u30B3\u30FC\u30C8",
      en: "Tempera Coat",
      fr: "Enduit a tempera",
      cn: "Tempera Coat", // todo: translate
    },
    cooldown: 120,
    xivDbId: 34685,
    abilityType: AbilityType.SelfShield,
    levelAcquired: 10,
    statuses: [statuses.temperaCoat],
  },
  {
    name: "Smudge",
    translation: {
      de: "Schmierschritt",
      ja: "\u30B9\u30DE\u30C3\u30B8",
      en: "Smudge",
      fr: "Barbouillage",
      cn: "Smudge", // todo: translate
    },
    cooldown: 20,
    xivDbId: 34684,
    abilityType: AbilityType.Utility,
    levelAcquired: 20,
  },
  {
    name: "Pom Muse",
    translation: {
      de: "Muse mit Bommel",
      ja: "\u30A4\u30DE\u30B8\u30F3\u30DD\u30F3\u30DD\u30F3",
      en: "Pom Muse",
      fr: "Imagi Pompon",
      cn: "Pom Muse", // todo: translate
    },
    cooldown: 40,
    xivDbId: 34670,
    levelAcquired: 30,
    abilityType: AbilityType.Damage,
    charges: { count: 3, cooldown: 40 },
  },
  {
    name: "Winged Muse",
    translation: {
      de: "Beschwingte Muse",
      ja: "\u30A4\u30DE\u30B8\u30F3\u30A6\u30A3\u30F3\u30B0",
      en: "Winged Muse",
      fr: "Imagi Ailes",
      cn: "Winged Muse", // todo: translate
    },
    cooldown: 40,
    xivDbId: 34671,
    levelAcquired: 30,
    abilityType: AbilityType.Damage,
    charges: { count: 3, cooldown: 40 },
  },
  {
    name: "Mog of the Ages",
    translation: {
      de: "Opus Mognum",
      ja: "\u30E2\u30FC\u30B0\u30EA\u30B9\u30C8\u30EA\u30FC\u30E0",
      en: "Mog of the Ages",
      fr: "Mognum opus",
      cn: "Mog of the Ages", // todo: translate
    },
    cooldown: 30,
    xivDbId: 34676,
    levelAcquired: 30,
    abilityType: AbilityType.Damage,
  },
  {
    name: "Striking Muse",
    translation: {
      en: "Striking Muse",
      de: "Striking Muse",
      ja: "Striking Muse",
      fr: "Striking Muse",
      cn: "Striking Muse",
    },
    cooldown: 60,
    xivDbId: 34674,
    levelAcquired: 50,
    abilityType: AbilityType.Utility,
    charges: { count: 2, cooldown: 60 },
  },
  {
    name: "Subtractive Palette",
    translation: {
      de: "Subtraktive Palette",
      ja: "\u30B5\u30D6\u30C8\u30E9\u30AF\u30C6\u30A3\u30D6\u30D1\u30EC\u30C3\u30C8",
      en: "Subtractive Palette",
      fr: "Palette soustractive",
      cn: "Subtractive Palette", //todo: translate
    },
    cooldown: 1,
    xivDbId: 34683,
    levelAcquired: 60,
    abilityType: AbilityType.Utility,
  },
  {
    name: "Tempera Grassa",
    translation: {
      de: "Fette Tempera",
      ja: "\u30C6\u30F3\u30DA\u30E9\u30B0\u30E9\u30C3\u30B5",
      en: "Tempera Grassa",
      fr: "Tempera grassa",
      cn: "Tempera Grassa",
    },
    cooldown: 120,
    xivDbId: 34686,
    abilityType: AbilityType.Utility,
    levelAcquired: 70,
    statuses: [statuses.temperaGrassa],
  },
  {
    name: "Starry Muse",
    translation: {
      en: "Starry Muse",
      de: "Sternenmuse",
      ja: "星の女神",
      fr: "Muse stellaire",
      cn: "星之女神",
    },
    cooldown: 120,
    xivDbId: 34675,
    requiresBossTarget: false,
    abilityType: AbilityType.PartyDamageBuff,
    levelAcquired: 70,
    statuses: [statuses.starryMuse],
  },
  {
    name: "Clawed Muse",
    translation: {
      de: "Kratzende Muse",
      ja: "\u30A4\u30DE\u30B8\u30F3\u30AF\u30ED\u30FC",
      en: "Clawed Muse",
      fr: "Imagi Griffes",
      cn: "Clawed Muse", // todo: translate
    },
    cooldown: 40,
    xivDbId: 34672,
    abilityType: AbilityType.Damage,
    levelAcquired: 96,
    charges: { count: 3, cooldown: 40 },
  },
  {
    name: "Fanged Muse",
    translation: {
      de: "Bei\u00DFende Muse",
      ja: "\u30A4\u30DE\u30B8\u30F3\u30D5\u30A1\u30F3\u30B0",
      en: "Fanged Muse",
      fr: "Imagi Crocs",
      cn: "Fanged Muse", // todo: translate
    },
    cooldown: 40,
    xivDbId: 34673,
    abilityType: AbilityType.Damage,
    levelAcquired: 96,
    charges: { count: 3, cooldown: 40 },
  },
  {
    name: "Retribution of the Madeen",
    translation: {
      de: "Vergeltung der Madhin",
      ja: "\u30DE\u30C7\u30A3\u30FC\u30F3\u30EC\u30C8\u30EA\u30D3\u30E5\u30FC\u30B7\u30E7\u30F3",
      en: "Retribution of the Madeen",
      fr: "R\u00E9tribution de Marthym",
      cn: "Retribution of the Madeen", // todo: translate
    },
    cooldown: 30,
    xivDbId: 34677,
    abilityType: AbilityType.Damage,
    levelAcquired: 96,
  },
  ...getAbilitiesFrom(casterSharedAbilities),
  medicine.Intelligence,
] as IAbility[];

const traits = [...casterSharedTraits];

export const PCT: IJobTemplate = {
  translation: {
    de: "PKT",
    ja: "PCT",
    en: "PCT",
    fr: "PIC",
    cn: "PCT",
  },

  fullNameTranslation: {
    de: "Piktomant",
    ja: "\u30D4\u30AF\u30C8\u30DE\u30F3\u30B5\u30FC",
    en: "pictomancer",
    fr: "pictomancien",
    cn: "Pictomancer", // todo: translate
  },
  role: Role.Caster,
  abilities,
  traits,
};
