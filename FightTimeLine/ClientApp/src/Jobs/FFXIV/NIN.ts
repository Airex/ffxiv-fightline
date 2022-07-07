import Effects from "src/core/Effects";
import { IJob, Role, AbilityType, MapStatuses, IJobTemplate, IAbility, ITrait } from "../../core/Models";
import { getAbilitiesFrom, meleeSharedAbilities, medicine } from "./shared";
import { abilityRemovedTrait } from "./traits";

const statuses = MapStatuses({
  shadeShift: {
    duration: 20,
    effects: [Effects.shield.solo(20)]
  },
  trickAttak: {
    duration: 15
  },
  tenChiJin: {
    duration: 6
  },
  meisui: {
    duration: 30
  },
  bunshin: {
    duration: 30
  },
  mug: {
    duration: 20
  }
});

const abilities = [
  {
    name: "Shade Shift",
    translation: {
      de: "Superkniff",
      ja: "\u6B8B\u5F71",
      en: "Shade Shift",
      fr: "D\u00E9calage d\u0027ombre"
    },
    cooldown: 120,
    xivDbId: "2241",
    statuses: [statuses.shadeShift],
    abilityType: AbilityType.SelfShield,
    levelAcquired: 2
  },
  {
    name: "Mug",
    translation: {
      de: "Ausrauben",
      ja: "\u3076\u3093\u3069\u308B",
      en: "Mug",
      fr: "Rapine"
    },
    cooldown: 120,
    xivDbId: "2248",
    requiresBossTarget: true,
    statuses: [statuses.mug],
    abilityType: AbilityType.Damage | AbilityType.PartyDamageBuff,
    levelAcquired: 15
  },
  {
    name: "Assassinate",
    translation: {
      de: "Meuchelsprung",
      en: "Assassinate",
      fr: "Assassinement",
      ja: "終撃"
    },
    xivDbId: "2246",
    cooldown: 60,
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 40
  },
  {
    name: "Trick Attack",
    translation: {
      de: "Trickattacke",
      ja: "\u3060\u307E\u3057\u8A0E\u3061",
      en: "Trick Attack",
      fr: "Attaque sournoise"
    },
    cooldown: 60,
    xivDbId: "2258",
    requiresBossTarget: true,
    statuses: [statuses.trickAttak],
    abilityType: AbilityType.Damage | AbilityType.SelfDamageBuff,
    levelAcquired: 18
  },
  {
    name: "Kassatsu",
    translation: {
      de: "Kassatsu",
      ja: "\u6D3B\u6BBA\u81EA\u5728",
      en: "Kassatsu",
      fr: "Kassatsu"
    },
    cooldown: 60,
    xivDbId: "2264",
    requiresBossTarget: true,

    abilityType: AbilityType.Damage,
    levelAcquired: 50
  },
  {
    name: "Dream Within a Dream",
    translation: {
      de: "Tern\u00E4re Trance",
      ja: "\u5922\u5E7B\u4E09\u6BB5",
      en: "Dream Within a Dream",
      fr: "R\u00EAve dans un r\u00EAve"
    },
    cooldown: 60,
    xivDbId: "3566",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 56
  },
  {
    name: "Bhavacakra",
    translation: {
      de: "Rad des Werdens",
      ja: "\u516D\u9053\u8F2A\u5EFB",
      en: "Bhavacakra",
      fr: "Bhavacakra"
    },
    cooldown: 1,
    xivDbId: "7402",
    requiresBossTarget: true,
    abilityType: AbilityType.Damage,
    levelAcquired: 68
  },
  {
    name: "Ten Chi Jin",
    translation: {
      de: "Ten Chi Jin",
      ja: "\u5929\u5730\u4EBA",
      en: "Ten Chi Jin",
      fr: "Ten Chi Jin"
    },
    cooldown: 120,
    xivDbId: "7403",
    requiresBossTarget: true,
    statuses: [statuses.tenChiJin],
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 70
  },
  {
    name: "Meisui",
    translation: {
      de: "Meisui",
      ja: "\u547D\u6C34",
      en: "Meisui",
      fr: "Meisui"
    },
    cooldown: 120,
    xivDbId: "16489",
    requiresBossTarget: true,
    statuses: [statuses.meisui],
    abilityType: AbilityType.Utility | AbilityType.SelfDamageBuff,
    levelAcquired: 72
  },
  {
    name: "Bunshin",
    translation: {
      de: "Doppeltes Ich",
      ja: "\u5206\u8EAB\u306E\u8853",
      en: "Bunshin",
      fr: "Bunshin"
    },
    cooldown: 90,
    xivDbId: "16493",
    requiresBossTarget: true,
    statuses: [statuses.bunshin],
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 80
  },
  ...getAbilitiesFrom(meleeSharedAbilities),
  medicine.Dexterity
] as IAbility[];

const traits: ITrait[] = [
  {
    name: "Adept Assassination",
    level: 56,
    apply: abilityRemovedTrait("Assassination", 56)
  },
];

export const NIN: IJobTemplate = {

  translation: {
    de: "NIN",
    ja: "NIN",
    en: "NIN",
    fr: "NIN"
  },

  fullNameTranslation: {
    de: "Ninja",
    ja: "\u5FCD\u8005",
    en: "Ninja",
    fr: "Ninja"
  },
  role: Role.Melee,
  abilities,
  traits
};


