import Effects from "src/core/Effects";
import { IJob, Role, AbilityType, IAbility, MapStatuses, IJobTemplate } from "../../core/Models";
import { getAbilitiesFrom, medicine, meleeSharedAbilities } from "./shared";

const statuses = MapStatuses({
    hellsIngress: {
        duration: 20
    },
    hellsEgress: {
        duration: 20
    },
    arcaneCrest: {
        duration: 5,
        effects: [Effects.shield.party(10)]
    },
    arcaneCircle: {
        duration: 20
    },
    enshroud: {
        duration: 30
    }
});

const abilities: IAbility[] = [
    {
        name: "Hell's Ingress",
        translation: {
          de: "H\u00F6llischer Auftritt",
          jp: "\u30D8\u30EB\u30BA\u30A4\u30F3\u30B0\u30EC\u30B9",
          en: "Hell\u0027s Ingress",
          fr: "Intrusion de l\u0027enfer"
        },
        statuses: [statuses.hellsIngress],
        xivDbId: 24401,
        cooldown: 20,
        abilityType: AbilityType.Utility,
        levelAcquired: 20
    },
    {
        name: "Hell's Egress",
        translation: {
          de: "H\u00F6llischer Abgang",
          jp: "\u30D8\u30EB\u30BA\u30A4\u30FC\u30B0\u30EC\u30B9",
          en: "Hell\u0027s Egress",
          fr: "Retraite de l\u0027enfer"
        },
        statuses: [statuses.hellsEgress],
        cooldown: 20,
        xivDbId: 24402,
        abilityType: AbilityType.Utility,
        levelAcquired: 20
    },
    {
        name: "Arcane Crest",
        translation: {
          de: "Arkanes Wappen",
          jp: "\u30A2\u30EB\u30B1\u30A4\u30F3\u30AF\u30EC\u30B9\u30C8",
          en: "Arcane Crest",
          fr: "Blason arcanique"
        },
        cooldown: 30,
        statuses: [statuses.arcaneCrest],
        xivDbId: 24404,
        abilityType: AbilityType.PartyShield,
        levelAcquired: 40,
    },
    {
        name: "Blood Stalk",
        translation: {
          de: "Knochengarbe",
          jp: "\u30B9\u30C8\u30FC\u30AF\u30B9\u30A6\u30A7\u30FC\u30BA",
          en: "Blood Stalk",
          fr: "F\u00E9tu ensanglant\u00E9"
        },
        cooldown: 1,
        xivDbId: 24389,
        abilityType: AbilityType.Damage,
        levelAcquired: 50,
    },
    {
        name: "Grim Swathe",
        translation: {
          de: "Nachtschwad",
          jp: "\u30B7\u30FC\u30D5\u30B9\u30A6\u30A7\u30FC\u30BA",
          en: "Grim Swathe",
          fr: "Andain sinistre"
        },
        cooldown: 1,
        xivDbId: 24392,
        abilityType: AbilityType.Damage,
        levelAcquired: 50,
    },
    {
        name: "Unveiled Gibbet",
        translation: {
          de: "Richtergriff",
          jp: "\u30B8\u30D3\u30C8\u30A5\u30AF\u30ED\u30A6",
          en: "Unveiled Gibbet",
          fr: "Gibet suppliciant"
        },
        xivDbId: 24390,
        cooldown: 1,
        abilityType: AbilityType.Damage,
        levelAcquired: 70,
    },
    {
        name: "Unveiled Gallows",
        translation: {
          de: "Galgengriff",
          jp: "\u30AE\u30E3\u30ED\u30A6\u30BA\u30AF\u30ED\u30A6",
          en: "Unveiled Gallows",
          fr: "Potence suppliciante"
        },
        cooldown: 1,
        xivDbId: 24391,
        abilityType: AbilityType.Damage,
        levelAcquired: 70,
    },
    {
        name: "Arcane Circle",
        translation: {
          de: "Arkaner Kreis",
          jp: "\u30A2\u30EB\u30B1\u30A4\u30F3\u30B5\u30FC\u30AF\u30EB",
          en: "Arcane Circle",
          fr: "Cercle arcanique"
        },
        cooldown: 120,
        xivDbId: 24405,
        statuses: [statuses.arcaneCircle],
        abilityType: AbilityType.PartyDamageBuff,
        levelAcquired: 72,
    },
    {
        name: "Gluttony",
        translation: {
          de: "V\u00F6llerei",
          jp: "\u30B0\u30E9\u30C8\u30CB\u30FC",
          en: "Gluttony",
          fr: "Gloutonnerie"
        },
        cooldown: 60,
        xivDbId: 24393,
        abilityType: AbilityType.Damage,
        levelAcquired: 70,
    },
    {
        name: "Enshroud",
        translation: {
          de: "Lemurenschleier",
          jp: "\u30EC\u30E0\u30FC\u30EB\u30B7\u30E5\u30E9\u30A6\u30C9",
          en: "Enshroud",
          fr: "Linceul du l\u00E9mure"
        },
        cooldown: 30,
        xivDbId: 24394,
        statuses: [statuses.enshroud],
        abilityType: AbilityType.Damage,
        levelAcquired: 70,
    },
    {
        name: "Lemure's Slice",
        translation: {
          de: "Lemurenschlitzer",
          jp: "\u30EC\u30E0\u30FC\u30EB\u30B9\u30E9\u30A4\u30B9",
          en: "Lemure\u0027s Slice",
          fr: "Tranchage du l\u00E9mure"
        },
        cooldown: 1,
        xivDbId: 24399,
        abilityType: AbilityType.Damage,
        levelAcquired: 70,
    },
    {
        name: "Lemure's Scythe",
        translation: {
          de: "Lemurensense",
          jp: "\u30EC\u30E0\u30FC\u30EB\u30B5\u30A4\u30BA",
          en: "Lemure\u0027s Scythe",
          fr: "Faux du l\u00E9mure"
        },
        xivDbId: 24400,
        cooldown: 1,
        abilityType: AbilityType.Damage,
        levelAcquired: 70,
    },
];

export const RPR: IJobTemplate = {

    translation: {
      de: "SNT",
      jp: "RPR",
      en: "RPR",
      fr: "FCH"
    },

    fullNameTranslation: {
      de: "Schnitter",
      jp: "\u30EA\u30FC\u30D1\u30FC",
      en: "Reaper",
      fr: "Faucheur"
    },
    role: Role.Melee,

    abilities: [
        ...abilities,
        ...getAbilitiesFrom(meleeSharedAbilities),
        medicine.Strength
    ]
};


