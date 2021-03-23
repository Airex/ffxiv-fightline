import { Holders } from "./Holders";
import { Utils } from "./Utils";

export function calculateDefsForAttack(holders: Holders, id: string) {
    const bossAttack = holders.bossAttacks.get(id);

    if (!bossAttack) return [];

    const defAbilities = holders.itemUsages.filter((it) => {
        const ab = it.ability;
        return ab.isDef;
    });

    const intersected = defAbilities.filter((it) => {
        const end = new Date(it.startAsNumber + it.calculatedDuration * 1000);
        return it.start <= bossAttack.start && end >= bossAttack.start;
    });

    const values = intersected.map((it) => {
        const jobMap = it.ability.job;
        return {
            jobId: jobMap.id,
            jobName: jobMap.job.name,
            ability: it.ability.ability,
            id: it.id
        };
    });

    const grouped = Utils.groupBy(values, x => x.jobId);

    return Object.keys(grouped).map((value) => {
        return {
            job: holders.jobs.get(value).job,
            abilities: grouped[value]
        };
    }).sort((a, b) => a.job.role - b.job.role);

}

export function calculateAvailDefsForAttack(holders: Holders, id: string) {
    const bossAttack = holders.bossAttacks.get(id);

    if (!bossAttack) return [];

    const defAbilities = holders.abilities.filter((it) => {
        return it.isDef;
    });

    const intersected = defAbilities.filter((it) => {
        const abilities = holders.itemUsages.getByAbility(it.id);
        return !abilities.some(ab => {
            const end = new Date(ab.startAsNumber + ab.ability.ability.cooldown * 1000);
            return ab.start <= bossAttack.start && end >= bossAttack.start;
        })

    });

    const values = intersected.map((it) => {
        const jobMap = it.job;
        return { jobId: jobMap.id, jobName: jobMap.job.name, ability: it.ability, id: it.id };
    });

    const grouped = Utils.groupBy(values, x => x.jobId);

    return Object.keys(grouped).map((value) => {
        return {
            job: holders.jobs.get(value).job,
            abilities: grouped[value]
        };
    }).sort((a, b) => a.job.role - b.job.role);

}