import Effects from "src/core/Effects";
import { IJob, Role, AbilityType, DamageType, MapMe } from "../../Models"
import { settings, getAbilitiesFrom, healerSharedAbilities, medicine } from "./shared"

const statuses = MapMe({
    succor: {
        duration: 30,
        effects: [Effects.shield.party(10)]
    },
    adloquium: {
        duration: 30,
        effects: [Effects.shield.solo(15)]
    },
    whisperingDawn: {
        duration: 21
    },
    feyIllumination: {
        duration: 20,
        effects: [Effects.mitigation.party(5, DamageType.Magical)]
    },
    sacredSoil: {
        duration: 15,
        effects: [Effects.mitigation.party(10)]
    },
    dissipation: {
        duration: 30
    },
    excogitation: {
        duration: 45
    },
    chainStratagem: {
        duration: 15
    },
    recitation: {
        duration: 15
    },
    summonSeraph: {
        duration: 22
    },
    protraction: {
        duration: 10,
        effects: [Effects.shield.party(10)]
    },
    expedient: {
        duration: 20,
        effects: [Effects.mitigation.party(10)]
    },
    consolation: {
        duration: 30,
        effects:[Effects.shield.party(10)]
    }
});

const abilities = [
    {
        name: "Succor",
        cooldown: 30,
        xivDbId: "186",
        statuses: [statuses.succor],
        abilityType: AbilityType.PartyShield,
        levelAcquired: 35
    },
    {
        name: "Adloquium",
        cooldown: 30,
        xivDbId: "185",
        statuses: [statuses.adloquium],
        abilityType: AbilityType.SelfShield,
        levelAcquired: 30
    },
    {
        name: "Whispering Dawn",
        duration: 21,
        cooldown: 60,
        xivDbId: "803",
        statuses: [statuses.whisperingDawn],
        abilityType: AbilityType.Healing,
        levelAcquired: 20
    },
    {
        name: "Fey Illumination",
        cooldown: 120,
        xivDbId: "805",
        statuses: [statuses.feyIllumination],
        abilityType: AbilityType.HealingBuff | AbilityType.PartyDefense,
        levelAcquired: 40
    },
    {
        name: "Aetherflow",
        cooldown: 60,
        requiresBossTarget: true,
        xivDbId: "166",
        abilityType: AbilityType.Utility,
        levelAcquired: 45
    },
    {
        name: "Lustrate",
        cooldown: 1,
        xivDbId: "0189",
        abilityType: AbilityType.Healing,
        settings: [settings.target],
        levelAcquired: 45
    },
    {
        name: "Energy Drain",
        cooldown: 3,
        xivDbId: "0167",
        abilityType: AbilityType.Damage,
        levelAcquired: 45
    },
    {
        name: "Sacred Soil",
        cooldown: 30,
        xivDbId: "188",
        abilityType: AbilityType.PartyDefense,
        levelAcquired: 50
    },
    {
        name: "Indomitability",
        cooldown: 30,
        xivDbId: "3583",
        abilityType: AbilityType.Healing,
        levelAcquired: 52
    },
    {
        name: "Deployment Tactics",
        cooldown: 90,
        xivDbId: "3585",
        abilityType: AbilityType.Healing,
        levelAcquired: 56
    },
    {
        name: "Dissipation",
        cooldown: 180,
        xivDbId: "3587",
        statuses: [statuses.dissipation],
        abilityType: AbilityType.Healing,
        levelAcquired: 60
    },
    {
        name: "Excogitation",
        cooldown: 45,
        xivDbId: "7434",
        requiresBossTarget: false,
        statuses: [statuses.excogitation],
        abilityType: AbilityType.Healing,
        settings: [settings.target],
        levelAcquired: 62
    },
    {
        name: "Chain Stratagem",
        cooldown: 120,
        xivDbId: "7436",
        requiresBossTarget: true,
        statuses: [statuses.chainStratagem],
        abilityType: AbilityType.PartyDamageBuff,
        levelAcquired: 66
    },
    {
        name: "Aetherpact",
        cooldown: 1,
        xivDbId: "7437",
        abilityType: AbilityType.Healing,
        levelAcquired: 70
    },
    {
        name: "Recitation",
        cooldown: 90,
        xivDbId: "16542",
        statuses: [statuses.recitation],
        abilityType: AbilityType.Healing,
        levelAcquired: 74
    },
    {
        name: "Fey Blessing",
        cooldown: 60,
        xivDbId: "16543",
        abilityType: AbilityType.Healing,
        levelAcquired: 75
    },
    {
        name: "Summon Seraph",
        duration: 22,
        cooldown: 120,
        xivDbId: "16545",
        statuses: [statuses.summonSeraph],
        abilityType: AbilityType.Healing,
        levelAcquired: 80
    },
    {
        name: "Consolation",
        cooldown: 30,
        xivDbId: "16546",
        abilityType: AbilityType.Healing | AbilityType.PartyShield,
        charges: {
            count: 2,
            cooldown: 30
        },
        statuses:[statuses.consolation],        
        levelAcquired: 80        
    },
    {
        name: "Protraction",
        cooldown: 60,
        xivDbId: 25867,
        statuses: [statuses.protraction],
        abilityType: AbilityType.PartyShield | AbilityType.HealingBuff,
        levelAcquired: 86
    },
    {
        name: "Expedient",        
        cooldown: 120,
        xivDbId: 25868,
        abilityType: AbilityType.PartyDefense,
        statuses:[statuses.expedient],
        levelAcquired: 90        
    },
    ...getAbilitiesFrom(healerSharedAbilities),
    medicine.Mind
];
export const SCH: IJob = {
    name: "SCH",
    fullName: "Scholar",
    role: Role.Healer,
    abilities
};


