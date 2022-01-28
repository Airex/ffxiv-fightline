import Effects from "src/core/Effects";
import { IJob, Role, AbilityType, IAbility, MapMe, IMitigator, MitigationVisitorContext, DamageType } from "../../Models"
import { settings, abilitySortFn, getAbilitiesFrom, tankSharedAbilities, medicine, SettingsEnum } from "./shared"

class InterventionMitigationModifier implements IMitigator {
    constructor(private value: number, private damagetType: DamageType){

    }
    apply(context: MitigationVisitorContext) {
        const original = context.holders.itemUsages.get(context.abilityId);

        const target = original.getSettingData(SettingsEnum.Target);

        if (!target || !target.value || context.jobId === target.value) return;

        const abs = ["Rampart", "Sentinel"]

        const mts = abs
            .some(abName => {
                const ab = context.holders.abilities.getByParentAndAbility(context.jobId, abName);
                const has = context.holders.itemUsages.getByAbility(ab.id).some(ab => ab.checkCoversDate(original.start))
                return has
            })
        context.addMitigationForTarget(this.value, this.damagetType);
        if (mts)
            context.addMitigationForTarget(10, DamageType.All)                    
    }
}

class CoverMitigationModifier implements IMitigator {
    constructor(private value: number, private damageType: DamageType){

    }
    apply(context: MitigationVisitorContext) {
        const original = context.holders.itemUsages.get(context.abilityId);
        const target = original?.getSettingData(SettingsEnum.Target);
        if (!target || !target.value || context.jobId === target.value) return;

        return context.addMitigationForTarget(this.value, this.damageType);
    }
}

const statuses = MapMe({
    fightOrFlight: {
        duration: 25
    },
    circleOfScorn: {
        duration: 15
    },
    requiescat: {
        duration: 30
    },
    sentinel: {
        duration: 15,
        effects: [Effects.mitigation.solo(30)]
    },
    hallowedGround: {
        duration: 10,
        effects: [Effects.mitigation.solo(100)]
    },
    divineVeil: {
        duration: 30,
        effects: [Effects.shield.party(10)]
    },
    passageOfArms: {
        duration: 18,
        effects: [Effects.mitigation.party(15)]
    },
    cover: {
        duration: 12,
        effects: [Effects.mitigation.solo(100).withModifier(CoverMitigationModifier)]
    },
    holySheltron: {
        duration: 8,
        effects: [Effects.mitigation.solo(18)]
    },
    holySheltronResolve: {
        duration: 4,
        effects: [Effects.mitigation.solo(15)]
    },
    intervention: {
        duration: 8,
        effects: [Effects.mitigation.solo(10).withModifier(InterventionMitigationModifier)]
    },
    interventionResolve: {
        duration: 4,
        effects: [Effects.mitigation.solo(10)]
    }

})

const abilities: IAbility[] = [
    {
        name: "Fight or Flight",
        statuses: [statuses.fightOrFlight],
        cooldown: 60,
        xivDbId: "20",
        abilityType: AbilityType.SelfDamageBuff,
        levelAcquired: 2
    },
    {
        name: "Circle of Scorn",
        cooldown: 30,
        xivDbId: "23",
        statuses: [statuses.circleOfScorn],
        abilityType: AbilityType.Damage,
        levelAcquired: 50
    },
    {
        name: "Requiescat",
        cooldown: 60,
        xivDbId: "7383",
        requiresBossTarget: true,
        statuses: [statuses.requiescat],
        abilityType: AbilityType.SelfDamageBuff | AbilityType.Damage,
        levelAcquired: 68
    },
    {
        name: "Sentinel",
        cooldown: 120,
        xivDbId: "17",
        statuses: [statuses.sentinel],
        abilityType: AbilityType.SelfDefense,
        levelAcquired: 38
    },
    {
        name: "Hallowed Ground",
        cooldown: 420,
        xivDbId: "30",
        statuses: [statuses.hallowedGround],
        abilityType: AbilityType.SelfDefense,
        levelAcquired: 50
    },
    {
        name: "Divine Veil",
        cooldown: 90,
        xivDbId: "3540",
        statuses: [statuses.divineVeil],
        abilityType: AbilityType.PartyShield,
        levelAcquired: 56,
        settings: [settings.activation]
    },
    {
        name: "Passage of Arms",
        cooldown: 120,
        xivDbId: "7385",
        statuses: [statuses.passageOfArms],
        abilityType: AbilityType.PartyDefense,
        levelAcquired: 70
    },
    {
        name: "Cover",
        cooldown: 120,
        xivDbId: "27",
        statuses: [statuses.cover],
        abilityType: AbilityType.TargetDefense,
        settings: [settings.target],
        levelAcquired: 45
    },
    {
        name: "Holy Sheltron",
        cooldown: 8,
        xivDbId: "25746",
        requiresBossTarget: true,
        statuses: [statuses.holySheltron, statuses.holySheltronResolve],
        abilityType: AbilityType.SelfDefense,
        levelAcquired: 35,
        charges: {
            count: 2,
            cooldown: 30
        }
    },
    {
        name: "Intervention",
        cooldown: 10,
        xivDbId: "7382",
        requiresBossTarget: true,
        statuses: [statuses.intervention, statuses.interventionResolve],
        abilityType: AbilityType.TargetDefense,
        settings: [settings.target],
        levelAcquired: 62
    },
    {
        name: "Intervene",
        cooldown: 0,
        xivDbId: "16461",
        requiresBossTarget: true,
        abilityType: AbilityType.Utility,
        charges: {
            count: 2,
            cooldown: 30
        },
        levelAcquired: 74
    },
    {
        name: "Expiacion",
        cooldown: 30,
        xivDbId: "25747",
        abilityType: AbilityType.Damage,
        levelAcquired: 50
    },
    ...getAbilitiesFrom(tankSharedAbilities),
    medicine["Strength"]
];
export const PLD: IJob = {
    name: "PLD",
    fullName: "Paladin",
    role: Role.Tank,
    abilities    
};
