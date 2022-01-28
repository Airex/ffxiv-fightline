import Effects from "src/core/Effects";
import { IJob, Role, AbilityType, MapMe } from "../../Models"
import { getAbilitiesFrom, medicine, meleeSharedAbilities } from "./shared"


const statuses = MapMe({
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
        cooldown: 90,
        xivDbId: "65",
        statuses: [statuses.mantra],
        abilityType: AbilityType.HealingBuff,
        levelAcquired: 42
    },
    {
        name: "Perfect Balance",
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
        cooldown: 60,
        xivDbId: "7395",
        statuses: [statuses.riddleOfFire],
        abilityType: AbilityType.SelfDamageBuff,
        levelAcquired: 68
    },
    {
        name: "Riddle of Wind",
        cooldown: 90,
        xivDbId: 25766,
        statuses: [statuses.riddleOfWind],
        abilityType: AbilityType.SelfDamageBuff,
        levelAcquired: 72
    },
    {
        name: "Brotherhood",
        cooldown: 120,
        xivDbId: "7396",
        statuses: [statuses.brotherhood],
        abilityType: AbilityType.PartyDamageBuff,
        levelAcquired: 70
    },
    {
        name: "Anatman",        
        cooldown: 60,
        xivDbId: "16475",
        abilityType: AbilityType.Utility,
        levelAcquired: 70
    },
    ...getAbilitiesFrom(meleeSharedAbilities),
    medicine.Strength
];
export const MNK: IJob = {
    name: "MNK",
    fullName: "Monk",
    role: Role.Melee,
    abilities
};


