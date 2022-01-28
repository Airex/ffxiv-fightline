import { SharedOverlapStrategy } from "src/core/Overlap";
import { IJob, Role, AbilityType, MapMe } from "../../Models"
import { getAbilitiesFrom, meleeSharedAbilities, medicine } from "./shared"

const statuses = MapMe({
    meikyoShisui: {
        duration: 15
    }
});

const abilities = [
    {
        name: "Meikyo Shisui",        
        cooldown: 55,
        xivDbId: "7499",
        statuses: [statuses.meikyoShisui],
        abilityType: AbilityType.Utility,
        levelAcquired: 50,
        charges: {
            count: 2,
            cooldown: 55
        }
    },
    //    {
    //      name: "Meditate",
    //      duration: 15,
    //      cooldown: 45,
    //      xivDbId: "7497",
    //      
    //      abilityType: AbilityType.Utility,
    //    },
    {
        name: "Ikishoten",
        cooldown: 120,
        xivDbId: "16482",
        abilityType: AbilityType.Utility,
        levelAcquired: 68
    },
    {
        name: "Hissatsu: Guren",
        cooldown: 120,
        xivDbId: "7496",
        abilityType: AbilityType.Damage,
        levelAcquired: 70
    },
    {
        name: "Hissatsu: Senei",
        cooldown: 120,
        xivDbId: "16481",
        abilityType: AbilityType.Damage,
        levelAcquired: 72
    },
    {
        name: "Tsubame-gaeshi",
        cooldown: 60,
        xivDbId: "16483",
        abilityType: AbilityType.Damage,
        levelAcquired: 76,
        charges: {
            count: 2,
            cooldown: 60
        }
    },
    {
        name: "Shoha",
        cooldown: 15,
        xivDbId: "16487",
        overlapStrategy: new SharedOverlapStrategy(["Shoha II"]),
        abilityType: AbilityType.Damage,
        levelAcquired: 80
    },
    {
        name: "Shoha II",
        cooldown: 15,
        xivDbId: 25779,
        overlapStrategy: new SharedOverlapStrategy(["Shoha"]),
        abilityType: AbilityType.Damage,
        levelAcquired: 80
    }, {
        name: "Kaeshi: Namikiri",
        cooldown: 1,
        xivDbId: 25782,
        abilityType: AbilityType.Damage,
        levelAcquired: 90
    },

    ...getAbilitiesFrom(meleeSharedAbilities),
    medicine["Strength"]
];
export const SAM: IJob = {
    name: "SAM",
    fullName: "Samurai",
    role: Role.Melee,
    abilities
};


