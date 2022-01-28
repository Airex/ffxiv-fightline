import Effects from "src/core/Effects";
import { IJob, Role, AbilityType, IAbility, MapMe } from "../../Models"
import { settings, getAbilitiesFrom, healerSharedAbilities, medicine, abilitySortFn } from "./shared"

const statuses = MapMe({
    lightSpeed: {
        duration: 15
    },
    synastry: {
        duration: 20
    },
    divination: {
        duration: 15
    },
    astrodyne: {
        duration: 15
    },
    collectiveUnconscious : {
        duration: 18
    },
    celestialOpposition : {
        duration: 15
    },
    earthlyStar: {
        duration: 20
    },
    horoscope: {
        duration: 30
    },
    neutralSect: {
        duration: 20
    },
    exaltation: {
        duration: 8,
        effects: [Effects.mitigation.solo(10)]
    },
    macrocosmos: {
        duration: 15
    }
});

const abilities = <IAbility[]>[
    {
        name: "Lightspeed",        
        cooldown: 90,
        xivDbId: "3606",
        statuses: [statuses.lightSpeed],
        abilityType: AbilityType.Utility,
        levelAcquired: 6
    },
    {
        name: "Essential Dignity",        
        cooldown: 40,
        xivDbId: "3614",
        abilityType: AbilityType.Healing,
        settings: [settings.target],
        charges: {
            count: 2,
            cooldown: 40
        },
        levelAcquired: 15
    },
    {
        name: "Synastry",        
        cooldown: 120,
        xivDbId: "3612",
        statuses: [statuses.synastry],
        abilityType: AbilityType.Healing,
        settings: [settings.target],
        levelAcquired: 50
    },
    {
        name: "Divination",        
        cooldown: 120,
        xivDbId: "16552",
        statuses: [statuses.divination],
        abilityType: AbilityType.SelfDamageBuff,
        levelAcquired: 50
    },
    {
        name: "Astrodyne",        
        cooldown: 30,
        xivDbId: "25870",
        statuses: [statuses.astrodyne],
        abilityType: AbilityType.Utility | AbilityType.SelfDamageBuff,
        levelAcquired: 50
    },
    {
        name: "Collective Unconscious",        
        cooldown: 60,
        xivDbId: "3613",
        statuses:[statuses.collectiveUnconscious],
        abilityType: AbilityType.PartyDefense,
        defensiveStats: {
            mitigationPercent: 10
        },
        levelAcquired: 58
    },
    {
        name: "Celestial Opposition",        
        cooldown: 60,
        xivDbId: "16553",
        statuses: [statuses.celestialOpposition],
        abilityType: AbilityType.Healing,
        levelAcquired: 60
    },
    {
        name: "Earthly Star",        
        cooldown: 60,
        xivDbId: "7439",
        statuses: [statuses.earthlyStar],
        abilityType: AbilityType.Healing,
        levelAcquired: 62
    },
    <IAbility>{
        name: "Minor Arcana",        
        cooldown: 60,
        xivDbId: "7443",
        requiresBossTarget: true,
        abilityType: AbilityType.Utility,
        levelAcquired: 70
    },
    <IAbility>{
        name: "Celestial Intersection",        
        cooldown: 30,
        xivDbId: "16556",
        abilityType: AbilityType.Healing | AbilityType.PartyShield,
        levelAcquired: 74,
        defensiveStats: {
            shieldPercent: 10 //todo: review this value
        },
        charges: {
            count: 2,
            cooldown: 30
        }
    },
    {
        name: "Horoscope",        
        cooldown: 60,
        xivDbId: "16557",
        statuses: [statuses.horoscope],
        abilityType: AbilityType.Healing,
        levelAcquired: 76
    },
    {
        name: "Neutral Sect",        
        cooldown: 120,
        xivDbId: "16559",
        statuses: [statuses.neutralSect],
        abilityType: AbilityType.HealingBuff,
        levelAcquired: 80
    },
    <IAbility>{
        name: "Exaltation",        
        cooldown: 60,
        xivDbId: "25873",
        abilityType: AbilityType.SelfDefense | AbilityType.TargetDefense,
        levelAcquired: 86,      
        settings: [settings.target],
        statuses:[statuses.exaltation]  
    },
    <IAbility>{
        name: "Macrocosmos",        
        cooldown: 180,
        xivDbId: 25874,
        abilityType: AbilityType.Healing | AbilityType.Damage,
        levelAcquired: 90,
        statuses:[statuses.macrocosmos]  
    },
    ...getAbilitiesFrom(healerSharedAbilities),
    medicine["Mind"]
];
export const AST: IJob = {
    name: "AST",
    fullName: "Astrologian",
    role: Role.Healer,
    abilities
};


