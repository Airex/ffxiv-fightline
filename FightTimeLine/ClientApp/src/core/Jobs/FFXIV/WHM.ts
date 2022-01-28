import Effects from "src/core/Effects";
import { IJob, Role, AbilityType, IAbility, MapMe } from "../../Models"
import { settings, getAbilitiesFrom, healerSharedAbilities, medicine } from "./shared"

const statuses = MapMe({
    divineBenison: {
        duration: 15,
        effects:[Effects.shield.solo(15)]
    },
    asylum: {
        duration: 24
    },
    plenaryIndulgence: {
        duration: 10
    },
    temperance: {
        duration: 20,
        effects: [Effects.mitigation.party(10)]
    },
    thinAir: {
        duration: 12
    },
    presenceOfMind : {
        duration: 15
    },
    aquaveil: {
        duration: 8,
        effects: [Effects.mitigation.solo(15)]
    },
    LiturgyOfTheBell: {
        duration: 15
    }
})

const abilities = [
    {
        name: "Assize",        
        cooldown: 45,
        xivDbId: "3571",
        abilityType: AbilityType.Healing,
        levelAcquired: 56
    },
    {
        name: "Tetragrammaton",        
        cooldown: 60,
        xivDbId: "3570",
        abilityType: AbilityType.Healing,
        settings: [settings.target],
        levelAcquired: 60
    },
    {
        name: "Divine Benison",        
        cooldown: 30,
        xivDbId: "7432",
        abilityType: AbilityType.SelfShield,
        statuses: [statuses.divineBenison],
        settings: [settings.target],        
        charges: {
            count: 2,
            cooldown: 30
        },
        levelAcquired: 66
    },
    {
        name: "Benediction",        
        cooldown: 180,
        xivDbId: "140",
        abilityType: AbilityType.Healing,
        settings: [settings.target],
        levelAcquired: 50
    },
    {
        name: "Afflatus Solace",        
        cooldown: 1,
        xivDbId: "16531",
        abilityType: AbilityType.Healing,
        settings: [settings.target],
        levelAcquired: 52
    },
    {
        name: "Afflatus Rapture",        
        cooldown: 1,
        xivDbId: "16534",
        abilityType: AbilityType.Healing,
        levelAcquired: 76
    },
    {
        name: "Asylum",        
        cooldown: 90,
        xivDbId: "3569",
        statuses: [statuses.asylum],
        abilityType: AbilityType.Healing,
        levelAcquired: 52
    },
    {
        name: "Plenary Indulgence",        
        cooldown: 60,
        xivDbId: "7433",
        statuses: [statuses.plenaryIndulgence],
        abilityType: AbilityType.Healing,
        levelAcquired: 70
    },
    {
        name: "Temperance",        
        cooldown: 120,
        xivDbId: "16536",
        statuses: [statuses.temperance],
        abilityType: AbilityType.HealingBuff | AbilityType.PartyDefense,        
        levelAcquired: 80
    },
    {
        name: "Thin Air",        
        cooldown: 120,
        xivDbId: "7430",
        statuses: [statuses.thinAir],
        abilityType: AbilityType.Utility,
        levelAcquired: 58,
        charges: {
            count: 2,
            cooldown: 60
        }
    },
    {
        name: "Presence of Mind",        
        cooldown: 120,
        xivDbId: "136",
        statuses: [statuses.presenceOfMind],
        abilityType: AbilityType.Utility,
        levelAcquired: 30
    },
    {
        name: "Aquaveil",        
        cooldown: 60,
        xivDbId: 25861,
        statuses: [statuses.aquaveil],
        abilityType: AbilityType.SelfDefense | AbilityType.TargetDefense,        
        levelAcquired: 86
    },
    {
        name: "Liturgy of the Bell",        
        cooldown: 180,
        xivDbId: 25862,
        statuses: [statuses.LiturgyOfTheBell],
        abilityType: AbilityType.Healing,
        levelAcquired: 90
    },
    ...getAbilitiesFrom(healerSharedAbilities),
    medicine.Mind
];
export const WHM: IJob = {
    name: "WHM",
    fullName: "White Mage",
    role: Role.Healer,
    abilities
};


