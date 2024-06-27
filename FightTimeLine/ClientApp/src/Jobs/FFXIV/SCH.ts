import Effects from "src/core/Defensives/effects";
import {
  Role,
  AbilityType,
  DamageType,
  MapStatuses,
  settings,
  IJobTemplate,
  IAbility,
  ITrait,
  IMitigator,
  MitigationVisitorContext,
} from "../../core/Models";
import {
  getAbilitiesFrom,
  healerSharedAbilities,
  healerSharedTraits,
  medicine,
} from "./shared";
import { abilityTrait, updateCooldown } from "./traits";
import { AllowOverlapStrategy } from "src/core/Overlap";

class DeploymentTacticsModifier implements IMitigator {
  constructor(private value: number) {}
  apply(context: MitigationVisitorContext) {
    // console.log("DT Modifier");
    const original = context.holders.itemUsages.get(context.sourceAbilityId);
    const dtAbilityMap = context.holders.abilities.getByParentAndAbility(
      original.ability.job.id,
      "Deployment Tactics"
    );
    const dtUsages = context.holders.itemUsages.getByAbility(dtAbilityMap.id);
    // console.debug(context.holders.itemUsages.getAll().map((a) => a.ability.ability.name));
    const affected = dtUsages.some(
      (a) => a.start >= original.start && a.start < context.attackAt
    );

    if (affected) {
      // console.log("Affected by DT");
      return context.addAbsorbFromAbilityForParty(this.value);
    } else return context.addAbsorbFromAbilityForTarget(this.value);
  }
}

const statuses = MapStatuses({
  succor: {
    duration: 30,
    effects: [Effects.shield.party(10)],
  },
  adloquium: {
    duration: 30,
    effects: [
      Effects.shieldFromHeal.solo(180).withModifier(DeploymentTacticsModifier),
    ],
  },
  whisperingDawn: {
    duration: 21,
  },
  feyIllumination: {
    duration: 20,
    effects: [
      Effects.mitigation.party(5, DamageType.Magical),
      Effects.healingIncrease.party(10),
    ],
  },
  sacredSoil: {
    duration: 15,
    effects: [Effects.mitigation.party(10)],
  },
  dissipation: {
    duration: 30,
  },
  excogitation: {
    duration: 45,
  },
  chainStratagem: {
    duration: 15,
  },
  recitation: {
    duration: 15,
    effects: [Effects.healingIncrease.solo(20)],
    // todo: think about crit increase
  },
  summonSeraph: {
    duration: 22,
  },
  protraction: {
    duration: 10,
    effects: [Effects.hpIncrease.solo(10), Effects.healingIncrease.self(10)],
  },
  expedient: {
    duration: 20,
    effects: [Effects.mitigation.party(10)],
  },
  consolation: {
    duration: 30,
    potency: 250,
    effects: [Effects.shieldFromHeal.party(100)],
  },
});

