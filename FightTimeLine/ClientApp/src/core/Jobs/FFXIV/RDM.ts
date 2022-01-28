import Effects from "src/core/Effects";
import { IJob, Role, AbilityType, DamageType, MapMe } from "../../Models"
import { getAbilitiesFrom, casterSharedAbilities, medicine } from "./shared"

const statuses = MapMe({
    embolden: {
        duration: 20
    },
    acceleration: {
        duration: 20
    },
    magickBarrier: {
        duration: 10,
        effects: [Effects.mitigation.party(10, DamageType.Magical)]
    }
});

const abilities = [
    {
        name: "Embolden",        
        cooldown: 120,
        xivDbId: "7520",
        statuses: [statuses.embolden],
        abilityType: AbilityType.PartyDamageBuff,
        levelAcquired: 60
    },
    {
        name: "Fleche",
        cooldown: 25,
        xivDbId: "7517",
        requiresBossTarget: true,
        abilityType: AbilityType.Damage,
        levelAcquired: 45
    },
    {
        name: "Contre Sixte",
        cooldown: 35,
        xivDbId: "7519",
        requiresBossTarget: true,
        abilityType: AbilityType.Damage,
        levelAcquired: 56
    },
    {
        name: "Manafication",
        cooldown: 110,
        xivDbId: "7521",
        requiresBossTarget: true,
        abilityType: AbilityType.SelfDamageBuff,
        levelAcquired: 60
    },
    {
        name: "Acceleration",        
        cooldown: 55,
        xivDbId: "7518",
        requiresBossTarget: false,
        statuses: [statuses.acceleration],
        abilityType: AbilityType.Utility,
        levelAcquired: 50,
        charges: {
            count: 2,
            cooldown: 55
        }
    },
    {
        name: "Magick Barrier",        
        cooldown: 120,
        requiresBossTarget: false,
        xivDbId: 25857,
        abilityType: AbilityType.PartyDefense,
        statuses: [statuses.magickBarrier],
        levelAcquired: 86
    },
    ...getAbilitiesFrom(casterSharedAbilities),
    medicine.Intelligence
];
export const RDM: IJob = {
    name: "RDM",
    fullName: "Red Mage",
    role: Role.Caster,
    abilities
};


