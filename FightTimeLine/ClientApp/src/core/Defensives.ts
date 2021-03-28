import * as H from "./Holders";
import * as M from "./Models";
import { SettingsEnum } from "./Jobs/FFXIV/shared";
import { Utils } from "./Utils";
import { DefaultMitigationsModifier } from "./Models";

export function calculateDefsForAttack(holders: H.Holders, id: string) {
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

export function calculateAvailDefsForAttack(holders: H.Holders, id: string) {
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

function abilityMatch(input: M.AbilityType, ...toMatch: M.AbilityType[]) {
    return toMatch.some(tm => (input & tm) === tm);
}

export function calculateMitigationForAttack(holders: H.Holders, defs, attack: M.IBossAbility) {
    var partyMitigation = -1;
    var partyShield = 0;
    var sums = {};
    var abs = defs.reduce((ac, j) => {
        return [...ac, ...j.abilities]
    }, []);
    var used = new Set();
    abs.forEach((a: { ability: M.IAbility, jobId: string, id: string }) => {
        if (used.has(a.ability.name) || used.has(a.ability.defensiveStats?.shareGroup)) return;

        const defensiveStats = (a.ability.defensiveStats?.modifier || DefaultMitigationsModifier)(holders, a.jobId, a.id);

        used.add(a.ability.name);
        if (defensiveStats?.shareGroup)
            used.add(defensiveStats?.shareGroup);

        if (abilityMatch(a.ability.abilityType, M.AbilityType.PartyDefense)) {
            if (partyMitigation === -1) partyMitigation = 1;
            if (attack.type === M.DamageType.None || !defensiveStats?.damageType || (defensiveStats?.damageType === attack.type))
                partyMitigation *= 1 - (defensiveStats?.mitigationPercent || 0) / 100
        }

        if (abilityMatch(a.ability.abilityType, M.AbilityType.PartyShield)) {
            if (partyShield === -1) partyShield = 0;
            partyShield += defensiveStats?.shieldPercent || 0
        }

        if (a.ability.abilityType === M.AbilityType.SelfShield) {
            const settingData = holders.itemUsages.get(a.id).getSettingData(SettingsEnum.Target);
            var jobId = settingData?.value || a.jobId;
            if (jobId) {
                if (!sums[jobId]) sums[jobId] = { shield: 0, mitigation: -1 };
                sums[jobId].shield += defensiveStats?.shieldPercent || 0
            }
        }

        if (abilityMatch(a.ability.abilityType, M.AbilityType.SelfDefense, M.AbilityType.TargetDefense)) {
            const settingData = holders.itemUsages.get(a.id).getSettingData(SettingsEnum.Target);
            var jobId = settingData?.value || a.jobId;
            if (jobId) {
                if (!sums[jobId]) sums[jobId] = { shield: 0, mitigation: -1 };
                if (sums[jobId].mitigation === -1) sums[jobId].mitigation = 1;
                if (attack.type === M.DamageType.None || !defensiveStats?.damageType || (defensiveStats?.damageType === attack.type))
                    sums[jobId].mitigation *= 1 - (defensiveStats?.mitigationPercent || 0) / 100
            }
        }
    });

    var defStats = Object.keys(sums).map(s =>
    ({
        name: holders.jobs.get(s).job.name,
        mitigation: 1 - Math.abs(sums[s].mitigation * partyMitigation),
        shield: sums[s].shield + partyShield,
        icon: holders.jobs.get(s).job.icon
    }));
    defStats.push({
        name: "Party",
        mitigation: 1 - Math.abs(partyMitigation),
        shield: partyShield,
        icon: null
    })

    return defStats;
}