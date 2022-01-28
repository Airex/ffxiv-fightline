import Effects from "src/core/Effects";
import { IJob, Role, AbilityType, IAbility, MapMe } from "../../Models"
import { getAbilitiesFrom, medicine, meleeSharedAbilities } from "./shared"

const statuses = MapMe({
    hellsIngress: {
        duration: 15
    },
    hellsEgress: {
        duration: 15
    },
    arcaneCrest: {
        duration: 5,
        effects: [Effects.shield.party(10)]
    },
    arcaneCircle: {
        duration: 20
    },
    enshroud: {
        duration: 30
    }
});

const abilities: IAbility[] = [
    {
        name: "Hell's Ingress",
        statuses: [statuses.hellsIngress],
        xivDbId: 24401,
        cooldown: 20,
        abilityType: AbilityType.Utility,
        levelAcquired: 20
    },
    {
        name: "Hell's Egress",
        statuses: [statuses.hellsEgress],
        cooldown: 20,
        xivDbId: 24402,
        abilityType: AbilityType.Utility,
        levelAcquired: 20
    },
    {
        name: "Arcane Crest",
        cooldown: 30,
        statuses: [statuses.arcaneCrest],
        xivDbId: 24404,
        abilityType: AbilityType.PartyShield,
        levelAcquired: 40,
    },
    {
        name: "Blood Stalk",
        cooldown: 1,
        xivDbId: 24389,
        abilityType: AbilityType.Damage,
        levelAcquired: 50,
    },
    {
        name: "Grim Swathe",
        cooldown: 1,
        xivDbId: 24392,
        abilityType: AbilityType.Damage,
        levelAcquired: 50,
    },
    {
        name: "Unveiled Gibbet",
        xivDbId: 24390,
        cooldown: 1,
        abilityType: AbilityType.Damage,
        levelAcquired: 70,
    },
    {
        name: "Unveiled Gallows",
        cooldown: 1,
        xivDbId: 24391,
        abilityType: AbilityType.Damage,
        levelAcquired: 70,
    },
    {
        name: "Arcane Circle",
        cooldown: 120,
        xivDbId: 24405,
        statuses: [statuses.arcaneCircle],
        abilityType: AbilityType.PartyDamageBuff,
        levelAcquired: 72,
    },
    {
        name: "Gluttony",
        cooldown: 60,
        xivDbId: 24393,
        abilityType: AbilityType.Damage,
        levelAcquired: 70,
    },
    {
        name: "Enshroud",
        cooldown: 30,
        xivDbId: 24394,
        statuses: [statuses.enshroud],
        abilityType: AbilityType.Damage,
        levelAcquired: 70,
    },
    {
        name: "Lemure's Slice",
        cooldown: 1,
        xivDbId: 24399,
        abilityType: AbilityType.Damage,
        levelAcquired: 70,
    },
    {
        name: "Lemure's Scythe",
        xivDbId: 24400,
        cooldown: 1,
        abilityType: AbilityType.Damage,
        levelAcquired: 70,
    },
];

export const RPR: IJob = {
    name: "RPR",
    fullName: "Reaper",
    role: Role.Melee,

    abilities: [
        ...abilities,
        ...getAbilitiesFrom(meleeSharedAbilities),
        medicine.Strength
    ]
};


