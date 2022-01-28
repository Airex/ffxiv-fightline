import Effects from "src/core/Effects";
import { AbilityType, IAbility, IJob, MapMe, Role } from "../../Models"
import { getAbilitiesFrom, medicine, healerSharedAbilities, settings } from "./shared"

const statuses = MapMe({
    physisII: {
        duration: 15
    },
    soteria: {
        duration: 15
    },
    kerachole: {
        duration: 15,
        effects: [Effects.mitigation.party(10)]
    },
    zoe: {
        duration: 30
    },
    taurochole: {
        duration: 15
    },
    haima: {
        duration: 15,
        effects: [Effects.shield.party(10)]        //todo: review this value
    },
    holos: {
        duration: 20,
        effects: [Effects.mitigation.party(10)]        //todo: review this value
    },
    panhaima: {
        duration: 15,
        effects: [Effects.mitigation.party(10)]        //todo: review this value
    },
    krasis: {
        duration: 10
    }
});


const abilities = <IAbility[]>[
    {
        name: "Kardia",        
        cooldown: 5,
        xivDbId: 24285,
        abilityType: AbilityType.Utility,
        settings: [settings.target],
    },
    {
        name:"Physis II",        
        cooldown: 60,
        xivDbId: 24302,
        statuses: [statuses.physisII],
        abilityType: AbilityType.Healing,
    },
    {
        name:"Soteria",        
        cooldown: 90,
        xivDbId: 24294,
        statuses: [statuses.soteria],
        abilityType: AbilityType.HealingBuff,
    },
    {
        name:"Icarus",
        xivDbId:24295,
        cooldown: 45,
        abilityType: AbilityType.Utility,
    },
    {
        name:"Druochole",        
        cooldown: 1,
        xivDbId: 24296,
        abilityType: AbilityType.Healing,
    },
    {
        name:"Kerachole",        
        cooldown: 30,
        xivDbId: 24298,
        levelAcquired: 50,
        statuses: [statuses.kerachole],
        abilityType: AbilityType.PartyDefense        
    },  
    {
        name:"Ixochole",        
        cooldown: 30,
        xivDbId: 24299,
        levelAcquired: 52,
        abilityType: AbilityType.Healing,        
    },    
    {
        name:"Zoe",        
        cooldown: 90,
        xivDbId: 24300,
        levelAcquired: 56,
        statuses:[statuses.zoe],
        abilityType: AbilityType.HealingBuff,        
    },    
    {
        name:"Pepsis",        
        cooldown: 30,
        xivDbId: 24301,
        levelAcquired: 58,
        abilityType: AbilityType.Healing,        
    },    
    {
        name:"Taurochole",        
        cooldown: 45,
        xivDbId: 24303,
        levelAcquired: 62,
        statuses: [statuses.taurochole],
        settings: [settings.target],
        abilityType: AbilityType.Healing | AbilityType.TargetDefense,        
    },    
    {
        name:"Haima",        
        cooldown: 120,
        xivDbId: 24305,
        levelAcquired: 62,
        settings: [settings.target],
        statuses:[statuses.haima],
        abilityType: AbilityType.SelfShield | AbilityType.PartyShield        
    },    
    {
        name:"Rhizomata",        
        cooldown: 90,
        xivDbId: 24309,
        levelAcquired: 74,        
        abilityType: AbilityType.Utility
    },    
    {
        name:"Holos",        
        cooldown: 120,
        xivDbId: 24310,
        levelAcquired: 76,        
        statuses:[statuses.holos],
        abilityType: AbilityType.PartyDefense | AbilityType.Healing,        
    },    
    {
        name:"Panhaima",        
        cooldown: 120,
        xivDbId: 24311,
        levelAcquired: 80,        
        statuses: [statuses.panhaima],
        abilityType: AbilityType.PartyShield,        
    },    
    {
        name:"Krasis",        
        cooldown: 60,
        xivDbId: 24317,
        levelAcquired: 80,        
        statuses: [statuses.krasis],
        settings: [settings.target],
        abilityType: AbilityType.HealingBuff,
    },
    {
        name: "Pneuma",
        cooldown: 120,
        xivDbId: 24318,
        levelAcquired: 90,
        abilityType: AbilityType.Healing | AbilityType.Damage,
    }

]

export const SGE: IJob = {
    name: "SGE",
    fullName: "Sage",
    role: Role.Healer,
    
    abilities: [
        ...abilities,
        ...getAbilitiesFrom(healerSharedAbilities),
        medicine.Mind
    ]
};


