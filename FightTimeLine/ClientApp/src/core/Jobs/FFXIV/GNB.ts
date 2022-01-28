import Effects from "src/core/Effects";
import { IJob, Role, AbilityType, DamageType, IAbility, MapMe, JobStatuses } from "../../Models"
import { settings, getAbilitiesFrom, tankSharedAbilities, abilitySortFn, medicine } from "./shared"

const statuses = MapMe({
    noMercy: {
        duration: 20
    },
    camouflage: {
        duration: 20,
        effects: [Effects.mitigation.solo(10)]
    },
    nebula: {
        duration: 15,
        effects: [Effects.mitigation.solo(30)]
    },
    aurora: {
        duration: 18,        
    },
    superbolide: {
        duration: 10,
        effects: [Effects.mitigation.solo(100)]
    },
    bowShock: {
        duration: 15        
    },
    heartOfLight: {
        duration: 15,
        effects:[Effects.mitigation.party(10, DamageType.Magical)]
    },
    heartOfCorundum: {
        duration: 8,
        effects: [Effects.mitigation.solo(15)]
    },
    heartOfCorundumClarity: {
        duration: 4,
        effects: [Effects.mitigation.solo(15)]
    }    
});

const abilities = <IAbility[]>[
    {
        name: "No Mercy",        
        cooldown: 60,
        xivDbId: "16138",
        statuses: [statuses.noMercy],
        abilityType: AbilityType.SelfDamageBuff,
        levelAcquired: 2
    },
    {
        name: "Camouflage",        
        cooldown: 90,
        xivDbId: "16140",
        abilityType: AbilityType.SelfDefense,
        statuses: [statuses.camouflage],
        levelAcquired: 6
    },
    {
        name: "Nebula",
        cooldown: 120,
        xivDbId: "16148",
        statuses:[statuses.nebula],
        abilityType: AbilityType.SelfDefense,        
        levelAcquired: 38
    },
    {
        name: "Aurora",        
        cooldown: 60,
        xivDbId: "16151",
        statuses: [statuses.aurora],
        abilityType: AbilityType.Healing,
        settings: [settings.target],
        levelAcquired: 45,
        charges: {
            count: 2,
            cooldown: 60
        }
    },
    {
        name: "Superbolide",        
        cooldown: 360,
        xivDbId: "16152",
        statuses:[statuses.superbolide],
        abilityType: AbilityType.SelfDefense,        
        levelAcquired: 50
    },
    {
        name: "Rough Divide",        
        cooldown: 30,
        xivDbId: "16154",
        abilityType: AbilityType.Damage,
        charges: {
            count: 2,
            cooldown: 30
        },
        levelAcquired: 56
    },
    {
        name: "Bow Shock",        
        cooldown: 60,
        xivDbId: "16159",
        statuses: [statuses.bowShock],
        abilityType: AbilityType.Damage,
        levelAcquired: 62
    },
    {
        name: "Heart of Light",        
        cooldown: 90,
        xivDbId: "16160",
        statuses:[statuses.heartOfLight],
        abilityType: AbilityType.PartyDefense,        
        levelAcquired: 64
    },
    {
        name: "Heart of Corundum",        
        cooldown: 25,
        xivDbId: "25758",
        statuses: [statuses.heartOfCorundum, statuses.heartOfCorundumClarity],
        abilityType: AbilityType.TargetDefense,
        settings: [settings.target],        
        levelAcquired: 68
    },
    {
        name: "Bloodfest",        
        cooldown: 90,
        xivDbId: "16164",
        abilityType: AbilityType.Utility,
        levelAcquired: 76
    },
    {
        name: "Blasting Zone",        
        cooldown: 30,
        xivDbId: "16165",
        abilityType: AbilityType.Damage,
        levelAcquired: 80
    },
    ...getAbilitiesFrom(tankSharedAbilities),
    medicine["Strength"]
];
export const GNB: IJob = {
    name: "GNB",
    fullName: "Gunbreaker",
    role: Role.Tank,
    abilities
};


