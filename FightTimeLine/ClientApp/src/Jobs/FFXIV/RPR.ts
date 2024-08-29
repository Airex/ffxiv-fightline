import Effects from "../../core/Defensives/effects";
import {
  Role,
  AbilityType,
  IAbility,
  MapStatuses,
  IJobTemplate,
  ITrait,
} from "../../core/Models";
import { withStrengthMeleeSharedAbilities } from "./shared";

const statuses = MapStatuses({
  hellsIngress: {
    duration: 20,
  },
  hellsEgress: {
    duration: 20,
  },
  arcaneCrest: {
    duration: 5,
    effects: [Effects.shield.party(10)],
  },
  arcaneCircle: {
    duration: 20,
  },
  enshroud: {
    duration: 30,
  },
});

const abilities: IAbility[] = [
  {
    name: "Arcane Crest",
    translation: {
      de: "Arkanes Wappen",
      ja: "\u30A2\u30EB\u30B1\u30A4\u30F3\u30AF\u30EC\u30B9\u30C8",
      en: "Arcane Crest",
      fr: "Blason arcanique",
      cn: "神秘纹",
    },
    cooldown: 30,
    statuses: [statuses.arcaneCrest],
    xivDbId: 24404,
    abilityType: AbilityType.PartyShield,
    levelAcquired: 40,
  },
  {
    name: "Blood Stalk",
    translation: {
      de: "Knochengarbe",
      ja: "\u30B9\u30C8\u30FC\u30AF\u30B9\u30A6\u30A7\u30FC\u30BA",
      en: "Blood Stalk",
      fr: "F\u00E9tu ensanglant\u00E9",
      cn: "隐匿挥割",
    },
    cooldown: 1,
    xivDbId: 24389,
    abilityType: AbilityType.Damage,
    levelAcquired: 50,
  },
  {
    name: "Grim Swathe",
    translation: {
      de: "Nachtschwad",
      ja: "\u30B7\u30FC\u30D5\u30B9\u30A6\u30A7\u30FC\u30BA",
      en: "Grim Swathe",
      fr: "Andain sinistre",
      cn: "束缚挥割",
    },
    cooldown: 1,
    xivDbId: 24392,
    abilityType: AbilityType.Damage,
    levelAcquired: 50,
  },
  {
    name: "Unveiled Gibbet",
    translation: {
      de: "Richtergriff",
      ja: "\u30B8\u30D3\u30C8\u30A5\u30AF\u30ED\u30A6",
      en: "Unveiled Gibbet",
      fr: "Gibet suppliciant",
      cn: "绞决爪",
    },
    xivDbId: 24390,
    cooldown: 1,
    abilityType: AbilityType.Damage,
    levelAcquired: 70,
  },
  {
    name: "Unveiled Gallows",
    translation: {
      de: "Galgengriff",
      ja: "\u30AE\u30E3\u30ED\u30A6\u30BA\u30AF\u30ED\u30A6",
      en: "Unveiled Gallows",
      fr: "Potence suppliciante",
      cn: "缢杀爪",
    },
    cooldown: 1,
    xivDbId: 24391,
    abilityType: AbilityType.Damage,
    levelAcquired: 70,
  },
  {
    name: "Arcane Circle",
    translation: {
      de: "Arkaner Kreis",
      ja: "\u30A2\u30EB\u30B1\u30A4\u30F3\u30B5\u30FC\u30AF\u30EB",
      en: "Arcane Circle",
      fr: "Cercle arcanique",
      cn: "神秘环",
    },
    cooldown: 120,
    xivDbId: 24405,
    statuses: [statuses.arcaneCircle],
    abilityType: AbilityType.PartyDamageBuff,
    levelAcquired: 72,
  },
  {
    name: "Gluttony",
    translation: {
      de: "V\u00F6llerei",
      ja: "\u30B0\u30E9\u30C8\u30CB\u30FC",
      en: "Gluttony",
      fr: "Gloutonnerie",
      cn: "暴食",
    },
    cooldown: 60,
    xivDbId: 24393,
    abilityType: AbilityType.Damage,
    levelAcquired: 70,
  },
  {
    name: "Sacrificium",
    translation: {
      de: "Sacrificium",
      ja: "\u30B5\u30AF\u30EA\u30D5\u30A3\u30AD\u30A6\u30E0",
      en: "Sacrificium",
      fr: "Sacrificium",
      cn: "牺牲",
    },
    cooldown: 1,
    xivDbId: 36969,
    abilityType: AbilityType.Damage,
    requiresBossTarget: true,
    levelAcquired: 92,
  },
  {
    name: "Enshroud",
    translation: {
      de: "Lemurenschleier",
      ja: "\u30EC\u30E0\u30FC\u30EB\u30B7\u30E5\u30E9\u30A6\u30C9",
      en: "Enshroud",
      fr: "Linceul du l\u00E9mure",
      cn: "夜游魂衣",
    },
    cooldown: 30,
    xivDbId: 24394,
    statuses: [statuses.enshroud],
    abilityType: AbilityType.Damage,
    levelAcquired: 70,
  },
  {
    name: "Lemure's Slice",
    translation: {
      de: "Lemurenschlitzer",
      ja: "\u30EC\u30E0\u30FC\u30EB\u30B9\u30E9\u30A4\u30B9",
      en: "Lemure\u0027s Slice",
      fr: "Tranchage du l\u00E9mure",
      cn: "夜游魂切割",
    },
    cooldown: 1,
    xivDbId: 24399,
    abilityType: AbilityType.Damage,
    levelAcquired: 70,
  },
  {
    name: "Lemure's Scythe",
    translation: {
      de: "Lemurensense",
      ja: "\u30EC\u30E0\u30FC\u30EB\u30B5\u30A4\u30BA",
      en: "Lemure\u0027s Scythe",
      fr: "Faux du l\u00E9mure",
      cn: "夜游魂钐割",
    },
    xivDbId: 24400,
    cooldown: 1,
    abilityType: AbilityType.Damage,
    levelAcquired: 70,
  },
];

const traits: ITrait[] = [];

export const RPR: IJobTemplate = withStrengthMeleeSharedAbilities({
  translation: {
    de: "SNT",
    ja: "RPR",
    en: "RPR",
    fr: "FCH",
    cn: "RPR",
  },

  fullNameTranslation: {
    de: "Schnitter",
    ja: "\u30EA\u30FC\u30D1\u30FC",
    en: "Reaper",
    fr: "Faucheur",
    cn: "钐镰客",
  },
  role: Role.Melee,
  abilities,
  traits,
});
