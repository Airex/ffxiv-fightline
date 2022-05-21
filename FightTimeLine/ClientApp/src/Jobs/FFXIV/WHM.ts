import Effects from "src/core/Effects";
import { IJob, Role, AbilityType, MapStatuses, IAbility, settings, IJobTemplate } from "../../core/Models";
import { getAbilitiesFrom, healerSharedAbilities, medicine } from "./shared";

const statuses = MapStatuses({
    divineBenison: {
        duration: 15,
        effects: [Effects.shield.solo(15)]
    },
    asylum: {
        duration: 24
    },
    plenaryIndulgence: {
        duration: 10
    },
    temperance: {
        duration: 20,
        effects: [Effects.mitigation.party(10)]
    },
    thinAir: {
        duration: 12
    },
    presenceOfMind : {
        duration: 15
    },
    aquaveil: {
        duration: 8,
        effects: [Effects.mitigation.solo(15)]
    },
    LiturgyOfTheBell: {
        duration: 15
    }
});

const abilities: IAbility[] = [
    {
        name: "Assize",
        translation: {
          de: "Assise",
          jp: "\u30A2\u30B5\u30A4\u30BA",
          en: "Assize",
          fr: "Assises"
        },
        cooldown: 45,
        xivDbId: "3571",
        abilityType: AbilityType.Healing,
        levelAcquired: 56
    },
    {
        name: "Tetragrammaton",
        translation: {
          de: "Tetragrammaton",
          jp: "\u30C6\u30C8\u30E9\u30B0\u30E9\u30DE\u30C8\u30F3",
          en: "Tetragrammaton",
          fr: "T\u00E9tragramme"
        },
        cooldown: 60,
        xivDbId: "3570",
        abilityType: AbilityType.Healing,
        settings: [settings.target],
        levelAcquired: 60
    },
    {
        name: "Divine Benison",
        translation: {
          de: "G\u00F6ttlicher Segen",
          jp: "\u30C7\u30A3\u30F4\u30A1\u30A4\u30F3\u30D9\u30CB\u30BE\u30F3",
          en: "Divine Benison",
          fr: "Faveur divine"
        },
        cooldown: 30,
        xivDbId: "7432",
        abilityType: AbilityType.SelfShield,
        statuses: [statuses.divineBenison],
        settings: [settings.target],
        charges: {
            count: 2,
            cooldown: 30
        },
        levelAcquired: 66
    },
    {
        name: "Benediction",
        translation: {
          de: "Benediktion",
          jp: "\u30D9\u30CD\u30C7\u30A3\u30AF\u30B7\u30E7\u30F3",
          en: "Benediction",
          fr: "B\u00E9n\u00E9diction"
        },
        cooldown: 180,
        xivDbId: "140",
        abilityType: AbilityType.Healing,
        settings: [settings.target],
        levelAcquired: 50
    },
    {
        name: "Afflatus Solace",
        translation: {
          de: "Afflatus solatii",
          jp: "\u30CF\u30FC\u30C8\u30FB\u30AA\u30D6\u30FB\u30BD\u30E9\u30B9",
          en: "Afflatus Solace",
          fr: "Offrande de r\u00E9confort"
        },
        cooldown: 1,
        xivDbId: "16531",
        abilityType: AbilityType.Healing,
        settings: [settings.target],
        levelAcquired: 52
    },
    {
        name: "Afflatus Rapture",
        translation: {
          de: "Afflatus laetitiae",
          jp: "\u30CF\u30FC\u30C8\u30FB\u30AA\u30D6\u30FB\u30E9\u30D7\u30C1\u30E3\u30FC",
          en: "Afflatus Rapture",
          fr: "Offrande de ravissement"
        },
        cooldown: 1,
        xivDbId: "16534",
        abilityType: AbilityType.Healing,
        levelAcquired: 76
    },
    {
        name: "Asylum",
        translation: {
          de: "Refugium",
          jp: "\u30A2\u30B5\u30A4\u30E9\u30E0",
          en: "Asylum",
          fr: "Asile"
        },
        cooldown: 90,
        xivDbId: "3569",
        statuses: [statuses.asylum],
        abilityType: AbilityType.Healing,
        levelAcquired: 52
    },
    {
        name: "Plenary Indulgence",
        translation: {
          de: "Vollkommener Ablass",
          jp: "\u30A4\u30F3\u30C9\u30A5\u30EB\u30B2\u30F3\u30C6\u30A3\u30A2",
          en: "Plenary Indulgence",
          fr: "Indulgence pl\u00E9ni\u00E8re"
        },
        cooldown: 60,
        xivDbId: "7433",
        statuses: [statuses.plenaryIndulgence],
        abilityType: AbilityType.Healing,
        levelAcquired: 70
    },
    {
        name: "Temperance",
        translation: {
          de: "Linderung",
          jp: "\u30C6\u30F3\u30D1\u30E9\u30F3\u30B9",
          en: "Temperance",
          fr: "Temp\u00E9rance"
        },
        cooldown: 120,
        xivDbId: "16536",
        statuses: [statuses.temperance],
        abilityType: AbilityType.HealingBuff | AbilityType.PartyDefense,
        levelAcquired: 80
    },
    {
        name: "Thin Air",
        translation: {
          de: "Ex Machina",
          jp: "\u30B7\u30F3\u30A8\u30A2\u30FC",
          en: "Thin Air",
          fr: "Sponte"
        },
        cooldown: 120,
        xivDbId: "7430",
        statuses: [statuses.thinAir],
        abilityType: AbilityType.Utility,
        levelAcquired: 58,
        charges: {
            count: 2,
            cooldown: 60
        }
    },
    {
        name: "Presence of Mind",
        translation: {
          de: "Geistesgegenwart",
          jp: "\u795E\u901F\u9B54",
          en: "Presence of Mind",
          fr: "Pr\u00E9sence d\u0027esprit"
        },
        cooldown: 120,
        xivDbId: "136",
        statuses: [statuses.presenceOfMind],
        abilityType: AbilityType.Utility,
        levelAcquired: 30
    },
    {
        name: "Aquaveil",
        translation: {
          de: "Wasserschleier",
          jp: "\u30A2\u30AF\u30A2\u30F4\u30A7\u30FC\u30EB",
          en: "Aquaveil",
          fr: "Aquavoile"
        },
        cooldown: 60,
        xivDbId: 25861,
        statuses: [statuses.aquaveil],
        settings: [settings.target],
        abilityType: AbilityType.SelfDefense | AbilityType.TargetDefense,
        levelAcquired: 86
    },
    {
        name: "Liturgy of the Bell",
        translation: {
          de: "Glockenspiel",
          jp: "\u30EA\u30BF\u30FC\u30B8\u30FC\u30FB\u30AA\u30D6\u30FB\u30D9\u30EB",
          en: "Liturgy of the Bell",
          fr: "Tintinnabule"
        },
        cooldown: 180,
        xivDbId: 25862,
        statuses: [statuses.LiturgyOfTheBell],
        abilityType: AbilityType.Healing,
        levelAcquired: 90
    },
    ...getAbilitiesFrom(healerSharedAbilities),
    medicine.Mind
];
export const WHM: IJobTemplate = {

    translation: {
      de: "WMA",
      jp: "WHM",
      en: "WHM",
      fr: "MBL"
    },

    fullNameTranslation: {
      de: "Wei\u00DFmagier",
      jp: "\u767D\u9B54\u9053\u58EB",
      en: "White Mage",
      fr: "Mage Blanc"
    },
    role: Role.Healer,
    abilities
};


