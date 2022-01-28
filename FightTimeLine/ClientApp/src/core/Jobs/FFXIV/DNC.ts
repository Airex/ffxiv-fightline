import Effects from "src/core/Effects";
import { IJob, Role, AbilityType, IAbility, MapMe, IMitigator, MitigationVisitorContext } from "../../Models"
import { settings, getAbilitiesFrom, rangeSharedAbilities, medicine } from "./shared"

class ImprovisationFinishModifier implements IMitigator {
    constructor(private value: number) {

    }
    apply(context: MitigationVisitorContext) {
        const current = context.holders.itemUsages.get(context.abilityId);
        const improvisation = context.holders.abilities.getByParentAndAbility(context.jobId, "Improvisation");
        const improvisations = context.holders.itemUsages.getByAbility(improvisation.id);
        const found = improvisations.filter(ab => ab.start < current.start).sort((a, b) => b.startAsNumber - a.startAsNumber)[0];
        if (found) {
            const seconds = (current.startAsNumber - found.startAsNumber) / 1000;
            const times = Math.min(5, seconds / 3);
            context.addShieldForParty(this.value + times);
        }
    }
}

const statuses = MapMe({
    shieldSamba: {
        duration: 15,
        shareGroup: "rangeDef",
        effects: [Effects.mitigation.party(10)]
    },
    improvisation: {
        duration: 15
    },
    improvisationFinish: {
        duration: 15,
        effects: [Effects.shield.party(5).withModifier(ImprovisationFinishModifier)]
    },
    devilment: {
        duration: 20
    },
    standardStep: {
        duration: 30,
        effects: [Effects.delay(2)]
    },
    technicalStep: {
        duration: 20,
        effects: [Effects.delay(4)]
    }

});

const abilities: IAbility[] = [
    {
        name: "Shield Samba",
        cooldown: 90,
        xivDbId: "16012",
        statuses: [statuses.shieldSamba],
        abilityType: AbilityType.PartyDefense,
        levelAcquired: 56
    },
    {
        name: "Improvisation",
        cooldown: 120,
        xivDbId: "16014",
        statuses: [statuses.improvisation],
        abilityType: AbilityType.Utility,
        levelAcquired: 80
    },
    {
        name: "Improvised Finish",
        cooldown: 90,
        xivDbId: "25789",
        statuses: [statuses.improvisationFinish],
        abilityType: AbilityType.PartyShield,
        levelAcquired: 80
    },
    {
        name: "Flourish",
        cooldown: 60,
        xivDbId: "16013",
        abilityType: AbilityType.Utility,
        levelAcquired: 72
    },
    {
        name: "Devilment",
        cooldown: 120,
        xivDbId: "16011",
        statuses: [statuses.devilment],
        abilityType: AbilityType.SelfDamageBuff,
        levelAcquired: 62
    },
    {
        name: "Closed Position",
        cooldown: 30,
        xivDbId: "16006",
        abilityType: AbilityType.Utility,
        settings: [settings.target],
        levelAcquired: 60
    },
    {
        name: "Curing Waltz",
        cooldown: 60,
        xivDbId: "16015",
        abilityType: AbilityType.Healing,
        levelAcquired: 52
    },
    {
        name: "Standard Step",
        cooldown: 30,
        xivDbId: "15997",
        statuses: [statuses.standardStep],
        abilityType: AbilityType.SelfDamageBuff,
        levelAcquired: 15
    },
    {
        name: "Technical Step",
        cooldown: 120,
        xivDbId: "15998",
        statuses: [statuses.technicalStep],
        abilityType: AbilityType.SelfDamageBuff | AbilityType.PartyDamageBuff,
        levelAcquired: 70
    },
    ...getAbilitiesFrom(rangeSharedAbilities),
    medicine.Dexterity
];
export const DNC: IJob = {
    name: "DNC",
    fullName: "Dancer",
    role: Role.Range,
    abilities
};


