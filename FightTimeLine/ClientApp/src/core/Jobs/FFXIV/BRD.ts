import { byName } from "src/core/AbilityDetectors";
import Effects from "src/core/Effects";
import { SharedOverlapStrategy } from "src/core/Overlap";
import { IJob, Role, AbilityType, MapMe, JobStatuses, IAbility } from "../../Models"
import { settings, getAbilitiesFrom, rangeSharedAbilities, medicine } from "./shared"

const statuses = MapMe({
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
        duration: 15
    },
    troubadour: {
        duration: 15,
        shareGroup: "rangeDef",
        effects: [Effects.mitigation.party(10)]
    },
    naturesMinne: {
        duration: 15
    },
    radiantFinale: {
        duration: 15
    }
});

const abilities: IAbility[] = [
    {
        name: "Raging Strikes",
        cooldown: 120,
        statuses: [statuses.ragingStrikes],
        xivDbId: "101",
        abilityType: AbilityType.SelfDamageBuff,
        levelAcquired: 4
    },
    {
        name: "Barrage",
        cooldown: 120,
        xivDbId: "107",
        statuses: [statuses.barrage],
        abilityType: AbilityType.SelfDamageBuff,
        levelAcquired: 38
    },
    {
        name: "Mage's Ballad",        
        cooldown: 120,
        xivDbId: "114",
        requiresBossTarget: true,
        statuses: [statuses.magesBallad],
        abilityType: AbilityType.Damage,
        relatedAbilities: {
            affects: ["Army's Paeon", "The Wanderer's Minuet"],
            affectedBy: ["Army's Paeon", "The Wanderer's Minuet"],
            parentOnly: true
        },
        levelAcquired: 30
    },
    {
        name: "Army's Paeon",        
        cooldown: 120,
        xivDbId: "116",
        requiresBossTarget: true,
        statuses: [statuses.armysPaeon],
        abilityType: AbilityType.Damage,
        relatedAbilities: {
            affects: ["Mage's Ballad", "The Wanderer's Minuet"],
            affectedBy: ["Mage's Ballad", "The Wanderer's Minuet"],
            parentOnly: true
        },
        levelAcquired: 40
    },
    {
        name: "Battle Voice",        
        cooldown: 120,
        requiresBossTarget: true,
        xivDbId: "118",
        statuses: [statuses.battleVoice],
        abilityType: AbilityType.PartyDamageBuff,
        levelAcquired: 50
    },
    {
        name: "The Wanderer's Minuet",        
        cooldown: 120,
        xivDbId: "3559",
        statuses: [statuses.theWanderersMinuet],
        abilityType: AbilityType.Damage,
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
        cooldown: 60,
        xivDbId: "3562",
        requiresBossTarget: true,
        abilityType: AbilityType.Damage,        
        levelAcquired: 60
    },
    {
        name: "Troubadour",        
        cooldown: 90,
        requiresBossTarget: true,
        xivDbId: "7405",
        statuses: [statuses.troubadour],
        abilityType: AbilityType.PartyDefense,        
        levelAcquired: 62
    },
    {
        name: "Nature's Minne",        
        cooldown: 90,
        xivDbId: "7408",
        statuses: [statuses.naturesMinne],
        abilityType: AbilityType.HealingBuff,
        settings: [settings.target],
        levelAcquired: 66
    },
    {
        name: "Radiant Finale",        
        cooldown: 110,
        xivDbId: "25785",
        abilityType: AbilityType.PartyDamageBuff,
        statuses: [statuses.radiantFinale],
        levelAcquired: 90
    },
    ...getAbilitiesFrom(rangeSharedAbilities),
    medicine["Dexterity"]
];

export const BRD: IJob = {
    name: "BRD",
    fullName: "Bard",
    role: Role.Range,
    abilities
};


