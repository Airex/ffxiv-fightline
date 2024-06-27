import { byName } from "src/core/AbilityDetectors";
import Effects from "src/core/Defensives/effects";
import { IJob, Role, AbilityType, MapStatuses, IAbility, settings, ITrait, IJobTemplate } from "../../core/Models";
import { getAbilitiesFrom, rangeSharedAbilities, medicine, toAbilities } from "./shared";
import { abilityTrait } from "./traits";

const statuses = MapStatuses({
    ragingStrikes: {
        duration: 20
    },
    barrage: {
        duration: 10
    },
    magesBallad: {
        duration: 45
    },
    armysPaeon: {
        duration: 45
    },
    theWanderersMinuet: {
        duration: 45
    },
    battleVoice: {
        duration: 20
    },
    troubadour: {
        duration: 15,
        shareGroup: "rangeDef",
        effects: [Effects.mitigation.party(10)]
    },
    naturesMinne: {
        duration: 15,
        effects: [Effects.healingIncrease.party(15)]
    },
    radiantFinale: {
        duration: 20
    }
});

const traits = [
  {
    level: 88,
    name: "Enhanced Troubadour",
    apply: abilityTrait("Troubadour", ab => ab.cooldown = 90)
  },
  {
    level: 98,
    name: "Enhanced Troubadour 2",
    apply: abilityTrait("Troubadour", ab => {
      ab.statuses = [
        {
          ...statuses.troubadour,
          effects: [Effects.mitigation.party(15)]
        }
      ]
    })
  },
] as ITrait[];


