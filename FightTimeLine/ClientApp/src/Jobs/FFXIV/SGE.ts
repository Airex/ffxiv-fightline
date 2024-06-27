import Effects from "src/core/Defensives/effects";
import {
  AbilityType,
  IAbility,
  IAbilityStatus,
  IJob,
  IJobTemplate,
  ITrait,
  MapStatuses,
  Role,
  settings,
} from "../../core/Models";
import {
  getAbilitiesFrom,
  medicine,
  healerSharedAbilities,
  healerSharedTraits,
} from "./shared";
import { abilityTrait, updateCooldown } from "./traits";
import { AllowOverlapStrategy } from "src/core/Overlap";

const statuses = MapStatuses({
  physisII: {
    duration: 10,
    Effects: [Effects.healingIncrease.solo(10)],
  },
  ediag: {
    duration: 30,
    effects: [Effects.shieldFromHeal.solo(180)],
    shareGroup: "sge",
  },
  eprog: {
    duration: 30,
    effects: [Effects.shieldFromHeal.party(320)],
    shareGroup: "sge",
  },
  soteria: {
    duration: 15,
    effects: [Effects.healingIncrease.solo(10)],
  },
  kerachole: {
    duration: 15,
    shareGroup: "hole",
    effects: [Effects.mitigation.party(10)],
  },
  zoe: {
    duration: 30,
    // todo: specify the effect
  },
  taurochole: {
    duration: 15,
    shareGroup: "hole",
    effects: [Effects.mitigation.solo(10)],
  },
  haima: {
    duration: 15,
    effects: [Effects.shieldFromHeal.solo(100)],
  },
  holos: {
    duration: 20,
    effects: [Effects.mitigation.party(10)],
  },
  holosShield: {
    duration: 30,
    potency: 300,
    effects: [Effects.shieldFromHeal.party(100)],
  },
  panhaima: {
    potency: 500,
    duration: 15,
    effects: [Effects.shieldFromHeal.party(200)], // todo: review this value
  },
  krasis: {
    duration: 10,
    effects: [Effects.healingIncrease.solo(20)],
  },
});

