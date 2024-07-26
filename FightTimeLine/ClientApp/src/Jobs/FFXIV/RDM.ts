import Effects from "src/core/Defensives/effects";
import {
  IJob,
  Role,
  AbilityType,
  DamageType,
  MapStatuses,
  IJobTemplate,
  ITrait,
  IAbility,
} from "../../core/Models";
import {
  getAbilitiesFrom,
  casterSharedAbilities,
  medicine,
  casterSharedTraits,
} from "./shared";
import { abilityTrait, updateCooldown } from "./traits";

const statuses = MapStatuses({
  embolden: {
    duration: 20,
  },
  acceleration: {
    duration: 20,
  },
  manafication: {
    duration: 30,
  },
  magicBarrier: {
    duration: 10,
    effects: [Effects.mitigation.party(10, DamageType.Magical)],
  },
});

const abilities: IAbility[] = [
  {
    name: "Embolden",
    translation: {
      de: "Ermutigen",
      ja: "\u30A8\u30F3\u30DC\u30EB\u30C7\u30F3",
      en: "Embolden",
      fr: "Enhardissement",
      cn: "鼓励",
    },
    cooldown: 120,
    xivDbId: "7520",
    statuses: [statuses.embolden],
    abilityType: AbilityType.PartyDamageBuff,
    levelAcquired: 60,
  },
  {
    name: "Fleche",
    translation: {
      de: "Fleche",
      ja: "\u30D5\u30EC\u30C3\u30B7\u30E5",
      en: "Fleche",
      fr: "Fl\u00E8che",
      cn: "飞刺",
    },
    cooldown: 25,
    xivDbId: "7517",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 45,
  },
  {
    name: "Contre Sixte",
    translation: {
      de: "Contre Sixte",
      ja: "\u30B3\u30F3\u30C8\u30EB\u30B7\u30AF\u30B9\u30C8",
      en: "Contre Sixte",
      fr: "Contre de sixte",
      cn: "六分反击",
    },
    cooldown: 45,
    xivDbId: "7519",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 56,
  },
  {
    name: "Manafication",
    translation: {
      de: "Manafizierung",
      ja: "\u30DE\u30CA\u30D5\u30A3\u30B1\u30FC\u30B7\u30E7\u30F3",
      en: "Manafication",
      fr: "Manafication",
      cn: "魔元化",
    },
    cooldown: 120,
    xivDbId: "7521",
    requiresBossTarget: true,
    statuses: [statuses.manafication],
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 60,
  },
  {
    name: "Acceleration",
    translation: {
      de: "Pr\u00E4paration",
      ja: "\u30A2\u30AF\u30BB\u30E9\u30EC\u30FC\u30B7\u30E7\u30F3",
      en: "Acceleration",
      fr: "Acc\u00E9l\u00E9ration",
      cn: "促进",
    },
    cooldown: 55,
    xivDbId: "7518",
    requiresBossTarget: false,
    statuses: [statuses.acceleration],
    abilityType: AbilityType.Utility,
    levelAcquired: 50,
  },
  {
    name: "Magick Barrier",
    translation: {
      de: "Magiebarriere",
      ja: "\u30D0\u30DE\u30B8\u30AF",
      en: "Magick Barrier",
      fr: "Barri\u00E8re anti-magie",
      cn: "抗死",
    },
    cooldown: 120,
    requiresBossTarget: false,
    xivDbId: 25857,
    abilityType: AbilityType.PartyDefense | AbilityType.PartyHealingBuff,
    statuses: [statuses.magicBarrier],
    levelAcquired: 86,
  },
  {
    name: "Vice of Thorns",
    translation: {
      de: "Dornenpein",
      ja: "\u30B3\u30FC\u30B9\u30AA\u30D5\u30B9",
      en: "Vice of Thorns",
      fr: "Vice de ronces",
      cn: "荆棘之恶",
    },
    cooldown: 1,
    xivDbId: 37005,
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 92,
  },
  {
    name: "Prefulgence",
    translation: {
      de: "Pr\u00E4fulgenz",
      ja: "\u30D7\u30EC\u30D5\u30EB\u30B8\u30A7\u30F3\u30B9",
      en: "Prefulgence",
      fr: "Pr\u00E9fulgence",
      cn: "光辉",
    },
    cooldown: 1,
    xivDbId: 37007,
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 100,
  },
  ...getAbilitiesFrom(casterSharedAbilities),
  medicine.Intelligence,
];

const traits: ITrait[] = [
  {
    name: "Red Magic Mastery",
    level: 74,
    apply: abilityTrait("Contre Sixte", updateCooldown(35)),
  },
  {
    name: "Enhanced Manafication",
    level: 74,
    apply: abilityTrait("Manafication", updateCooldown(110)),
  },
  {
    name: "Enhanced Acceleration",
    level: 78,
    apply: abilityTrait("Acceleration", (ab) => {
      ab.charges = {
        count: 2,
        cooldown: 55,
      };
    }),
  },
  ...casterSharedTraits,
];

export const RDM: IJobTemplate = {
  translation: {
    de: "RMA",
    ja: "RDM",
    en: "RDM",
    fr: "MRG",
    cn: "RDM",
  },
  fullNameTranslation: {
    de: "Rotmagier",
    ja: "\u8D64\u9B54\u9053\u58EB",
    en: "Red Mage",
    fr: "mage rouge",
    cn: "赤魔法师",
  },
  role: Role.Caster,
  abilities,
  traits,
};
