import Effects from "src/core/Effects";
import { IJob, Role, AbilityType, MapStatuses, IJobTemplate } from "../../core/Models";
import { getAbilitiesFrom, medicine, meleeSharedAbilities } from "./shared";


const statuses = MapStatuses({
    mantra: {
        duration: 15
    },
    perfectBalance: {
        duration: 20
    },
    riddleOofEarth: {
        duration: 10,
        effects: [Effects.shield.solo(10)]
    },
    riddleOfFire: {
        duration: 20
    },
    riddleOfWind: {
        duration: 15
    },
    brotherhood: {
        duration: 15
    }
});

const abilities = [
    {
        name: "Mantra",
        translation: {
          de: "Mantra",
          jp: "\u30DE\u30F3\u30C8\u30E9",
          en: "Mantra",
          fr: "Mantra"
        },
        cooldown: 90,
        xivDbId: "65",
        statuses: [statuses.mantra],
        abilityType: AbilityType.HealingBuff,
        levelAcquired: 42
    },
    {
        name: "Perfect Balance",
        translation: {
          de: "Improvisation",
          jp: "\u8E0F\u9CF4",
          en: "Perfect Balance",
          fr: "\u00C9quilibre parfait"
        },
        cooldown: 40,
        xivDbId: "69",
        statuses: [statuses.perfectBalance],
        abilityType: AbilityType.SelfDamageBuff,
        levelAcquired: 50,
        charges: {
            count: 2,
            cooldown: 40
        }
    },
    {
        name: "Thunderclap",
        translation: {
          de: "Donnersprung",
          jp: "\u629C\u91CD\u6B69\u6CD5",
          en: "Thunderclap",
          fr: "\u00C9lan fulgurant"
        },
        cooldown: 30,
        xivDbId: "25762",
        abilityType: AbilityType.Utility,
        charges: {
            count: 3,
            cooldown: 30
        },
        levelAcquired: 35
    },
    {
        name: "Riddle of Earth",
        translation: {
          de: "Steinernes Enigma",
          jp: "\u91D1\u525B\u306E\u6975\u610F",
          en: "Riddle of Earth",
          fr: "\u00C9nigme de la terre"
        },
        duration: 10,
        cooldown: 30,
        xivDbId: "7394",
        statuses: [statuses.riddleOofEarth],
        abilityType: AbilityType.Utility | AbilityType.SelfShield,
        charges: {
            count: 3,
            cooldown: 30
        },
        levelAcquired: 64
    },
    {
        name: "Riddle of Fire",
        translation: {
          de: "Flammendes Enigma",
          jp: "\u7D05\u84EE\u306E\u6975\u610F",
          en: "Riddle of Fire",
          fr: "\u00C9nigme du feu"
        },
        cooldown: 60,
        xivDbId: "7395",
        statuses: [statuses.riddleOfFire],
        abilityType: AbilityType.SelfDamageBuff,
        levelAcquired: 68
    },
    {
        name: "Riddle of Wind",
        translation: {
          de: "St\u00FCrmendes Enigma",
          jp: "\u75BE\u98A8\u306E\u6975\u610F",
          en: "Riddle of Wind",
          fr: "\u00C9nigme du vent"
        },
        cooldown: 90,
        xivDbId: 25766,
        statuses: [statuses.riddleOfWind],
        abilityType: AbilityType.SelfDamageBuff,
        levelAcquired: 72
    },
    {
        name: "Brotherhood",
        translation: {
          de: "Bruderschaft",
          jp: "\u6843\u5712\u7D50\u7FA9",
          en: "Brotherhood",
          fr: "Fraternit\u00E9"
        },
        cooldown: 120,
        xivDbId: "7396",
        statuses: [statuses.brotherhood],
        abilityType: AbilityType.PartyDamageBuff,
        levelAcquired: 70
    },
    {
        name: "Anatman",
        translation: {
          de: "Anatman",
          jp: "\u7121\u6211",
          en: "Anatman",
          fr: "Anatman"
        },
        cooldown: 60,
        xivDbId: "16475",
        abilityType: AbilityType.Utility,
        levelAcquired: 70
    },
    ...getAbilitiesFrom(meleeSharedAbilities),
    medicine.Strength
];
export const MNK: IJobTemplate = {

    translation: {
      de: "M\u00D6N",
      jp: "MNK",
      en: "MNK",
      fr: "MOI"
    },

    fullNameTranslation: {
      de: "M\u00F6nch",
      jp: "\u30E2\u30F3\u30AF",
      en: "Monk",
      fr: "Moine"
    },
    role: Role.Melee,
    abilities
};


