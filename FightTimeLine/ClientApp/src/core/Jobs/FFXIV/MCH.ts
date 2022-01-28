import Effects from "src/core/Effects";
import { IJob, Role, AbilityType, MapMe } from "../../Models"
import { getAbilitiesFrom, rangeSharedAbilities, medicine } from "./shared"


const statuses = MapMe({
    reassemble: {
        duration: 5
    },
    wildfire: {
        duration: 10
    },
    flamethrower: {
        duration: 10
    },
    hypercharge: {
        duration: 8
    },
    tactician: {
        duration: 15,
        shareGroup: "rangeDef",
        effects:[Effects.mitigation.party(10)]
    }
});

const abilities = [
    {
        name: "Reassemble",        
        cooldown: 55,
        xivDbId: "2876",
        statuses: [statuses.reassemble],
        abilityType: AbilityType.SelfDamageBuff,
        levelAcquired: 10
    },
    {
        name: "Gauss Round",
        cooldown: 30,
        xivDbId: "2874",
        requiresBossTarget: true,
        abilityType: AbilityType.Damage,
        charges: {
            count: 3,
            cooldown: 30
        },
        levelAcquired: 15
    },
    {
        name: "Wildfire",        
        cooldown: 120,
        xivDbId: "2878",
        statuses: [statuses.wildfire],
        requiresBossTarget: true,
        abilityType: AbilityType.Damage,
        levelAcquired: 45
    },
    {
        name: "Ricochet",
        cooldown: 30,
        xivDbId: "2890",
        requiresBossTarget: true,
        abilityType: AbilityType.Damage,
        charges: {
            count: 3,
            cooldown: 30
        },
        levelAcquired: 50
    },
    {
        name: "Flamethrower",        
        cooldown: 60,
        xivDbId: "7418",
        statuses: [statuses.flamethrower],
        abilityType: AbilityType.Damage,
        levelAcquired: 70
    },
    {
        name: "Hypercharge",        
        cooldown: 10,
        statuses: [statuses.hypercharge],
        xivDbId: "17209",
        abilityType: AbilityType.SelfDamageBuff,
        levelAcquired: 30
    },
    {
        name: "Tactician",        
        cooldown: 90,
        xivDbId: "16889",
        statuses:[statuses.tactician],
        abilityType: AbilityType.PartyDefense,        
        levelAcquired: 56
    },
    {
        name: "Barrel Stabilizer",
        cooldown: 120,
        xivDbId: "7414",
        requiresBossTarget: true,
        abilityType: AbilityType.Utility,
        levelAcquired: 66
    },
    ...getAbilitiesFrom(rangeSharedAbilities),
    medicine.Dexterity
];
export const MCH: IJob = {
    name: "MCH",
    fullName: "Machinist",
    role: Role.Range,
    abilities
};


