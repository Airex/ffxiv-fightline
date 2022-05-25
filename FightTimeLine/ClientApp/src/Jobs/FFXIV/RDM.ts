import Effects from "src/core/Effects";
import { IJob, Role, AbilityType, DamageType, MapStatuses, IJobTemplate, ITrait } from "../../core/Models";
import { getAbilitiesFrom, casterSharedAbilities, medicine } from "./shared";
import { abilityTrait } from "./traits";

const statuses = MapStatuses({
  embolden: {
    duration: 20
  },
  acceleration: {
    duration: 20
  },
  manafication: {
    duration: 15
  },
  magickBarrier: {
    duration: 10,
    effects: [Effects.mitigation.party(10, DamageType.Magical)]
  }
});

const abilities = [
  {
    name: "Embolden",
    translation: {
      de: "Ermutigen",
      jp: "\u30A8\u30F3\u30DC\u30EB\u30C7\u30F3",
      en: "Embolden",
      fr: "Enhardissement"
    },
    cooldown: 120,
    xivDbId: "7520",
    statuses: [statuses.embolden],
    abilityType: AbilityType.PartyDamageBuff,
    levelAcquired: 60
  },
  {
    name: "Fleche",
    translation: {
      de: "Fleche",
      jp: "\u30D5\u30EC\u30C3\u30B7\u30E5",
      en: "Fleche",
      fr: "Fl\u00E8che"
    },
    cooldown: 25,
    xivDbId: "7517",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 45
  },
  {
    name: "Contre Sixte",
    translation: {
      de: "Contre Sixte",
      jp: "\u30B3\u30F3\u30C8\u30EB\u30B7\u30AF\u30B9\u30C8",
      en: "Contre Sixte",
      fr: "Contre de sixte"
    },
    cooldown: 45,
    xivDbId: "7519",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 56
  },
  {
    name: "Manafication",
    translation: {
      de: "Manafizierung",
      jp: "\u30DE\u30CA\u30D5\u30A3\u30B1\u30FC\u30B7\u30E7\u30F3",
      en: "Manafication",
      fr: "Manafication"
    },
    cooldown: 120,
    xivDbId: "7521",
    requiresBossTarget: true,
    statuses: [statuses.manafication],
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 60
  },
  {
    name: "Acceleration",
    translation: {
      de: "Pr\u00E4paration",
      jp: "\u30A2\u30AF\u30BB\u30E9\u30EC\u30FC\u30B7\u30E7\u30F3",
      en: "Acceleration",
      fr: "Acc\u00E9l\u00E9ration"
    },
    cooldown: 55,
    xivDbId: "7518",
    requiresBossTarget: false,
    statuses: [statuses.acceleration],
    abilityType: AbilityType.Utility,
    levelAcquired: 50
  },
  {
    name: "Magick Barrier",
    translation: {
      de: "Magiebarriere",
      jp: "\u30D0\u30DE\u30B8\u30AF",
      en: "Magick Barrier",
      fr: "Barri\u00E8re anti-magie"
    },
    cooldown: 120,
    requiresBossTarget: false,
    xivDbId: 25857,
    abilityType: AbilityType.PartyDefense,
    statuses: [statuses.magickBarrier],
    levelAcquired: 86
  },
  ...getAbilitiesFrom(casterSharedAbilities),
  medicine.Intelligence
];

const traits: ITrait[] = [
  {
    name: "Red Magic Mastery",
    level: 74,
    apply: abilityTrait("Contre Sixte", ab => {
      ab.cooldown = 35;
    })
  },
  {
    name: "Enhanced Manafication",
    level: 74,
    apply: abilityTrait("Manafication", ab => {
      ab.cooldown = 110;
    })
  },
  {
    name: "Enhanced Acceleration",
    level: 78,
    apply: abilityTrait("Acceleration", ab => {
      ab.charges = {
        count: 2,
        cooldown: 55
      };
    })
  }
];

export const RDM: IJobTemplate = {
  translation: {
    de: "RMA",
    jp: "RDM",
    en: "RDM",
    fr: "MRG"
  },
  fullNameTranslation: {
    de: "Rotmagier",
    jp: "\u8D64\u9B54\u9053\u58EB",
    en: "Red Mage",
    fr: "mage rouge"
  },
  role: Role.Caster,
  abilities,
  traits
};


