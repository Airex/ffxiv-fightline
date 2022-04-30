import { SharedOverlapStrategy } from "src/core/Overlap";
import { IJob, Role, AbilityType, MapStatuses } from "../../core/Models";
import { getAbilitiesFrom, meleeSharedAbilities, medicine } from "./shared";

const statuses = MapStatuses({
  meikyoShisui: {
    duration: 15
  }
});

const abilities = [
  {
    name: "Meikyo Shisui",
    translation: {
      de: "Meikyo Shisui",
      jp: "\u660E\u93E1\u6B62\u6C34",
      en: "Meikyo Shisui",
      fr: "Meiky\u00F4 Shisui"
    },
    cooldown: 55,
    xivDbId: "7499",
    statuses: [statuses.meikyoShisui],
    abilityType: AbilityType.Utility,
    levelAcquired: 50,
    charges: {
      count: 2,
      cooldown: 55
    }
  },
  {
    name: "Ikishoten",
    translation: {
      de: "Ikishoten",
      jp: "\u610F\u6C17\u885D\u5929",
      en: "Ikishoten",
      fr: "Ikish\u00F4ten"
    },
    cooldown: 120,
    xivDbId: "16482",
    abilityType: AbilityType.Utility,
    levelAcquired: 68
  },
  {
    name: "Hissatsu: Guren",
    translation: {
      de: "Hissatsu: Guren",
      jp: "\u5FC5\u6BBA\u5263\u30FB\u7D05\u84EE",
      en: "Hissatsu: Guren",
      fr: "Hissatsu : Guren"
    },
    cooldown: 120,
    xivDbId: "7496",
    abilityType: AbilityType.Damage,
    levelAcquired: 70
  },
  {
    name: "Hissatsu: Senei",
    translation: {
      de: "Hissatsu: Senei",
      jp: "\u5FC5\u6BBA\u5263\u30FB\u9583\u5F71",
      en: "Hissatsu: Senei",
      fr: "Hissatsu : Sen\u0027ei"
    },
    cooldown: 120,
    xivDbId: "16481",
    abilityType: AbilityType.Damage,
    levelAcquired: 72
  },
  {
    name: "Tsubame-gaeshi",
    translation: {
      de: "Tsubamegaeshi",
      jp: "\u71D5\u8FD4\u3057",
      en: "Tsubame-gaeshi",
      fr: "Tsubamegaeshi"
    },
    cooldown: 60,
    xivDbId: "16483",
    abilityType: AbilityType.Damage,
    levelAcquired: 76,
    charges: {
      count: 2,
      cooldown: 60
    }
  },
  {
    name: "Shoha",
    translation: {
      de: "Shoha",
      jp: "\u7167\u7834",
      en: "Shoha",
      fr: "Sh\u00F4ha"
    },
    cooldown: 15,
    xivDbId: "16487",
    overlapStrategy: new SharedOverlapStrategy(["Shoha II"]),
    abilityType: AbilityType.Damage,
    levelAcquired: 80
  },
  {
    name: "Shoha II",
    translation: {
      de: "Mumyo Shoha",
      jp: "\u7121\u660E\u7167\u7834",
      en: "Shoha II",
      fr: "Mumy\u00F4 Sh\u00F4ha"
    },
    cooldown: 15,
    xivDbId: 25779,
    overlapStrategy: new SharedOverlapStrategy(["Shoha"]),
    abilityType: AbilityType.Damage,
    levelAcquired: 80
  }, {
    name: "Kaeshi: Namikiri",
    translation: {
      de: "Kaeshi Namikiri",
      en: "Kaeshi: Namikiri",
      fr: "Kaeshi Namikiri",
      jp: "\u8fd4\u3057\u6ce2\u5207",
    },
    cooldown: 1,
    xivDbId: 25782,
    abilityType: AbilityType.Damage,
    levelAcquired: 90
  },

  ...getAbilitiesFrom(meleeSharedAbilities),
  medicine.Strength
];
export const SAM: IJob = {
  name: "SAM",
  translation: {
    de: "SAM",
    jp: "SAM",
    en: "SAM",
    fr: "SAM"
  },
  fullName: "Samurai",
  fullNameTranslation: {
    de: "Samurai",
    jp: "\u4F8D",
    en: "Samurai",
    fr: "Samoura\u00EF"
  },
  role: Role.Melee,
  abilities
};


