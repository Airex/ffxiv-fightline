import { Holders } from "../Holders";
import * as _ from "lodash";
import {
  AbilityMap,
  AbilityUsageMap,
  BossAttackMap,
  IAbilityAvailabilityMapData,
  JobMap,
} from "../Maps";
import {
  SettingsEnum,
  Role,
  MitigationCalculateContext,
} from "../Models";
import { Utils } from "../Utils";
import {
  cantUseOnSelfWarning,
  deathWarning,
  duplicateMitigationWarning,
} from "src/Warnings";
import { DefsCalcResult, DefsCalcResultAbility, MitigationsResult, Warning, MitigationForAttack, Range, intersect } from "./types";
import { MitigationVisitor } from "./visitors";
import { calculateDuration } from "../Durations/functions";

export const getAvailabilitiesForAbility =
  (
    holders: Holders,
    startDate: Date,
    exceptId: string | undefined = undefined
  ) =>
  (it: AbilityMap) => {
    if (it.isStance) {
      return;
    }
    if (!it.ability.charges) {
      const deps = it.ability.overlapStrategy.getDependencies();
      return processStandardAbility(holders, startDate)(it, deps, exceptId);
    } else {
      return processChargesAbility(holders)(it);
    }
  };

export const processChargesAbility = (holders: Holders) => (it: AbilityMap) => {
  const usages = [
    // ...this.getDependencies(deps, it.job),
    ...holders.itemUsages.getByAbility(it.id),
  ].sort((a, b) => a.startAsNumber - b.startAsNumber);

  const maxCharges = it.ability.charges.count;
  let chargesCount = it.ability.charges.initialCount || maxCharges;
  const cooldown = it.ability.charges.cooldown;

  let nextIncreaseDate: Date = null;

  const ranges: Range[] = [];

  usages.forEach((u) => {
    if (chargesCount === 0 && u.start < nextIncreaseDate) {
      u.applyData({ warning: true });
      return;
    }

    while (nextIncreaseDate && nextIncreaseDate < u.start) {
      chargesCount++;
      if (chargesCount < maxCharges) {
        nextIncreaseDate = new Date(
          nextIncreaseDate.valueOf() + cooldown * 1000
        );
      } else {
        nextIncreaseDate = null;
      }
    }

    chargesCount--;
    if (!nextIncreaseDate) {
      nextIncreaseDate = new Date(u.start.valueOf() + cooldown * 1000);
    }

    if (chargesCount === 0) {
      ranges.push({ start: u.start, end: nextIncreaseDate });
    }
  });

  const result = ranges.map((value) => {
    // const id = this.idgen.getNextId(M.EntryType.AbilityAvailability);
    const data = {
      start: value.start,
      end: value.end,
      available: false,
    } as IAbilityAvailabilityMapData;
    return {
      it,
      data,
    };
  });
  return result;
};

const getDependencies = (holders: Holders) => (deps: string[], job: JobMap) => {
  let depUsages: AbilityUsageMap[] = [];
  if (deps) {
    depUsages = _.flatten(
      deps.map((ab) => {
        const ability = holders.abilities.getByParentAndAbility(job.id, ab);
        if (!ability) {
          return [];
        }
        const abilityId = ability.id;
        return holders.itemUsages.getByAbility(abilityId);
      })
    );
  }
  return depUsages;
};

