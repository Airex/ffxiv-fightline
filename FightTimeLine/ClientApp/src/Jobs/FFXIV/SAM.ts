import { SharedOverlapStrategy } from "src/core/Overlap";
import { Role, AbilityType, MapStatuses, IJobTemplate, ITrait, IAbility } from "../../core/Models";
import { getAbilitiesFrom, meleeSharedAbilities, medicine } from "./shared";
import { abilityTrait } from "./traits";

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
      ja: "\u660E\u93E1\u6B62\u6C34",
      en: "Meikyo Shisui",
      fr: "Meiky\u00F4 Shisui",
      cn: "明镜止水",
    },
    cooldown: 55,
    xivDbId: "7499",
    statuses: [statuses.meikyoShisui],
    abilityType: AbilityType.Utility,
    levelAcquired: 50
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
    levelAcquired: 68
  },
  {
    name: "Hissatsu: Guren",
    translation: {
      de: "Hissatsu: Guren",
      ja: "\u5FC5\u6BBA\u5263\u30FB\u7D05\u84EE",
      en: "Hissatsu: Guren",
      fr: "Hissatsu : Guren",
      cn: "必杀剑·红莲",
    },
    overlapStrategy: new SharedOverlapStrategy(["Hissatsu: Senei"]),
    cooldown: 120,
    xivDbId: "7496",
    abilityType: AbilityType.Damage,
    levelAcquired: 70
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
    overlapStrategy: new SharedOverlapStrategy(["Hissatsu: Guren"]),
    cooldown: 120,
    xivDbId: "16481",
    abilityType: AbilityType.Damage,
    levelAcquired: 72
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
      cooldown: 60
    }
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
    overlapStrategy: new SharedOverlapStrategy(["Shoha II"]),
    abilityType: AbilityType.Damage,
    levelAcquired: 80
  },
  {
    name: "Shoha II",
    translation: {
      de: "Mumyo Shoha",
      ja: "\u7121\u660E\u7167\u7834",
      en: "Shoha II",
      fr: "Mumy\u00F4 Sh\u00F4ha",
      cn: "无明照破",
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
      cn: "回返斩浪",
      ja: "\u8fd4\u3057\u6ce2\u5207",
    },
    cooldown: 1,
    xivDbId: 25782,
    abilityType: AbilityType.Damage,
    levelAcquired: 90
  },

  ...getAbilitiesFrom(meleeSharedAbilities),
  medicine.Strength
] as IAbility[];

const traits: ITrait[] = [
  {
    name: "Enhanced Meikyo Shisui",
    level: 88,
    apply: abilityTrait("Meikyo Shisui", {
      charges: {
        count: 2,
        cooldown: 55
      }
    })
  },
  {
    name: "Enhanced Tsubame-gaeshi",
    level: 84,
    apply: abilityTrait("Tsubame-gaeshi", {
      charges: {
        count: 2,
        cooldown: 60
      }
    })
  }

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
  traits
};


