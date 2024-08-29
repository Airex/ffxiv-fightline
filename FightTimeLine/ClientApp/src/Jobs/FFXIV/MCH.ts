import Effects from "../../core/Defensives/effects";
import {
  Role,
  AbilityType,
  MapStatuses,
  IJobTemplate,
  ITrait,
} from "../../core/Models";
import { withRangeSharedAbilities } from "./shared";
import { abilityTrait } from "./traits";

const statuses = MapStatuses({
  reassemble: {
    duration: 5,
  },
  wildfire: {
    duration: 10,
  },
  flamethrower: {
    duration: 10,
  },
  hypercharge: {
    duration: 8,
  },
  dismantle: {
    duration: 10,
    effects: [Effects.mitigation.party(10)],
  },
  tactician: {
    duration: 15,
    shareGroup: "rangeDef",
    effects: [Effects.mitigation.party(10)],
  },
});

const abilities = [
  {
    name: "Reassemble",
    translation: {
      de: "Justieren",
      ja: "\u6574\u5099",
      en: "Reassemble",
      fr: "R\u00E9assemblage",
      cn: "整备",
    },
    cooldown: 55,
    xivDbId: "2876",
    statuses: [statuses.reassemble],
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 10,
  },
  {
    name: "Gauss Round",
    translation: {
      de: "Gau\u00DF-Geschoss",
      ja: "\u30AC\u30A6\u30B9\u30E9\u30A6\u30F3\u30C9",
      en: "Gauss Round",
      fr: "D\u00E9charge Gauss",
      cn: "虹吸弹",
    },
    cooldown: 30,
    xivDbId: "2874",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    charges: {
      count: 3,
      cooldown: 30,
    },
    levelAcquired: 15,
    levelRemoved: 92,
  },
  {
    name: "Double Check",
    translation: {
      de: "Doppelschuss",
      ja: "\u30C0\u30D7\u30EB\u30C9\u30C1\u30A7\u30C3\u30AF",
      en: "Double Check",
      fr: "Double tir",
      cn: "双重射击",
    },
    cooldown: 30,
    xivDbId: "36979",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    charges: {
      count: 3,
      cooldown: 30,
    },
    levelAcquired: 92,
  },
  {
    name: "Wildfire",
    translation: {
      de: "Wildfeuer",
      ja: "\u30EF\u30A4\u30EB\u30C9\u30D5\u30A1\u30A4\u30A2",
      en: "Wildfire",
      fr: "Flamb\u00E9e",
      cn: "野火",
    },
    cooldown: 120,
    xivDbId: "2878",
    statuses: [statuses.wildfire],
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 45,
  },
  {
    name: "Ricochet",
    translation: {
      de: "Rikoschettschuss",
      ja: "\u30EA\u30B3\u30B7\u30A7\u30C3\u30C8",
      en: "Ricochet",
      fr: "Ricochet",
      cn: "弹射",
    },
    cooldown: 30,
    xivDbId: "2890",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    charges: {
      count: 3,
      cooldown: 30,
    },
    levelAcquired: 50,
    levelRemoved: 92,
  },
  {
    name: "Checkmate",
    translation: {
      de: "Schachmatt",
      ja: "\u30C1\u30A7\u30C3\u30AF\u30E1\u30FC\u30C8",
      en: "Checkmate",
      fr: "Mat",
      cn: "绝杀",
    },
    cooldown: 30,
    xivDbId: "36980",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    charges: {
      count: 3,
      cooldown: 30,
    },
    levelAcquired: 92,
  },
  {
    name: "Flamethrower",
    translation: {
      de: "Flammenwerfer",
      ja: "\u30D5\u30EC\u30A4\u30E0\u30B9\u30ED\u30A2\u30FC",
      en: "Flamethrower",
      fr: "Lance-flammes",
      cn: "火焰喷射器",
    },
    cooldown: 60,
    xivDbId: "7418",
    statuses: [statuses.flamethrower],
    abilityType: AbilityType.Damage,
    levelAcquired: 70,
  },
  {
    name: "Hypercharge",
    translation: {
      de: "Hyperladung",
      ja: "\u30CF\u30A4\u30D1\u30FC\u30C1\u30E3\u30FC\u30B8",
      en: "Hypercharge",
      fr: "Hypercharge",
      cn: "超荷",
    },
    cooldown: 10,
    statuses: [statuses.hypercharge],
    xivDbId: "17209",
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 30,
  },
  {
    name: "Tactician",
    translation: {
      de: "Taktiker",
      ja: "\u30BF\u30AF\u30C6\u30A3\u30B7\u30E3\u30F3",
      en: "Tactician",
      fr: "Tacticien",
      cn: "策动",
    },
    cooldown: 120,
    xivDbId: "16889",
    statuses: [statuses.tactician],
    abilityType: AbilityType.PartyDefense,
    levelAcquired: 56,
  },
  {
    name: "Dismantle",
    translation: {
      de: "Zerlegen",
      ja: "\u30A6\u30A7\u30DD\u30F3\u30D6\u30EC\u30A4\u30AF",
      en: "Dismantle",
      fr: "Brise-arme",
      cn: "武装解除",
    },
    cooldown: 120,
    xivDbId: "2887",
    statuses: [statuses.dismantle],
    abilityType: AbilityType.PartyDefense,
    levelAcquired: 62,
  },
  {
    name: "Barrel Stabilizer",
    translation: {
      de: "Laufstabilisator",
      ja: "\u30D0\u30EC\u30EB\u30D2\u30FC\u30BF\u30FC",
      en: "Barrel Stabilizer",
      fr: "Stabilisateur de canon",
      cn: "枪管加热",
    },
    cooldown: 120,
    xivDbId: "7414",
    requiresBossTarget: true,
    abilityType: AbilityType.Utility,
    levelAcquired: 66,
  },
];

const traits = [
  {
    name: "Enhanced Reassemble",
    level: 84,
    apply: abilityTrait("Reassemble", (ab) => {
      ab.charges = {
        cooldown: 55,
        count: 2,
      };
    }),
  },
  {
    level: 88,
    name: "Enhanced Tactician",
    apply: abilityTrait("Tactician", (ab) => (ab.cooldown = 90)),
  },
  {
    level: 98,
    name: "Enhanced Tactician 2",
    apply: abilityTrait("Tactician", (ab) => {
      ab.statuses = [
        {
          ...statuses.tactician,
          effects: [Effects.mitigation.party(15)],
        },
      ];
    }),
  },
] as ITrait[];

export const MCH: IJobTemplate = withRangeSharedAbilities({
  translation: {
    de: "MCH",
    ja: "MCH",
    en: "MCH",
    fr: "MCH",
    cn: "MCH",
  },

  fullNameTranslation: {
    de: "Maschinist",
    ja: "\u6A5F\u5DE5\u58EB",
    en: "Machinist",
    fr: "Machiniste",
    cn: "机工士",
  },
  role: Role.Range,
  abilities,
  traits,
});