export const processStandardAbility =
  (holders: Holders, startDate: Date) =>
  (it: AbilityMap, deps: string[], exceptId?: string) => {
    const end =
      startDate.valueOf() +
      30 * 60 * 1000 +
      it.ability.cooldown * 1000 +
      calculateDuration(it.ability) * 1000;
    const usages = [
      ...getDependencies(holders)(deps, it.job),
      ...holders.itemUsages
        .getByAbility(it.id)
        .filter((f) => f.id !== exceptId),
      {
        startAsNumber: end,
      } as AbilityUsageMap,
    ].sort((a, b) => a.startAsNumber - b.startAsNumber);

    if (usages.length - 1 === 0) {
      return;
    }

    const minus30 = new Date((startDate.valueOf() as number) - 30 * 1000);

    let prev: AbilityUsageMap = null;
    const maps = usages
      .map((c) => {
        const start =
          prev && prev.end
            ? prev.end
            : it.ability.requiresBossTarget
            ? startDate
            : minus30;
        const diff = (c.startAsNumber - (start.valueOf() as number)) / 1000;
        const av = diff > it.ability.cooldown;
        prev = c;
        if (av) {
          return {
            it,
            data: {
              start,
              end: new Date(c.startAsNumber - it.ability.cooldown * 1000),
              available: true,
            } as IAbilityAvailabilityMapData,
          };
        }
        return null;
      })
      .filter((i) => !!i);
    return maps;
  };

export function calculateDefsForAttack(
  holders: Holders,
  attackId: string
): DefsCalcResult {
  const bossAttack = holders.bossAttacks.get(attackId);

  if (!bossAttack) {
    return {
      attackId,
      defs: [],
    };
  }

  const defAbilities = holders.itemUsages.filter((it) => it.ability.isDef);

  const intersected = defAbilities.filter((it) => {
    return it.ability.ability.statuses?.some((st) => {
      const end = new Date(it.startAsNumber + st.duration * 1000);
      return it.start <= bossAttack.start && end >= bossAttack.start;
    });
  });

  const values = intersected.map((it) => {
    const jobMap = it.ability.job;
    return {
      jobId: jobMap.id,
      start: it.start,
      jobName: jobMap.job.name,
      ability: it.ability.ability,
      id: it.id,
      valid: true,
    } as DefsCalcResultAbility;
  });

  const grouped = Utils.groupBy(values, (x) => x.jobId);

  return {
    attackId,
    defs: Object.keys(grouped)
      .map((value) => {
        return {
          jobId: value,
          job: holders.jobs.get(value).job,
          abilities: grouped[value],
        };
      })
      .sort((a, b) => a.job.role - b.job.role),
  };
}

export function calculateAvailDefsForAttack(
  holders: Holders,
  id: string,
  exceptId?: string
): DefsCalcResult {
  const bossAttack = holders.bossAttacks.get(id);

  if (!bossAttack) {
    return {
      attackId: id,
      defs: [],
    };
  }

  const defAbilities = holders.abilities.filter((it) => {
    return it.isDef;
  });

  const intersected = defAbilities.filter((it) => {
    const availableRanges = getAvailabilitiesForAbility(
      holders,
      new Date(946677600000),
      exceptId
    )(it);
    const duration = calculateDuration(it.ability);
    const minAttack = new Date(bossAttack.startAsNumber - duration * 1000);
    const maxAttack = new Date(bossAttack.startAsNumber);
    const targetRange = { start: minAttack, end: maxAttack } as Range;

    if (!availableRanges) return true;

    const firstIntersected = availableRanges.find((r) =>
      intersect(r.data as Range, targetRange)
    );

    return Boolean(firstIntersected);
  });

  const values = intersected.map((it) => {
    const jobMap = it.job;
    return {
      jobId: jobMap.id,
      jobName: jobMap.job.name,
      ability: it.ability,
      id: it.id,
      valid: true,
    } as DefsCalcResultAbility;
  });

  const grouped = Utils.groupBy(values, (x) => x.jobId);

  return {
    attackId: bossAttack.id,
    defs: Object.keys(grouped)
      .map((value) => {
        return {
          attackId: bossAttack.id,
          jobId: value,
          job: holders.jobs.get(value).job,
          abilities: grouped[value],
        };
      })
      .sort((a, b) => a.job.role - b.job.role),
  };
}

export function getTimeGoodAbilityToUse(
  holders: Holders,
  startDate: Date,
  abilityMap: AbilityMap,
  attack: BossAttackMap,
  exceptId: string = null
) {
  const availableRanges = getAvailabilitiesForAbility(
    holders,
    startDate,
    exceptId
  )(abilityMap);
  const duration = calculateDuration(abilityMap.ability);
  const minAttack = new Date(attack.startAsNumber - duration * 1000);
  const maxAttack = new Date(attack.startAsNumber);
  const targetRange = { start: minAttack, end: maxAttack };
  const firstIntersected = availableRanges
    ?.map((r) => intersect(r.data as Range, targetRange))
    .filter(Boolean)[0];

  const at = firstIntersected?.start || minAttack;
  return at;
}


