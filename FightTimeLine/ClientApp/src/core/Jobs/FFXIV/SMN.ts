import Effects from "src/core/Effects";
import { IJob, Role, AbilityType, MapMe, IAbility } from "../../Models"
import { getAbilitiesFrom, casterSharedAbilities, medicine } from "./shared"

const statuses = MapMe({
    searingLight : {
        duration: 30
    },
    radiantAegis: {
        duration: 30,
        effects: [Effects.shield.solo(20)]
    }
})

const abilities = <IAbility[]>[
    {
        name: "Searing Light",
        cooldown: 120,
        xivDbId: 25801,
        abilityType: AbilityType.PartyDamageBuff,
        statuses: [statuses.searingLight],
        levelAcquired: 66        
    },
    {
        name: "Radiant Aegis",
        cooldown: 60,
        xivDbId: 25799,
        abilityType: AbilityType.SelfShield,
        statuses: [statuses.radiantAegis],
        levelAcquired: 66        
    },
    {
        name: "Mountain Buster",
        cooldown: 1,
        xivDbId: 0,
        levelAcquired: 86
    },
    {
        name: "Revelation",
        cooldown: 1,
        xivDbId: 0,
        levelAcquired: 80
    },
    {
        name: "Enkindle Phoenix",
        cooldown: 20,
        xivDbId: 0,
        levelAcquired: 80
    },
    {
        name: "Energy Drain",
        cooldown: 30,
        xivDbId: "16508",
        abilityType: AbilityType.Damage,
        levelAcquired: 18
    },    
    ...getAbilitiesFrom(casterSharedAbilities),
    medicine["Intelligence"]
];
export const SMN: IJob = {
    name: "SMN",
    fullName: "Summoner",
    role: Role.Caster,
    abilities
};