const abilities: IAbility[] = [
    {
        name: "Raging Strikes",
        translation: {
          de: "W\u00FCtende Attacke",
          ja: "\u731B\u8005\u306E\u6483",
          en: "Raging Strikes",
          fr: "Tir furieux",
          cn: "猛者强击"
        },
        cooldown: 120,
        statuses: [statuses.ragingStrikes],
        xivDbId: "101",
        abilityType: AbilityType.SelfDamageBuff,
        levelAcquired: 4
    },
    {
        name: "Barrage",
        translation: {
          de: "Sperrfeuer",
          ja: "\u4E71\u308C\u6483\u3061",
          en: "Barrage",
          fr: "Rafale de coups",
          cn: "纷乱箭"
        },
        cooldown: 120,
        xivDbId: "107",
        statuses: [statuses.barrage],
        abilityType: AbilityType.Utility,
        levelAcquired: 38
    },
    {
        name: "Mage's Ballad",
        translation: {
          de: "Ballade des Weisen",
          ja: "\u8CE2\u4EBA\u306E\u30D0\u30E9\u30FC\u30C9",
          en: "Mage's Ballad",
          fr: "Ballade du mage",
          cn: "贤者的叙事谣"
        },
        cooldown: 120,
        xivDbId: "114",
        requiresBossTarget: true,
        statuses: [statuses.magesBallad],
        abilityType: AbilityType.PartyDamageBuff,
        relatedAbilities: {
            affects: ["Army's Paeon", "The Wanderer's Minuet"],
            affectedBy: ["Army's Paeon", "The Wanderer's Minuet"],
            parentOnly: true
        },
        levelAcquired: 30
    },
    {
        name: "Army's Paeon",
        translation: {
          de: "Hymne der Krieger",
          ja: "\u8ECD\u795E\u306E\u30D1\u30A4\u30AA\u30F3",
          en: "Army's Paeon",
          fr: "P\u00E9an martial",
          cn: "军神的赞美歌"
        },
        cooldown: 120,
        xivDbId: "116",
        requiresBossTarget: true,
        statuses: [statuses.armysPaeon],
        abilityType: AbilityType.PartyDamageBuff,
        relatedAbilities: {
            affects: ["Mage's Ballad", "The Wanderer's Minuet"],
            affectedBy: ["Mage's Ballad", "The Wanderer's Minuet"],
            parentOnly: true
        },
        levelAcquired: 40
    },
    {
        name: "Battle Voice",
        translation: {
          de: "Ode an die Seele",
          ja: "\u30D0\u30C8\u30EB\u30DC\u30A4\u30B9",
          en: "Battle Voice",
          fr: "Voix de combat",
          cn: "战斗之声"
        },
        cooldown: 120,
        requiresBossTarget: true,
        xivDbId: "118",
        statuses: [statuses.battleVoice],
        abilityType: AbilityType.PartyDamageBuff,
        levelAcquired: 50
    },
    {
        name: "The Wanderer's Minuet",
        translation: {
          de: "Menuett des Wanderers",
          ja: "\u65C5\u795E\u306E\u30E1\u30CC\u30A8\u30C3\u30C8",
          en: "The Wanderer's Minuet",
          fr: "Menuet du Vagabond",
          cn: "放浪神的小步舞曲"
        },
        cooldown: 120,
        xivDbId: "3559",
        statuses: [statuses.theWanderersMinuet],
        abilityType: AbilityType.PartyDamageBuff,
        relatedAbilities: {
            affects: ["Mage's Ballad", "Army's Paeon"],
            affectedBy: ["Mage's Ballad", "Army's Paeon"],
            parentOnly: true
        },
        detectStrategy: byName(["3559"], ["The Wanderer's Minuet", "the Wanderer's Minuet"]),
        levelAcquired: 52
    },
    {
        name: "Sidewinder",
        translation: {
          de: "Seitenschneider",
          ja: "\u30B5\u30A4\u30C9\u30EF\u30A4\u30F3\u30C0\u30FC",
          en: "Sidewinder",
          fr: "Vent venimeux",
          cn: "侧风诱导箭"
        },
        cooldown: 60,
        xivDbId: "3562",
        requiresBossTarget: true,
        abilityType: AbilityType.Damage,
        levelAcquired: 60
    },
    {
        name: "Troubadour",
        translation: {
          de: "Troubadour",
          ja: "\u30C8\u30EB\u30D0\u30C9\u30A5\u30FC\u30EB",
          en: "Troubadour",
          fr: "Troubadour",
          cn: "行吟"
        },
        cooldown: 120,
        requiresBossTarget: true,
        xivDbId: "7405",
        statuses: [statuses.troubadour],
        abilityType: AbilityType.PartyDefense,
        levelAcquired: 62
    },
    {
        name: "Nature's Minne",
        translation: {
          de: "Nophicas Minne",
          ja: "\u5730\u795E\u306E\u30DF\u30F3\u30CD",
          en: "Nature's Minne",
          fr: "Minne de la nature",
          cn: "大地神的抒情恋歌"
        },
        cooldown: 90,
        xivDbId: "7408",
        statuses: [statuses.naturesMinne],
        abilityType: AbilityType.PartyHealingBuff,
        levelAcquired: 66
    },
    {
        name: "Radiant Finale",
        translation: {
          de: "Lumin\u00F6ses Finale",
          ja: "\u5149\u795E\u306E\u30D5\u30A3\u30CA\u30FC\u30EC",
          en: "Radiant Finale",
          fr: "Final radieux",
          cn: "光明神的最终乐章"
        },
        cooldown: 110,
        xivDbId: "25785",
        abilityType: AbilityType.PartyDamageBuff,
        statuses: [statuses.radiantFinale],
        levelAcquired: 90
    },
    ...getAbilitiesFrom(rangeSharedAbilities),
    medicine.Dexterity
];

export const BRD: IJobTemplate = {

    translation: {
      de: "BRD",
      ja: "BRD",
      en: "BRD",
      fr: "BRD",
      cn: "BRD"
    },

    fullNameTranslation: {
      de: "Barde",
      ja: "\u541F\u904A\u8A69\u4EBA",
      en: "Bard",
      fr: "Barde",
      cn: "吟游诗人"
    },
    role: Role.Range,
    traits,
    abilities
};