export function calculateMitigationForAttack(
  holders: Holders,
  defsCalcResult: DefsCalcResult
): MitigationsResult {
  const abs: DefsCalcResultAbility[] = defsCalcResult.defs.flatMap(
    (d) => d.abilities
  );

  const warnings: Warning[] = [];

  const attack = holders.bossAttacks.get(defsCalcResult.attackId);
  const bossAttackStart = attack.start;
  const mitigationVisitor = new MitigationVisitor(holders);

  const tankTarget = holders.bossTargets.getTargetAt(attack.start);
  const isTankBuster = attack.isTankBuster;
  const isAoe = attack.isAoe;
  const isShared = attack.isShareDamage;

  const used = new Set();
  abs.forEach((a) => {
    const targetSetting = holders.itemUsages
      .get(a.id)
      .getSettingData(SettingsEnum.Target);

    const target = targetSetting?.value || a.jobId;
    const targetContext = {
      targetJobId: target,
      sourceAbilityId: a.id,
      sourceJobId: a.jobId,
      attackDamageType: attack.type,
      attackAt: bossAttackStart,
      level: holders.level || 90,
      holders: holders,
    } as MitigationCalculateContext;

    if (a.ability.cantUseOnSelf && target === a.jobId) {
      warnings.push(cantUseOnSelfWarning(a));
      return;
    }

    a.ability.statuses?.forEach((status) => {
      const end = new Date(a.start.valueOf() + status.duration * 1000);
      const covered = a.start <= bossAttackStart && end >= bossAttackStart;
      if (!covered) {
        return;
      }

      if (
        used.has(a.ability.name + targetSetting?.value) ||
        used.has(status.shareGroup)
      ) {
        warnings.push(duplicateMitigationWarning(a));
        return;
      }

      status.effects?.forEach((effect) => {
        effect.visit(mitigationVisitor, { ...targetContext, status, effect });
      });

      if (status?.shareGroup) {
        used.add(status?.shareGroup);
      }
    });
    used.add(a.ability.name + targetSetting?.value);
  });

  const mitigated = mitigationVisitor.build();

  // add warning if attack damage is not set
  if (!attack.damageValue) {
    warnings.push({
      message: `attack damage is not set`,
      category: "Mitigation",
      type: "warning",
      icon: "https://xivapi.com/c/BNpcName.png",
      source: attack.id,
    });
  }

  // create function of delegate below
  const isTargetAffected = (m: MitigationForAttack) => {
    if (isAoe) {
      return true;
    }
    if (isShared) {
      return holders.jobs.get(m.id)?.job?.role === Role.Tank;
    }
    if (isTankBuster) {
      return m.id === tankTarget;
    }
    return true;
  };

  const affectedTargets = mitigated.filter(isTargetAffected);

  // check if mitigation is enough for the attack for each player
  affectedTargets.forEach((m) => {
    const hp = holders.jobs.get(m.id)?.stats.hp || 0;
    if (hp <= 0) {
      // add warning if player hp is not set
      warnings.push({
        message: `hp is not set`,
        category: "Mitigation",
        type: "warning",
        icon: m.icon,
        source: m.id,
      });
      return;
    }

    const hpLeft =
      hp * (m.shield + 1) - attack.damageValue * (1 - m.mitigation); // calculate hp left after attack
    if (hpLeft <= 0) {
      const overkill = Math.abs(hpLeft).toFixed(0);
      const overkillPercent = Math.abs((hpLeft / hp) * 100).toFixed(0);
      warnings.push(deathWarning(overkill, overkillPercent, m.icon, m.id));
    }
  });

  return {
    mitigations: affectedTargets,
    warnings,
  };
}
export { Warning };

