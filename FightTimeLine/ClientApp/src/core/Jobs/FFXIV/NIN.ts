import Effects from "src/core/Effects";
import { IJob, Role, AbilityType, MapMe } from "../../Models"
import { getAbilitiesFrom, meleeSharedAbilities, medicine } from "./shared"

const statuses = MapMe({
    shadeShift: {
        duration: 20,
        effects: [Effects.shield.solo(20)]
    },
    trickAttak : {
        duration: 15
    },
    tenChiJin: {
        duration: 6
    },
    meisui: {
        duration: 30
    },
    bunshin: {
        duration: 30
    }
});

const abilities = [
    {
        name: "Shade Shift",        
        cooldown: 120,
        xivDbId: "2241",
        statuses: [statuses.shadeShift],
        abilityType: AbilityType.SelfShield,        
        levelAcquired: 2
    },
    {
        name: "Mug",        
        cooldown: 120,
        xivDbId: "2248",
        requiresBossTarget: true,
        abilityType: AbilityType.Damage,
        levelAcquired: 15
    },
    // {
    //     name: "Assassinate",        
    //     cooldown: 60,
    //     requiresBossTarget: true,

    //     abilityType: AbilityType.Damage,
    //     levelAcquired: 40
    // },
    {
        name: "Trick Attack",        
        cooldown: 60,
        xivDbId: "2258",
        requiresBossTarget: true,
        statuses: [statuses.trickAttak],
        abilityType: AbilityType.PartyDamageBuff,
        levelAcquired: 18
    },
    {
        name: "Kassatsu",        
        cooldown: 60,
        xivDbId: "2264",
        requiresBossTarget: true,

        abilityType: AbilityType.Damage,
        levelAcquired: 50
    },
    {
        name: "Dream Within a Dream",        
        cooldown: 60,
        xivDbId: "3566",
        requiresBossTarget: true,

        abilityType: AbilityType.Damage,
        levelAcquired: 56
    },
    {
        name: "Bhavacakra",        
        cooldown: 1,
        xivDbId: "7402",
        requiresBossTarget: true,

        abilityType: AbilityType.Damage,
        levelAcquired: 68
    },
    {
        name: "Ten Chi Jin",        
        cooldown: 120,
        xivDbId: "7403",
        requiresBossTarget: true,
        statuses: [statuses.tenChiJin],
        abilityType: AbilityType.SelfDamageBuff,
        levelAcquired: 70
    },
    {
        name: "Meisui",        
        cooldown: 120,
        xivDbId: "16489",
        requiresBossTarget: true,
        statuses: [statuses.meisui],
        abilityType: AbilityType.Utility | AbilityType.SelfDamageBuff,
        levelAcquired: 72
    },
    {
        name: "Bunshin",        
        cooldown: 90,
        xivDbId: "16493",
        requiresBossTarget: true,
        statuses: [statuses.bunshin],
        abilityType: AbilityType.SelfDamageBuff,
        levelAcquired: 80
    },
    ...getAbilitiesFrom(meleeSharedAbilities),
    medicine["Dexterity"]
];
export const NIN: IJob = {
    name: "NIN",
    fullName: "Ninja",
    role: Role.Melee,
    abilities
};


