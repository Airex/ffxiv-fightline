import { SharedOverlapStrategy } from "src/core/Overlap";
import {
  Role,
  AbilityType,
  MapStatuses,
  IJobTemplate,
  ITrait,
  IAbility,
} from "../../core/Models";
import {
  getAbilitiesFrom,
  meleeSharedAbilities,
  medicine,
  meleeSharedTraits,
} from "./shared";
import { abilityTrait } from "./traits";

const statuses = MapStatuses({
  meikyoShisui: {
    duration: 20,
  },
});

const abilities = [
  {
    name: "Meikyo Shisui",
    translation: {
      de: "Meikyo Shisui",
      ja: "\u660E\u93E1\u6B62\u6C34",
      en: "Meikyo Shisui",
      fr: "Meiky\u00F4 Shisui",
      cn: "明镜止水",
    },
    cooldown: 55,
    xivDbId: "7499",
    statuses: [statuses.meikyoShisui],
    abilityType: AbilityType.Utility,
    levelAcquired: 50,
  },
  {
    name: "Hissatsu: Shinten",
    translation: {
      de: "Hissatsu: Shinten",
      ja: "\u5FC5\u6BBA\u5263\u30FB\u795E\u5929",
      en: "Hissatsu: Shinten",
      fr: "Hissatsu : Shinten",
      cn: "必杀剑·神天",
    },
    xivDbId: "7490",
    cooldown: 1,
    abilityType: AbilityType.Damage,
    levelAcquired: 52,
    requiresBossTarget: true,
  },
  {
    name: "Ikishoten",
    translation: {
      de: "Ikishoten",
      ja: "\u610F\u6C17\u885D\u5929",
      en: "Ikishoten",
      fr: "Ikish\u00F4ten",
      cn: "意气冲天",
    },
    cooldown: 120,
    xivDbId: "16482",
    abilityType: AbilityType.Utility,
    levelAcquired: 68,
  },
  {
    name: "Hagakure",
    translation: {
      de: "Hagakure",
      ja: "\u88C5\u3044",
      en: "Hagakure",
      fr: "Hagakure",
      cn: "装束",
    },
    cooldown: 5,
    xivDbId: "7495",
    abilityType: AbilityType.Utility,
    levelAcquired: 68,
  },
  {
    name: "Hissatsu: Senei",
    translation: {
      de: "Hissatsu: Senei",
      ja: "\u5FC5\u6BBA\u5263\u30FB\u9583\u5F71",
      en: "Hissatsu: Senei",
      fr: "Hissatsu : Sen\u0027ei",
      cn: "必杀剑·闪影",
    },
    cooldown: 120,
    xivDbId: "16481",
    abilityType: AbilityType.Damage,
    levelAcquired: 72,
  },
  {
    name: "Tsubame-gaeshi",
    translation: {
      de: "Tsubamegaeshi",
      ja: "\u71D5\u8FD4\u3057",
      en: "Tsubame-gaeshi",
      fr: "Tsubamegaeshi",
      cn: "燕回返",
    },
    cooldown: 60,
    xivDbId: "16483",
    abilityType: AbilityType.Damage,
    levelAcquired: 76,
    charges: {
      count: 2,
      cooldown: 60,
    },
  },
  {
    name: "Shoha",
    translation: {
      de: "Shoha",
      ja: "\u7167\u7834",
      en: "Shoha",
      fr: "Sh\u00F4ha",
      cn: "照破",
    },
    cooldown: 15,
    xivDbId: "16487",
    abilityType: AbilityType.Damage,
    levelAcquired: 80,
  },
  {
    name: "Zanshin",
    translation: {
      de: "Zanshin",
      ja: "\u5B88\u5C71",
      en: "Zanshin",
      fr: "Zanshin",
      cn: "赞颂",
    },
    xivDbId: "36964",
    abilityType: AbilityType.Damage,
    levelAcquired: 96,
    cooldown: 1,
    requiresBossTarget: true,
  },
  ...getAbilitiesFrom(meleeSharedAbilities),
  medicine.Strength,
] as IAbility[];

const traits: ITrait[] = [
  {
    name: "Enhanced Meikyo Shisui",
    level: 76,
    apply: abilityTrait("Meikyo Shisui", {
      charges: {
        count: 2,
        cooldown: 55,
      },
    }),
  },
  {
    name: "Enhanced Tsubame-gaeshi",
    level: 84,
    apply: abilityTrait("Tsubame-gaeshi", {
      charges: {
        count: 2,
        cooldown: 60,
      },
    }),
  },
  {
    name: "Enhanced Hissatsu",
    level: 94,
    apply: abilityTrait("Hissatsu: Senei", {
      cooldown: 60,
    }),
  },
  ...meleeSharedTraits,
];

export const SAM: IJobTemplate = {
  translation: {
    de: "SAM",
    ja: "SAM",
    en: "SAM",
    fr: "SAM",
    cn: "SAM",
  },
  fullNameTranslation: {
    de: "Samurai",
    ja: "\u4F8D",
    en: "Samurai",
    fr: "Samoura\u00EF",
    cn: "武士",
  },
  role: Role.Melee,
  abilities,
  traits,
};
