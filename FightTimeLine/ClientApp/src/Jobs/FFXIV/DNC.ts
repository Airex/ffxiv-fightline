import Effects from "src/core/Effects";
import { IJob, Role, AbilityType, IAbility, MapStatuses, IMitigator, MitigationVisitorContext, settings, IJobTemplate, ITrait } from "../../core/Models";
import { getAbilitiesFrom, rangeSharedAbilities, medicine, toAbilities } from "./shared";
import { abilityTrait } from "./traits";

class ImprovisationFinishModifier implements IMitigator {
  constructor(private value: number) {

  }
  apply(context: MitigationVisitorContext) {
    const current = context.holders.itemUsages.get(context.abilityId);
    const improvisation = context.holders.abilities.getByParentAndAbility(context.jobId, "Improvisation");
    const improvisations = context.holders.itemUsages.getByAbility(improvisation.id);
    const found = improvisations.filter(ab => ab.start < current.start).sort((a, b) => b.startAsNumber - a.startAsNumber)[0];
    if (found) {
      const seconds = (current.startAsNumber - found.startAsNumber) / 1000;
      const times = Math.min(5, seconds / 3);
      context.addShieldForParty(this.value + times);
    }
  }
}

const statuses = MapStatuses({
  shieldSamba: {
    duration: 15,
    shareGroup: "rangeDef",
    effects: [Effects.mitigation.party(10)]
  },
  improvisation: {
    duration: 15
  },
  improvisationFinish: {
    duration: 15,
    effects: [Effects.shield.party(5).withModifier(ImprovisationFinishModifier)]
  },
  devilment: {
    duration: 20
  },
  standardStep: {
    duration: 30,
    effects: [Effects.delay(2)]
  },
  technicalStep: {
    duration: 20,
    effects: [Effects.delay(4)]
  }

});

const abilities: IAbility[] = [
  {
    name: "Shield Samba",
    translation: {
      de: "Schildsamba",
      ja: "\u5B88\u308A\u306E\u30B5\u30F3\u30D0",
      en: "Shield Samba",
      fr: "Samba protectrice"
    },
    cooldown: 120,
    xivDbId: "16012",
    statuses: [statuses.shieldSamba],
    abilityType: AbilityType.PartyDefense,
    levelAcquired: 56
  },
  {
    name: "Improvisation",
    translation: {
      de: "Tanzimprovisation",
      ja: "\u30A4\u30F3\u30D7\u30ED\u30D3\u30BC\u30FC\u30B7\u30E7\u30F3",
      en: "Improvisation",
      fr: "Improvisation"
    },
    cooldown: 120,
    xivDbId: "16014",
    statuses: [statuses.improvisation],
    abilityType: AbilityType.Utility,
    levelAcquired: 80
  },
  {
    name: "Improvised Finish",
    translation: {
      de: "Improvisiertes Finale",
      en: "Improvised Finish",
      fr: "Final improvis\u00e9",
      ja: "\u30a4\u30f3\u30d7\u30ed\u30d3\u30bc\u30fc\u30b7\u30e7\u30f3\u30fb\u30d5\u30a3\u30cb\u30c3\u30b7\u30e5",
    },
    cooldown: 90,
    xivDbId: "25789",
    statuses: [statuses.improvisationFinish],
    abilityType: AbilityType.PartyShield,
    levelAcquired: 80
  },
  {
    name: "Flourish",
    translation: {
      de: "Trance",
      ja: "\u30D5\u30E9\u30EA\u30C3\u30B7\u30E5",
      en: "Flourish",
      fr: "Apoth\u00E9ose"
    },
    cooldown: 60,
    xivDbId: "16013",
    abilityType: AbilityType.Utility,
    levelAcquired: 72
  },
  {
    name: "Devilment",
    translation: {
      de: "Todestango",
      ja: "\u653B\u3081\u306E\u30BF\u30F3\u30B4",
      en: "Devilment",
      fr: "Tango endiabl\u00E9"
    },
    cooldown: 120,
    xivDbId: "16011",
    statuses: [statuses.devilment],
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 62
  },
  {
    name: "Closed Position",
    translation: {
      de: "Tanzpartner",
      ja: "\u30AF\u30ED\u30FC\u30BA\u30C9\u30DD\u30B8\u30B7\u30E7\u30F3",
      en: "Closed Position",
      fr: "Position rapproch\u00E9e"
    },
    cooldown: 30,
    xivDbId: "16006",
    abilityType: AbilityType.Utility,
    settings: [settings.target],
    levelAcquired: 60
  },
  {
    name: "Curing Waltz",
    translation: {
      de: "Heilender Walzer",
      ja: "\u7652\u3084\u3057\u306E\u30EF\u30EB\u30C4",
      en: "Curing Waltz",
      fr: "Valse revigorante"
    },
    cooldown: 60,
    xivDbId: "16015",
    abilityType: AbilityType.Healing,
    levelAcquired: 52
  },
  {
    name: "Standard Step",
    translation: {
      de: "Einfache Choreographie",
      ja: "\u30B9\u30BF\u30F3\u30C0\u30FC\u30C9\u30B9\u30C6\u30C3\u30D7",
      en: "Standard Step",
      fr: "Pas classique"
    },
    cooldown: 30,
    xivDbId: "15997",
    statuses: [statuses.standardStep],
    abilityType: AbilityType.SelfDamageBuff,
    levelAcquired: 15
  },
  {
    name: "Technical Step",
    translation: {
      de: "Komplexe Choreographie",
      ja: "\u30C6\u30AF\u30CB\u30AB\u30EB\u30B9\u30C6\u30C3\u30D7",
      en: "Technical Step",
      fr: "Pas technique"
    },
    cooldown: 120,
    xivDbId: "15998",
    statuses: [statuses.technicalStep],
    abilityType: AbilityType.SelfDamageBuff | AbilityType.PartyDamageBuff,
    levelAcquired: 70
  },
  ...getAbilitiesFrom(rangeSharedAbilities),
  medicine.Dexterity
];

const traits: ITrait[]  = [
  {
    level: 88,
    name: "Enhanced Shield Samba",
    apply: abilityTrait("Shield Samba", ab => ab.cooldown = 90)
  }
];


export const DNC: IJobTemplate = {

  translation: {
    de: "T\u00C4N",
    ja: "DNC",
    en: "DNC",
    fr: "DNS"
  },

  fullNameTranslation: {
    de: "T\u00E4nzer",
    ja: "\u8E0A\u308A\u5B50",
    en: "Dancer",
    fr: "Danseur"
  },
  role: Role.Range,
  abilities,
  traits
};


