import Effects from "../../core/Defensives/effects";
import {
  Role,
  AbilityType,
  MapStatuses,
  IAbility,
  IJobTemplate,
  ITrait,
} from "../../core/Models";
import { withCasterSharedAbilities } from "./shared";
import { abilityTrait } from "./traits";

const statuses = MapStatuses({
  searingLight: {
    duration: 20,
  },
  radiantAegis: {
    duration: 30,
    effects: [Effects.shield.solo(20)],
  },
});

const abilities = [
  {
    name: "Searing Light",
    translation: {
      de: "Glei\u00DFender Schein",
      ja: "\u30B7\u30A2\u30EA\u30F3\u30B0\u30E9\u30A4\u30C8",
      en: "Searing Light",
      fr: "\u00C9clat ardent",
      cn: "灼热之光",
    },
    cooldown: 120,
    xivDbId: 25801,
    abilityType: AbilityType.PartyDamageBuff,
    statuses: [statuses.searingLight],
    levelAcquired: 66,
  },
  {
    name: "Radiant Aegis",
    translation: {
      de: "Schimmerschild",
      ja: "\u5B88\u308A\u306E\u5149",
      en: "Radiant Aegis",
      fr: "\u00C9gide rayonnante",
      cn: "守护之光",
    },
    cooldown: 60,
    xivDbId: 25799,
    abilityType: AbilityType.SelfShield,
    statuses: [statuses.radiantAegis],
    levelAcquired: 66,
  },
  {
    name: "Mountain Buster",
    translation: {
      de: "Bergsprenger",
      en: "Mountain Buster",
      fr: "Casse-montagnes",
      cn: "山崩",
      ja: "\u30de\u30a6\u30f3\u30c6\u30f3\u30d0\u30b9\u30bf\u30fc",
    },
    cooldown: 1,
    xivDbId: 25836,
    levelAcquired: 86,
  },
  {
    name: "Revelation",
    translation: {
      de: "Offenbarung",
      en: "Revelation",
      fr: "R\u00e9v\u00e9lation",
      cn: "天启",
      ja: "\u30ea\u30f4\u30a1\u30ec\u30fc\u30b7\u30e7\u30f3",
    },
    cooldown: 1,
    xivDbId: 16518,
    levelAcquired: 80,
  },
  // {
  //   name: "Enkindle Phoenix",
  //   translation: {
  //     de: "Ph\u00F6nix-Entflammung",
  //     ja: "\u30A8\u30F3\u30AD\u30F3\u30C9\u30EB\u30FB\u30D5\u30A7\u30CB\u30C3\u30AF\u30B9",
  //     en: "Enkindle Phoenix",
  //     fr: "Galvanisation Ph\u00E9nix",
  //     cn: "",
  //   },
  //   cooldown: 20,
  //   xivDbId: 0,
  //   levelAcquired: 80
  // },
  {
    name: "Energy Drain",
    translation: {
      de: "Energieentzug",
      ja: "\u30A8\u30CA\u30B8\u30FC\u30C9\u30EC\u30A4\u30F3",
      en: "Energy Drain",
      fr: "Aspiration d\u0027\u00E9nergie",
      cn: "能量吸收",
    },
    cooldown: 30,
    xivDbId: "16508",
    abilityType: AbilityType.Damage,
    levelAcquired: 18,
  },
  {
    name: "Fester",
    translation: {
      de: "Schwäre",
      en: "Fester",
      fr: "Suppuration",
      cn: "溃烂爆发",
      ja: "ミアズマバースト",
    },
    cooldown: 1,
    xivDbId: "181",
    abilityType: AbilityType.Damage,
    levelAcquired: 10,
  },
] as IAbility[];

const traits: ITrait[] = [
  {
    name: "Enhanced Radiant Aegis",
    level: 84,
    apply: abilityTrait("Radiant Aegis", (ab) => {
      ab.charges = {
        initialCount: 2,
        count: 2,
        cooldown: 60,
      };
    }),
  },
];

export const SMN: IJobTemplate = withCasterSharedAbilities({
  translation: {
    de: "BSW",
    ja: "SMN",
    en: "SMN",
    fr: "INV",
    cn: "SMN",
  },
  fullNameTranslation: {
    de: "Beschw\u00F6rer",
    ja: "\u53EC\u559A\u58EB",
    en: "Summoner",
    fr: "Invocateur",
    cn: "召唤师",
  },
  role: Role.Caster,
  abilities,
  traits,
});