const abilities = [
  {
    name: "Succor",
    translation: {
      de: "Kurieren",
      ja: "\u58EB\u6C17\u9AD8\u63DA\u306E\u7B56",
      en: "Succor",
      fr: "Trait\u00E9 du soulagement",
      cn: "士气高扬之策",
    },
    cooldown: 30,
    xivDbId: "186",
    statuses: [statuses.succor],
    abilityType: AbilityType.PartyShield,
    overlapStrategy: new AllowOverlapStrategy(),
    levelAcquired: 35,
  },
  {
    name: "Adloquium",
    translation: {
      de: "Adloquium",
      ja: "\u9F13\u821E\u6FC0\u52B1\u306E\u7B56",
      en: "Adloquium",
      fr: "Trait\u00E9 du r\u00E9confort",
      cn: "鼓舞激励之策",
    },
    cooldown: 30,
    xivDbId: "185",
    statuses: [statuses.adloquium],
    settings: [settings.target],
    potency: 300,
    overlapStrategy: new AllowOverlapStrategy(),
    abilityType: AbilityType.SelfShield,
    levelAcquired: 30,
  },
  {
    name: "Whispering Dawn",
    translation: {
      de: "Erhebendes Fl\u00FCstern",
      ja: "\u5149\u306E\u56C1\u304D",
      en: "Whispering Dawn",
      fr: "Murmure de l\u0027aurore",
      cn: "仙光的低语",
    },
    duration: 21,
    cooldown: 60,
    xivDbId: "803",
    statuses: [statuses.whisperingDawn],
    abilityType: AbilityType.PartyHealing,
    levelAcquired: 20,
  },
  {
    name: "Fey Illumination",
    translation: {
      de: "Illumination",
      ja: "\u30D5\u30A7\u30A4\u30A4\u30EB\u30DF\u30CD\u30FC\u30B7\u30E7\u30F3",
      en: "Fey Illumination",
      fr: "Illumination f\u00E9\u00E9rique",
      cn: "异想的幻光",
    },
    cooldown: 120,
    xivDbId: "805",
    statuses: [statuses.feyIllumination],
    abilityType: AbilityType.PartyHealingBuff | AbilityType.PartyDefense,
    levelAcquired: 40,
  },
  {
    name: "Aetherflow",
    translation: {
      de: "\u00C4therfluss",
      ja: "\u30A8\u30FC\u30C6\u30EB\u30D5\u30ED\u30FC",
      en: "Aetherflow",
      fr: "Flux d\u0027\u00E9ther",
      cn: "以太超流",
    },
    cooldown: 60,
    requiresBossTarget: true,
    xivDbId: "166",
    abilityType: AbilityType.Utility,
    levelAcquired: 45,
  },
  {
    name: "Lustrate",
    translation: {
      de: "Revitalisierung",
      ja: "\u751F\u547D\u6D3B\u6027\u6CD5",
      en: "Lustrate",
      fr: "Loi de revivification",
      cn: "生命活性法",
    },
    cooldown: 1,
    xivDbId: "189",
    abilityType: AbilityType.Healing,
    settings: [settings.target],
    levelAcquired: 45,
  },
  {
    name: "Energy Drain",
    translation: {
      de: "Energieentzug",
      ja: "\u30A8\u30CA\u30B8\u30FC\u30C9\u30EC\u30A4\u30F3",
      en: "Energy Drain",
      fr: "Aspiration d\u0027\u00E9nergie",
      cn: "能量吸收",
    },
    cooldown: 3,
    xivDbId: "167",
    abilityType: AbilityType.Damage,
    levelAcquired: 45,
  },
  {
    name: "Sacred Soil",
    translation: {
      de: "Geweihte Erde",
      ja: "\u91CE\u6226\u6CBB\u7642\u306E\u9663",
      en: "Sacred Soil",
      fr: "Dogme de survie",
      cn: "野战治疗阵",
    },
    cooldown: 30,
    xivDbId: "188",
    statuses: [statuses.sacredSoil],
    abilityType: AbilityType.PartyDefense,
    levelAcquired: 50,
  },
  {
    name: "Indomitability",
    translation: {
      de: "Unbezwingbarkeit",
      ja: "\u4E0D\u6493\u4E0D\u5C48\u306E\u7B56",
      en: "Indomitability",
      fr: "Trait\u00E9 de la pers\u00E9v\u00E9rance",
      cn: "不屈不挠之策",
    },
    cooldown: 30,
    xivDbId: "3583",
    abilityType: AbilityType.PartyHealing,
    levelAcquired: 52,
  },
  {
    name: "Deployment Tactics",
    translation: {
      de: "Dislokation",
      ja: "\u5C55\u958B\u6226\u8853",
      en: "Deployment Tactics",
      fr: "Stratag\u00E8me du d\u00E9ploiement",
      cn: "展开战术",
    },
    cooldown: 120,
    xivDbId: "3585",
    abilityType: AbilityType.PartyHealing,
    levelAcquired: 56,
  },
  {
    name: "Dissipation",
    translation: {
      de: "Dissipation",
      ja: "\u8EE2\u5316",
      en: "Dissipation",
      fr: "Dissipation",
      cn: "转化",
    },
    cooldown: 180,
    xivDbId: "3587",
    statuses: [statuses.dissipation],
    abilityType: AbilityType.HealingBuff,
    levelAcquired: 60,
  },
  {
    name: "Excogitation",
    translation: {
      de: "Weise Voraussicht",
      ja: "\u6DF1\u8B00\u9060\u616E\u306E\u7B56",
      en: "Excogitation",
      fr: "Trait\u00E9 de l\u0027excogitation",
      cn: "深谋远虑之策",
    },
    cooldown: 45,
    xivDbId: "7434",
    requiresBossTarget: false,
    statuses: [statuses.excogitation],
    abilityType: AbilityType.Healing,
    settings: [settings.target],
    levelAcquired: 62,
  },
  {
    name: "Chain Stratagem",
    translation: {
      de: "Kritische Strategie",
      ja: "\u9023\u74B0\u8A08",
      en: "Chain Stratagem",
      fr: "Stratag\u00E8mes entrelac\u00E9s",
      cn: "连环计",
    },
    cooldown: 120,
    xivDbId: "7436",
    requiresBossTarget: true,
    statuses: [statuses.chainStratagem],
    abilityType: AbilityType.PartyDamageBuff,
    levelAcquired: 66,
  },
  {
    name: "Aetherpact",
    translation: {
      de: "\u00C4therpakt",
      ja: "\u30A8\u30FC\u30C6\u30EB\u30D1\u30AF\u30C8",
      en: "Aetherpact",
      fr: "Pacte d\u0027\u00E9ther",
      cn: "以太契约",
    },
    cooldown: 1,
    xivDbId: "7437",
    abilityType: AbilityType.Healing,
    levelAcquired: 70,
  },
  {
    name: "Recitation",
    translation: {
      de: "Raffinesse",
      ja: "\u79D8\u7B56",
      en: "Recitation",
      fr: "R\u00E9citation",
      cn: "秘策",
    },
    cooldown: 90,
    xivDbId: "16542",
    statuses: [statuses.recitation],
    abilityType: AbilityType.HealingBuff,
    levelAcquired: 74,
  },
  {
    name: "Fey Blessing",
    translation: {
      de: "Gunst der Feen",
      ja: "\u30D5\u30A7\u30A4\u30D6\u30EC\u30C3\u30B7\u30F3\u30B0",
      en: "Fey Blessing",
      fr: "B\u00E9n\u00E9diction f\u00E9\u00E9rique",
      cn: "异想的祥光",
    },
    cooldown: 60,
    xivDbId: "16543",
    abilityType: AbilityType.PartyHealing,
    levelAcquired: 75,
  },
  {
    name: "Summon Seraph",
    translation: {
      de: "Seraph-Beschw\u00F6rung",
      ja: "\u30B5\u30E2\u30F3\u30FB\u30BB\u30E9\u30D5\u30A3\u30E0",
      en: "Summon Seraph",
      fr: "Invocation S\u00E9raphin",
      cn: "炽天召唤",
    },
    duration: 22,
    cooldown: 120,
    xivDbId: "16545",
    statuses: [statuses.summonSeraph],
    abilityType: AbilityType.PartyHealing,
    levelAcquired: 80,
  },
  {
    name: "Consolation",
    translation: {
      de: "Seelentrost",
      ja: "\u30B3\u30F3\u30BD\u30EC\u30A4\u30B7\u30E7\u30F3",
      en: "Consolation",
      fr: "Dictame",
      cn: "慰藉",
    },
    cooldown: 30,
    xivDbId: "16546",
    abilityType: AbilityType.PartyHealing | AbilityType.PartyShield,
    charges: {
      count: 2,
      cooldown: 30,
    },
    statuses: [statuses.consolation],
    levelAcquired: 80,
  },
  {
    name: "Protraction",
    translation: {
      de: "Protraktion",
      ja: "\u751F\u547D\u56DE\u751F\u6CD5",
      en: "Protraction",
      fr: "Loi de la protraction",
      cn: "生命回生法",
    },
    cooldown: 60,
    xivDbId: 25867,
    statuses: [statuses.protraction],
    settings: [settings.target],
    abilityType: AbilityType.HealingBuff | AbilityType.SelfDefense,
    levelAcquired: 86,
  },
  {
    name: "Expedient",
    translation: {
      de: "Sturm und Drang",
      ja: "\u75BE\u98A8\u6012\u6FE4\u306E\u8A08",
      en: "Expedient",
      fr: "Th\u00E8se fluidique",
      cn: "疾风怒涛之计",
    },
    cooldown: 120,
    xivDbId: 25868,
    abilityType: AbilityType.PartyDefense,
    statuses: [statuses.expedient],
    levelAcquired: 90,
  },
  ...getAbilitiesFrom(healerSharedAbilities),
  medicine.Mind,
] as IAbility[];

const traits: ITrait[] = [
  {
    name: "Enhanced Deployment Tactics",
    level: 88,
    apply: abilityTrait("Deployment Tactics", updateCooldown(90)),
  },
  ...healerSharedTraits,
];

export const SCH: IJobTemplate = {
  translation: {
    de: "GLT",
    ja: "SCH",
    en: "SCH",
    fr: "\u00C9RU",
    cn: "SCH",
  },
  fullNameTranslation: {
    de: "Gelehrter",
    ja: "\u5B66\u8005",
    en: "Scholar",
    fr: "\u00E9rudit",
    cn: "学者",
  },
  role: Role.Healer,
  abilities,
  traits,
};