const abilities = [
  {
    name: "Kardia",
    translation: {
      de: "Kardia",
      ja: "\u30AB\u30EB\u30C7\u30A3\u30A2",
      en: "Kardia",
      fr: "Kardia",
      cn: "心关",
    },
    cooldown: 5,
    xivDbId: 24285,
    levelAcquired: 4,
    abilityType: AbilityType.Utility,
    settings: [settings.target],
  },
  {
    name: "Physis II",
    translation: {
      de: "Physis II",
      ja: "\u30D4\u30E5\u30B7\u30B9II",
      en: "Physis II",
      fr: "Physis II",
      cn: "自生II",
    },
    cooldown: 60,
    xivDbId: 24302,
    levelAcquired: 60,
    statuses: [statuses.physisII],
    abilityType: AbilityType.PartyHealing | AbilityType.PartyHealingBuff,
  },

  {
    name: "Eukrasian Diagnosis",
    translation: {
      de: "Eukratische Diagnose",
      ja: "エウクラシア・ディアグノシス",
      en: "Eukrasian Diagnosis",
      fr: "Diagnosis eucrasique",
      cn: "均衡诊断",
    },
    cooldown: 30,
    xivDbId: 24291,
    overlapStrategy: new AllowOverlapStrategy(),
    levelAcquired: 30,
    potency: 300,
    statuses: [statuses.ediag],
    abilityType: AbilityType.SelfShield,
  },
  {
    name: "Eukrasian Prognosis",
    translation: {
      de: "Eukratische Prognose",
      ja: "エウクラシア・プログノシス",
      en: "Eukrasian Prognosis",
      fr: "Prognosis eucrasique",
      cn: "均衡预后",
    },
    cooldown: 30,
    overlapStrategy: new AllowOverlapStrategy(),
    levelAcquired: 30,
    potency: 100,
    xivDbId: 24292,
    statuses: [statuses.eprog],
    abilityType: AbilityType.PartyShield,
    levelRemoved: 96
  },

  {
    name: "Eukrasian Prognosis II",
    translation: {
      de: "Eukratische Prognose II",
      ja: "エウクラシア・プログノシスII",
      en: "Eukrasian Prognosis II",
      fr: "Prognosis eucrasique II",
      cn: "均衡预后II",
    },
    cooldown: 30,
    overlapStrategy: new AllowOverlapStrategy(),
    levelAcquired: 30,
    potency: 100,
    xivDbId: 24292,
    statuses: [statuses.eprog],
    abilityType: AbilityType.PartyShield,
  },

  {
    name: "Soteria",
    translation: {
      de: "Soteria",
      ja: "\u30BD\u30FC\u30C6\u30EA\u30A2",
      en: "Soteria",
      fr: "Soteria",
      cn: "拯救",
    },
    cooldown: 90,
    xivDbId: 24294,
    levelAcquired: 35,
    statuses: [statuses.soteria],
    abilityType: AbilityType.HealingBuff,
  },
  {
    name: "Icarus",
    translation: {
      de: "Ikarus",
      ja: "\u30A4\u30AB\u30ED\u30B9",
      en: "Icarus",
      fr: "Ikaros",
      cn: "神翼",
    },
    xivDbId: 24295,
    levelAcquired: 40,
    cooldown: 45,
    abilityType: AbilityType.Utility,
  },
  {
    name: "Druochole",
    translation: {
      de: "Druochole",
      ja: "\u30C9\u30EB\u30AA\u30B3\u30EC",
      en: "Druochole",
      fr: "Druochole",
      cn: "灵橡清汁",
    },
    cooldown: 1,
    xivDbId: 24296,
    levelAcquired: 45,
    abilityType: AbilityType.Healing,
  },
  {
    name: "Kerachole",
    translation: {
      de: "Kerachole",
      ja: "\u30B1\u30FC\u30E9\u30B3\u30EC",
      en: "Kerachole",
      fr: "Kerachole",
      cn: "坚角清汁",
    },
    cooldown: 30,
    xivDbId: 24298,
    levelAcquired: 50,
    statuses: [statuses.kerachole],
    abilityType: AbilityType.PartyDefense,
  },
  {
    name: "Ixochole",
    translation: {
      de: "Ixochole",
      ja: "\u30A4\u30C3\u30AF\u30BD\u30B3\u30EC",
      en: "Ixochole",
      fr: "Ixochole",
      cn: "寄生清汁",
    },
    cooldown: 30,
    xivDbId: 24299,
    levelAcquired: 52,
    abilityType: AbilityType.PartyHealing,
  },
  {
    name: "Zoe",
    translation: {
      de: "Zoe",
      ja: "\u30BE\u30FC\u30A8",
      en: "Zoe",
      fr: "Zoe",
      cn: "活化",
    },
    cooldown: 120,
    xivDbId: 24300,
    levelAcquired: 56,
    statuses: [statuses.zoe],
    abilityType: AbilityType.HealingBuff,
  },
  {
    name: "Pepsis",
    translation: {
      de: "Pepsis",
      ja: "\u30DA\u30D7\u30B7\u30B9",
      en: "Pepsis",
      fr: "Pepsis",
      cn: "消化",
    },
    cooldown: 30,
    xivDbId: 24301,
    levelAcquired: 58,
    abilityType: AbilityType.PartyHealing,
  },
  {
    name: "Taurochole",
    translation: {
      de: "Taurochole",
      ja: "\u30BF\u30A6\u30ED\u30B3\u30EC",
      en: "Taurochole",
      fr: "Taurochole",
      cn: "白牛清汁",
    },
    cooldown: 45,
    xivDbId: 24303,
    levelAcquired: 62,
    statuses: [statuses.taurochole],
    settings: [settings.target],
    abilityType: AbilityType.Healing | AbilityType.TargetDefense,
  },
  {
    name: "Haima",
    translation: {
      de: "Haima",
      ja: "\u30CF\u30A4\u30DE",
      en: "Haima",
      fr: "Haima",
      cn: "输血",
    },
    cooldown: 120,
    xivDbId: 24305,
    levelAcquired: 62,
    potency: 300,
    settings: [settings.target],
    statuses: [statuses.haima],
    abilityType: AbilityType.SelfShield,
  },
  {
    name: "Rhizomata",
    translation: {
      de: "Rizomata",
      ja: "\u30EA\u30BE\u30FC\u30DE\u30BF",
      en: "Rhizomata",
      fr: "Rizomata",
      cn: "根素",
    },
    cooldown: 90,
    xivDbId: 24309,
    levelAcquired: 74,
    abilityType: AbilityType.Utility,
  },
  {
    name: "Holos",
    translation: {
      de: "Holos",
      ja: "\u30DB\u30FC\u30EA\u30BA\u30E0",
      en: "Holos",
      fr: "Holos",
      cn: "整体论",
    },
    cooldown: 120,
    xivDbId: 24310,
    levelAcquired: 76,
    statuses: [statuses.holos],
    abilityType: AbilityType.PartyDefense | AbilityType.PartyHealing,
  },
  {
    name: "Panhaima",
    translation: {
      de: "Panhaima",
      ja: "\u30D1\u30F3\u30CF\u30A4\u30DE",
      en: "Panhaima",
      fr: "Panhaima",
      cn: "泛输血",
    },
    cooldown: 120,
    xivDbId: 24311,
    potency: 200,
    levelAcquired: 80,
    statuses: [statuses.panhaima],
    abilityType: AbilityType.PartyShield,
  },
  {
    name: "Krasis",
    translation: {
      de: "Krasis",
      ja: "\u30AF\u30E9\u30FC\u30B7\u30B9",
      en: "Krasis",
      fr: "Krasis",
      cn: "混合",
    },
    cooldown: 60,
    xivDbId: 24317,
    levelAcquired: 80,
    statuses: [statuses.krasis],
    settings: [settings.target],
    abilityType: AbilityType.HealingBuff,
  },
  {
    name: "Pneuma",
    translation: {
      de: "Pneuma",
      ja: "\u30D7\u30CD\u30A6\u30DE",
      en: "Pneuma",
      fr: "Pneuma",
      cn: "魂灵风息",
    },
    cooldown: 120,
    xivDbId: 24318,
    levelAcquired: 90,
    abilityType: AbilityType.PartyHealing | AbilityType.Damage,
  },
  {
    name: "Psyche",
    translation: {
      de: "Psyche",
      ja: "\u30B5\u30A4\u30B1",
      en: "Psyche",
      fr: "Psyche",
      cn: "心灵",
    },
    cooldown: 60,
    xivDbId: 37033,
    levelAcquired: 92,
    abilityType: AbilityType.Damage,
  },
  {
    name: "Philosophia",
    translation: {
      de: "Philosophia",
      ja: "\u30D5\u30A3\u30ED\u30BD\u30D5\u30A3\u30A2",
      en: "Philosophia",
      fr: "Philosophia",
      cn: "哲学",
    },
    cooldown: 180,
    xivDbId: 37035,
    levelAcquired: 100,
    abilityType: AbilityType.HealingBuff,
  }
] as IAbility[];

const traits: ITrait[] = [
  {
    name: "Enhanced Zoe",
    level: 88,
    apply: abilityTrait("Zoe", updateCooldown(90)),
  },
  {
    name: "Enhanced Soteria",
    level: 94,
    apply: abilityTrait("Soteria", updateCooldown(60)),
  },
  {
    name: "Enhanced Physis II",
    level: 98,
    apply: abilityTrait("Physis II", (ab) => {
      ab.statuses = [
        {
          ...statuses.physisII,
          duration: 15,
        },
      ];
    }),
  },
  ...healerSharedTraits,
];
export const SGE: IJobTemplate = {
  translation: {
    de: "WEI",
    ja: "SGE",
    en: "SGE",
    fr: "SAG",
    cn: "SGE",
  },

  fullNameTranslation: {
    de: "Weiser",
    ja: "\u8CE2\u8005",
    en: "Sage",
    fr: "Sage",
    cn: "贤者",
  },
  role: Role.Healer,

  abilities: [
    ...abilities,
    ...getAbilitiesFrom(healerSharedAbilities),
    medicine.Mind,
  ],
  traits,
};
