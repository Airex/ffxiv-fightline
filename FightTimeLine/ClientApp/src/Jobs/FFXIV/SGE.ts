import Effects from "src/core/Effects";
import { AbilityType, IAbility, IJob, IJobTemplate, ITrait, MapStatuses, Role, settings } from "../../core/Models";
import { getAbilitiesFrom, medicine, healerSharedAbilities } from "./shared";
import { abilityTrait } from "./traits";

const statuses = MapStatuses({
  physisII: {
    duration: 15
  },
  soteria: {
    duration: 15
  },
  kerachole: {
    duration: 15,
    effects: [Effects.mitigation.party(10)]
  },
  zoe: {
    duration: 30
  },
  taurochole: {
    duration: 15
  },
  haima: {
    duration: 15,
    effects: [Effects.shield.party(10)]        // todo: review this value
  },
  holos: {
    duration: 20,
    effects: [Effects.mitigation.party(10)]        // todo: review this value
  },
  panhaima: {
    duration: 15,
    effects: [Effects.mitigation.party(10)]        // todo: review this value
  },
  krasis: {
    duration: 10
  }
});


const abilities = [
  {
    name: "Kardia",
    translation: {
      de: "Kardia",
      ja: "\u30AB\u30EB\u30C7\u30A3\u30A2",
      en: "Kardia",
      fr: "Kardia"
    },
    cooldown: 5,
    xivDbId: 24285,
    abilityType: AbilityType.Utility,
    settings: [settings.target],
  },
  {
    name: "Physis II",
    translation: {
      de: "Physis II",
      ja: "\u30D4\u30E5\u30B7\u30B9II",
      en: "Physis II",
      fr: "Physis II"
    },
    cooldown: 60,
    xivDbId: 24302,
    statuses: [statuses.physisII],
    abilityType: AbilityType.Healing,
  },
  {
    name: "Soteria",
    translation: {
      de: "Soteria",
      ja: "\u30BD\u30FC\u30C6\u30EA\u30A2",
      en: "Soteria",
      fr: "Soteria"
    },
    cooldown: 90,
    xivDbId: 24294,
    statuses: [statuses.soteria],
    abilityType: AbilityType.HealingBuff,
  },
  {
    name: "Icarus",
    translation: {
      de: "Ikarus",
      ja: "\u30A4\u30AB\u30ED\u30B9",
      en: "Icarus",
      fr: "Ikaros"
    },
    xivDbId: 24295,
    cooldown: 45,
    abilityType: AbilityType.Utility,
  },
  {
    name: "Druochole",
    translation: {
      de: "Druochole",
      ja: "\u30C9\u30EB\u30AA\u30B3\u30EC",
      en: "Druochole",
      fr: "Druochole"
    },
    cooldown: 1,
    xivDbId: 24296,
    abilityType: AbilityType.Healing,
  },
  {
    name: "Kerachole",
    translation: {
      de: "Kerachole",
      ja: "\u30B1\u30FC\u30E9\u30B3\u30EC",
      en: "Kerachole",
      fr: "Kerachole"
    },
    cooldown: 30,
    xivDbId: 24298,
    levelAcquired: 50,
    statuses: [statuses.kerachole],
    abilityType: AbilityType.PartyDefense
  },
  {
    name: "Ixochole",
    translation: {
      de: "Ixochole",
      ja: "\u30A4\u30C3\u30AF\u30BD\u30B3\u30EC",
      en: "Ixochole",
      fr: "Ixochole"
    },
    cooldown: 30,
    xivDbId: 24299,
    levelAcquired: 52,
    abilityType: AbilityType.Healing,
  },
  {
    name: "Zoe",
    translation: {
      de: "Zoe",
      ja: "\u30BE\u30FC\u30A8",
      en: "Zoe",
      fr: "Zoe"
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
      fr: "Pepsis"
    },
    cooldown: 30,
    xivDbId: 24301,
    levelAcquired: 58,
    abilityType: AbilityType.Healing,
  },
  {
    name: "Taurochole",
    translation: {
      de: "Taurochole",
      ja: "\u30BF\u30A6\u30ED\u30B3\u30EC",
      en: "Taurochole",
      fr: "Taurochole"
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
      fr: "Haima"
    },
    cooldown: 120,
    xivDbId: 24305,
    levelAcquired: 62,
    settings: [settings.target],
    statuses: [statuses.haima],
    abilityType: AbilityType.SelfShield | AbilityType.PartyShield
  },
  {
    name: "Rhizomata",
    translation: {
      de: "Rizomata",
      ja: "\u30EA\u30BE\u30FC\u30DE\u30BF",
      en: "Rhizomata",
      fr: "Rizomata"
    },
    cooldown: 90,
    xivDbId: 24309,
    levelAcquired: 74,
    abilityType: AbilityType.Utility
  },
  {
    name: "Holos",
    translation: {
      de: "Holos",
      ja: "\u30DB\u30FC\u30EA\u30BA\u30E0",
      en: "Holos",
      fr: "Holos"
    },
    cooldown: 120,
    xivDbId: 24310,
    levelAcquired: 76,
    statuses: [statuses.holos],
    abilityType: AbilityType.PartyDefense | AbilityType.Healing,
  },
  {
    name: "Panhaima",
    translation: {
      de: "Panhaima",
      ja: "\u30D1\u30F3\u30CF\u30A4\u30DE",
      en: "Panhaima",
      fr: "Panhaima"
    },
    cooldown: 120,
    xivDbId: 24311,
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
      fr: "Krasis"
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
      fr: "Pneuma"
    },
    cooldown: 120,
    xivDbId: 24318,
    levelAcquired: 90,
    abilityType: AbilityType.Healing | AbilityType.Damage,
  }

] as IAbility[];

const traits: ITrait[] = [
  {
    name: "Enhanced Zoe",
    level: 88,
    apply: abilityTrait("Zoe", { cooldown: 90 })
  }
];
export const SGE: IJobTemplate = {

  translation: {
    de: "WEI",
    ja: "SGE",
    en: "SGE",
    fr: "SAG"
  },

  fullNameTranslation: {
    de: "Weiser",
    ja: "\u8CE2\u8005",
    en: "Sage",
    fr: "Sage"
  },
  role: Role.Healer,

  abilities: [
    ...abilities,
    ...getAbilitiesFrom(healerSharedAbilities),
    medicine.Mind
  ],
  traits
};


