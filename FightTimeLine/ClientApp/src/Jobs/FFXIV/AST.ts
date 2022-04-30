import Effects from "src/core/Effects";
import { IJob, Role, AbilityType, IAbility, MapStatuses, settings } from "../../core/Models";
import { getAbilitiesFrom, healerSharedAbilities, medicine } from "./shared";

const statuses = MapStatuses({
  lightSpeed: {
    duration: 15
  },
  synastry: {
    duration: 20
  },
  divination: {
    duration: 15
  },
  astrodyne: {
    duration: 15
  },
  collectiveUnconscious: {
    duration: 18
  },
  celestialOpposition: {
    duration: 15
  },
  earthlyStar: {
    duration: 20
  },
  horoscope: {
    duration: 30
  },
  neutralSect: {
    duration: 20
  },
  exaltation: {
    duration: 8,
    effects: [Effects.mitigation.solo(10)]
  },
  macrocosmos: {
    duration: 15
  }
});

const abilities = [
  {
    name: "Lightspeed",
    translation: {
      de: "Lichtgeschwindigkeit",
      jp: "\u30E9\u30A4\u30C8\u30B9\u30D4\u30FC\u30C9",
      en: "Lightspeed",
      fr: "Vitesse de la lumi\u00E8re"
    },
    cooldown: 90,
    xivDbId: "3606",
    statuses: [statuses.lightSpeed],
    abilityType: AbilityType.Utility,
    levelAcquired: 6
  },
  {
    name: "Essential Dignity",
    translation: {
      de: "Essenzielle W\u00FCrde",
      jp: "\u30C7\u30A3\u30B0\u30CB\u30C6\u30A3",
      en: "Essential Dignity",
      fr: "Dignit\u00E9 essentielle"
    },
    cooldown: 40,
    xivDbId: 3614,
    abilityType: AbilityType.Healing,
    settings: [settings.target],
    charges: {
      count: 2,
      cooldown: 40
    },
    levelAcquired: 15
  },
  {
    name: "Synastry",
    translation: {
      de: "Synastrie",
      jp: "\u30B7\u30CA\u30B9\u30C8\u30EA\u30FC",
      en: "Synastry",
      fr: "Synastrie"
    },
    cooldown: 120,
    xivDbId: "3612",
    statuses: [statuses.synastry],
    abilityType: AbilityType.Healing,
    settings: [settings.target],
    levelAcquired: 50
  },
  {
    name: "Divination",
    translation: {
      de: "Weissagung",
      jp: "\u30C7\u30A3\u30F4\u30A3\u30CD\u30FC\u30B7\u30E7\u30F3",
      en: "Divination",
      fr: "Divination"
    },
    cooldown: 120,
    xivDbId: "16552",
    statuses: [statuses.divination],
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 50
  },
  {
    name: "Astrodyne",
    translation: {
      de: "Astrodyne",
      jp: "\u30A2\u30B9\u30C8\u30ED\u30C0\u30A4\u30F3",
      en: "Astrodyne",
      fr: "Astrodynamie"
    },
    cooldown: 30,
    xivDbId: "25870",
    statuses: [statuses.astrodyne],
    abilityType: AbilityType.Utility | AbilityType.SelfDamageBuff,
    levelAcquired: 50
  },
  {
    name: "Collective Unconscious",
    translation: {
      de: "Numinosum",
      jp: "\u904B\u547D\u306E\u8F2A",
      en: "Collective Unconscious",
      fr: "Inconscient collectif"
    },
    cooldown: 60,
    xivDbId: "3613",
    statuses: [statuses.collectiveUnconscious],
    abilityType: AbilityType.PartyDefense,
    defensiveStats: {
      mitigationPercent: 10
    },
    levelAcquired: 58
  },
  {
    name: "Celestial Opposition",
    translation: {
      de: "Opposition",
      jp: "\u661F\u5929\u5BFE\u6297",
      en: "Celestial Opposition",
      fr: "Opposition c\u00E9leste"
    },
    cooldown: 60,
    xivDbId: "16553",
    statuses: [statuses.celestialOpposition],
    abilityType: AbilityType.Healing,
    levelAcquired: 60
  },
  {
    name: "Earthly Star",
    translation: {
      de: "Irdischer Stern",
      jp: "\u30A2\u30FC\u30B5\u30EA\u30FC\u30B9\u30BF\u30FC",
      en: "Earthly Star",
      fr: "\u00C9toile terrestre"
    },
    cooldown: 60,
    xivDbId: "7439",
    statuses: [statuses.earthlyStar],
    abilityType: AbilityType.Healing,
    levelAcquired: 62
  },
  {
    name: "Minor Arcana",
    translation: {
      de: "Kleine Arkana",
      jp: "\u30DE\u30A4\u30CA\u30FC\u30A2\u30EB\u30AB\u30CA",
      en: "Minor Arcana",
      fr: "Arcane mineur"
    },
    cooldown: 60,
    xivDbId: "7443",
    requiresBossTarget: true,
    abilityType: AbilityType.Utility,
    levelAcquired: 70
  } as IAbility,
  {
    name: "Celestial Intersection",
    translation: {
      de: "Kongruenz",
      jp: "\u661F\u5929\u4EA4\u5DEE",
      en: "Celestial Intersection",
      fr: "Rencontre c\u00E9leste"
    },
    cooldown: 30,
    xivDbId: "16556",
    abilityType: AbilityType.Healing | AbilityType.PartyShield,
    levelAcquired: 74,
    defensiveStats: {
      shieldPercent: 10 // todo: review this value
    },
    charges: {
      count: 2,
      cooldown: 30
    }
  } as IAbility,
  {
    name: "Horoscope",
    translation: {
      de: "Horoskop",
      jp: "\u30DB\u30ED\u30B9\u30B3\u30FC\u30D7",
      en: "Horoscope",
      fr: "Horoscope"
    },
    cooldown: 60,
    xivDbId: "16557",
    statuses: [statuses.horoscope],
    abilityType: AbilityType.Healing,
    levelAcquired: 76
  },
  {
    name: "Neutral Sect",
    translation: {
      de: "Neutral",
      jp: "\u30CB\u30E5\u30FC\u30C8\u30E9\u30EB\u30BB\u30AF\u30C8",
      en: "Neutral Sect",
      fr: "Adepte de la neutralit\u00E9"
    },
    cooldown: 120,
    xivDbId: "16559",
    statuses: [statuses.neutralSect],
    abilityType: AbilityType.HealingBuff,
    levelAcquired: 80
  },
  {
    name: "Exaltation",
    translation: {
      de: "Exaltation",
      jp: "\u30A8\u30AF\u30B6\u30EB\u30C6\u30FC\u30B7\u30E7\u30F3",
      en: "Exaltation",
      fr: "Exaltation"
    },
    cooldown: 60,
    xivDbId: "25873",
    abilityType: AbilityType.SelfDefense | AbilityType.TargetDefense,
    levelAcquired: 86,
    settings: [settings.target],
    statuses: [statuses.exaltation]
  } as IAbility,
  {
    name: "Macrocosmos",
    translation: {
      de: "Makrokosmos",
      jp: "\u30DE\u30AF\u30ED\u30B3\u30B9\u30E2\u30B9",
      en: "Macrocosmos",
      fr: "Macrocosme"
    },
    cooldown: 180,
    xivDbId: 25874,
    abilityType: AbilityType.Healing | AbilityType.Damage,
    levelAcquired: 90,
    statuses: [statuses.macrocosmos]
  } as IAbility,
  ...getAbilitiesFrom(healerSharedAbilities),
  medicine.Mind
] as IAbility[];
export const AST: IJob = {
  name: "AST",
  translation: {
    de: "AST",
    jp: "AST",
    en: "AST",
    fr: "AST"
  },
  fullName: "Astrologian",
  fullNameTranslation: {
    de: "Astrologe",
    jp: "\u5360\u661F\u8853\u5E2B",
    en: "Astrologian",
    fr: "Astromancien"
  },
  role: Role.Healer,
  abilities
};


