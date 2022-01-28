import { byBuffApply } from "src/core/AbilityDetectors";
import { IJob, Role, AbilityType, IAbility, MapMe } from "../../Models"
import { settings, getAbilitiesFrom, medicine, meleeSharedAbilities } from "./shared"


const statuses = MapMe({
    lanceCharge: {
        duration: 20
    },
    lifeSurge: {
        duration: 5
    },
    dragonSight: {
        duration: 20
    },
    battleLitany: {
        duration: 15
    }
});

const abilities = <IAbility[]>[
    {
        name: "Lance Charge",        
        cooldown: 60,
        xivDbId: "85",
        statuses: [statuses.lanceCharge],
        abilityType: AbilityType.SelfDamageBuff,
        levelAcquired: 30
    },
    {
        name: "Life Surge",        
        cooldown: 45,
        xivDbId: "83",
        statuses: [statuses.lifeSurge],
        abilityType: AbilityType.SelfDamageBuff,
        levelAcquired: 6,
        charges: {
            count: 2,
            cooldown: 45
        }
    },
    {
        name: "Dragon Sight",        
        cooldown: 120,
        xivDbId: "10032",
        statuses: [statuses.dragonSight],
        abilityType: AbilityType.PartyDamageBuff | AbilityType.SelfDamageBuff,
        settings: [settings.target],
        detectStrategy: byBuffApply(1001454, "Dragon Sight"),
        levelAcquired: 66
    },
    {
        name: "Battle Litany",        
        cooldown: 120,
        xivDbId: "3557",
        statuses: [statuses.battleLitany],
        abilityType: AbilityType.PartyDamageBuff,
        levelAcquired: 52
    },
    {
        name: "Dragonfire Dive",        
        cooldown: 120,
        xivDbId: "96",
        requiresBossTarget: true,
        abilityType: AbilityType.Damage,
        levelAcquired: 50
    },
    {
        name: "Geirskogul",        
        cooldown: 30,
        xivDbId: "3555",
        requiresBossTarget: true,
        abilityType: AbilityType.Damage,
        levelAcquired: 60
    },
    {
        name: "High Jump",        
        cooldown: 30,
        xivDbId: "16478",
        requiresBossTarget: true,
        abilityType: AbilityType.Damage,
        levelAcquired: 74
    },
    {
        name: "Spineshatter Dive",        
        cooldown: 60,
        xivDbId: "95",
        requiresBossTarget: true,
        abilityType: AbilityType.Damage,
        levelAcquired: 45,
        charges: {
            count: 2,
            cooldown: 60
        }
    },
    {
        name: "Stardiver",        
        cooldown: 30,
        xivDbId: "16480",
        requiresBossTarget: true,
        abilityType: AbilityType.Damage,
        levelAcquired: 80
    },
    {
        name: "Wyrmwind Thrust",        
        cooldown: 10,
        xivDbId: "25773",
        requiresBossTarget: true,
        abilityType: AbilityType.Damage,
        levelAcquired: 90
    },
    ...getAbilitiesFrom(meleeSharedAbilities),
    medicine["Strength"]
];
export const DRG: IJob = {
    name: "DRG",
    fullName: "Dragoon",
    role: Role.Melee,
    abilities
};


