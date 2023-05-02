import { Holders } from "./Holders";
import * as _ from "lodash";
import {
  AbilityMap,
  AbilityUsageMap,
  BossAttackMap,
  IAbilityAvailabilityMapData,
  JobMap,
} from "./Maps";
import {
  IAbility,
  IJob,
  IEffectVisitor,
  DamageType,
  IMitigator,
  SettingsEnum,
  MitigationCalculateContent as MitigationCalculateContext,
  MitigationVisitorContext,
  Role,
  AbilityType,
} from "./Models";
import { Utils } from "./Utils";
import { calculateDuration } from "./Durations";
import {
  cantUseOnSelfWarning,
  deathWarning,
  duplicateMitigationWarning,
} from "src/Warnings";

export type DefsCalcResultAbility = {
  jobId: string;
  start?: Date;
  jobName: string;
  ability: IAbility;
  id: string;
  valid: boolean;
};

export type MitigationForAttack = {
  name: string;
  id: string;
  mitigation: number;
  shield: number;
  icon: string;
};

export type Warning = {
  message: string;
  type: "death" | "warning";
  category?: string;
  icon?: string;
  source?: string;
  priority?: number;
};

export type MitigationsResult = {
  mitigations: MitigationForAttack[];
  warnings: Warning[];
};

export type Range = { start: Date; end: Date };

export type DefsCalcResult = {
  attackId: string;
  defs: {
    jobId: string;
    job: IJob;
    abilities: DefsCalcResultAbility[];
  }[];
};

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

export function intersect(a: Range, b: Range) {
  if (b.start > a.end || a.start > b.end) {
    return;
  } else {
    const os = Math.max(a.start.valueOf(), b.start.valueOf());
    const oe = Math.min(a.end.valueOf(), b.end.valueOf());
    return { start: new Date(os), end: new Date(oe) } as Range;
  }
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

function isCaster(job: JobMap) {
  return job.job.role === Role.Caster || job.job.role === Role.Healer;
}

function isTank(job: JobMap) {
  return job.job.role === Role.Tank;
}

function traitModifiers(job: JobMap, level: number) {
  // maim and mend trait
  if (isCaster(job)) {
    if (level >= 40) return 1.3;
    if (level >= 20) return 1.1;
    return 1;
  }
  return 1;
}

function attackModifier(job: JobMap) {
  switch (job.job.name) {
    case "GLA":
      return 95;
    case "PGL":
      return 100;
    case "MRD":
      return 100;
    case "LNC":
      return 105;
    case "ARC":
      return 105;
    case "CNJ":
      return 105;
    case "THM":
      return 105;
    case "PLD":
      return 100;
    case "MNK":
      return 110;
    case "WAR":
      return 105;
    case "DRG":
      return 115;
    case "BRD":
      return 115;
    case "WHM":
      return 115;
    case "BLM":
      return 115;
    case "ACN":
      return 105;
    case "SMN":
      return 115;
    case "SCH":
      return 115;
    case "ROG":
      return 100;
    case "NIN":
      return 110;
    case "MCH":
      return 115;
    case "DRK":
      return 105;
    case "AST":
      return 115;
    case "SAM":
      return 112;
    case "RDM":
      return 115;
    case "BLU":
      return 115;
    case "GNB":
      return 100;
    case "DNC":
      return 115;
    case "RPR":
      return 115;
    case "SGE":
      return 115;
    default:
      return 0;
  }
}

const levelModifiers = {
  1: { Main: 20, Sub: 56, Div: 56 },
  2: { Main: 21, Sub: 57, Div: 57 },
  3: { Main: 22, Sub: 60, Div: 60 },
  4: { Main: 24, Sub: 62, Div: 62 },
  5: { Main: 26, Sub: 65, Div: 65 },
  6: { Main: 27, Sub: 68, Div: 68 },
  7: { Main: 29, Sub: 70, Div: 70 },
  8: { Main: 31, Sub: 73, Div: 73 },
  9: { Main: 33, Sub: 76, Div: 76 },
  10: { Main: 35, Sub: 78, Div: 78 },
  11: { Main: 36, Sub: 82, Div: 82 },
  12: { Main: 38, Sub: 85, Div: 85 },
  13: { Main: 41, Sub: 89, Div: 89 },
  14: { Main: 44, Sub: 93, Div: 93 },
  15: { Main: 46, Sub: 96, Div: 96 },
  16: { Main: 49, Sub: 100, Div: 100 },
  17: { Main: 52, Sub: 104, Div: 104 },
  18: { Main: 54, Sub: 109, Div: 109 },
  19: { Main: 57, Sub: 113, Div: 113 },
  20: { Main: 60, Sub: 116, Div: 116 },
  21: { Main: 63, Sub: 122, Div: 122 },
  22: { Main: 67, Sub: 127, Div: 127 },
  23: { Main: 71, Sub: 133, Div: 133 },
  24: { Main: 74, Sub: 138, Div: 138 },
  25: { Main: 78, Sub: 144, Div: 144 },
  26: { Main: 81, Sub: 150, Div: 150 },
  27: { Main: 85, Sub: 155, Div: 155 },
  28: { Main: 89, Sub: 162, Div: 162 },
  29: { Main: 92, Sub: 168, Div: 168 },
  30: { Main: 97, Sub: 173, Div: 173 },
  31: { Main: 101, Sub: 181, Div: 181 },
  32: { Main: 106, Sub: 188, Div: 188 },
  33: { Main: 110, Sub: 194, Div: 194 },
  34: { Main: 115, Sub: 202, Div: 202 },
  35: { Main: 119, Sub: 209, Div: 209 },
  36: { Main: 124, Sub: 215, Div: 215 },
  37: { Main: 128, Sub: 223, Div: 223 },
  38: { Main: 134, Sub: 229, Div: 229 },
  39: { Main: 139, Sub: 236, Div: 236 },
  40: { Main: 144, Sub: 244, Div: 244 },
  41: { Main: 150, Sub: 253, Div: 253 },
  42: { Main: 155, Sub: 263, Div: 263 },
  43: { Main: 161, Sub: 272, Div: 272 },
  44: { Main: 166, Sub: 283, Div: 283 },
  45: { Main: 171, Sub: 292, Div: 292 },
  46: { Main: 177, Sub: 302, Div: 302 },
  47: { Main: 183, Sub: 311, Div: 311 },
  48: { Main: 189, Sub: 322, Div: 322 },
  49: { Main: 196, Sub: 331, Div: 331 },
  50: { Main: 202, Sub: 341, Div: 341 },
  51: { Main: 204, Sub: 342, Div: 366 },
  52: { Main: 205, Sub: 344, Div: 392 },
  53: { Main: 207, Sub: 345, Div: 418 },
  54: { Main: 209, Sub: 346, Div: 444 },
  55: { Main: 210, Sub: 347, Div: 470 },
  56: { Main: 212, Sub: 349, Div: 496 },
  57: { Main: 214, Sub: 350, Div: 522 },
  58: { Main: 215, Sub: 351, Div: 548 },
  59: { Main: 217, Sub: 352, Div: 574 },
  60: { Main: 218, Sub: 354, Div: 600 },
  61: { Main: 224, Sub: 355, Div: 630 },
  62: { Main: 228, Sub: 356, Div: 660 },
  63: { Main: 236, Sub: 357, Div: 690 },
  64: { Main: 244, Sub: 358, Div: 720 },
  65: { Main: 252, Sub: 359, Div: 750 },
  66: { Main: 260, Sub: 360, Div: 780 },
  67: { Main: 268, Sub: 361, Div: 810 },
  68: { Main: 276, Sub: 362, Div: 840 },
  69: { Main: 284, Sub: 363, Div: 870 },
  70: { Main: 292, Sub: 364, Div: 900 },
  71: { Main: 296, Sub: 365, Div: 940 },
  72: { Main: 300, Sub: 366, Div: 980 },
  73: { Main: 305, Sub: 367, Div: 1020 },
  74: { Main: 310, Sub: 368, Div: 1060 },
  75: { Main: 315, Sub: 370, Div: 1100 },
  76: { Main: 320, Sub: 372, Div: 1140 },
  77: { Main: 325, Sub: 374, Div: 1180 },
  78: { Main: 330, Sub: 376, Div: 1220 },
  79: { Main: 335, Sub: 378, Div: 1260 },
  80: { Main: 340, Sub: 380, Div: 1300 },
  81: { Main: 345, Sub: 382, Div: 1360 },
  82: { Main: 350, Sub: 384, Div: 1420 },
  83: { Main: 355, Sub: 386, Div: 1480 },
  84: { Main: 360, Sub: 388, Div: 1540 },
  85: { Main: 365, Sub: 390, Div: 1600 },
  86: { Main: 370, Sub: 392, Div: 1660 },
  87: { Main: 375, Sub: 394, Div: 1720 },
  88: { Main: 380, Sub: 396, Div: 1780 },
  89: { Main: 385, Sub: 398, Div: 1840 },
  90: { Main: 390, Sub: 400, Div: 190 },
};

class HealIncreaseVisitor implements IEffectVisitor {
  constructor(private holders: Holders) {}

  accept(mitigator: IMitigator, context: MitigationCalculateContext): void {
    const self = this;
    mitigator.apply({
      holders: this.holders,
      jobId: context.jobId,
      attackAt: context.attackAt,
      abilityId: context.abilityId,
      addMitigationForTarget: function (
        value: number,
        damageType: DamageType
      ): void {},
      addMitigationForParty: function (
        value: number,
        damageType: DamageType
      ): void {},
      addShieldForTarget: function (value: number, hpFromJob?: string): void {},
      addShieldForParty: function (value: number, hpFromJob?: string): void {},
      addAbsorbFromAbilityForTarget: function (value: number): void {},
      addAbsorbFromAbilityForParty: function (value: number): void {},
      addHealIncreaseForTarget: function (value: number): void {
        self.Values[context.target] = self.Values[context.target] || { value: 1, affectedBy: [] };
        self.Values[context.target].value *= value / 100;
        self.Values[context.target].affectedBy.push(context.abilityId);
      },
      addHealIncreaseForParty: function (value: number): void {
        self.holders.jobs.getAll().forEach((job) => {
          self.Values[job.id] = self.Values[job.id] || { value: 1, affectedBy: [] };
          self.Values[job.id].value *= value / 100;
          self.Values[job.id].affectedBy.push(context.abilityId);
        });
      },
    });
  }
  delay(value: number): void {}

  public Values: Record<string, { value: number; affectedBy: string[] }> = {};
}
class MitigationVisitor implements IEffectVisitor {
  constructor(private holders: Holders) {}

  public partyMitigation = -1;
  public partyAbsorbed = 0;
  public partyShield = 0;
  public sums: Record<
    string,
    { absorbed: number; shield: number; mitigation: number }
  > = {};

  initTarget(target: string) {
    if (!this.sums[target]) {
      this.sums[target] = {
        absorbed: 0,
        shield: 0,
        mitigation: 1,
      };
    }
  }

  addShield(target: string, value: number) {
    if (target === "party") {
      this.partyShield += value;
      return;
    }

    this.initTarget(target);
    this.sums[target].shield += value;
  }

  addMitigation(target: string, value: number) {
    if (target === "party") {
      this.partyMitigation *= 1 - value;
      return;
    }

    this.initTarget(target);
    this.sums[target].mitigation *= 1 - value;
  }

  addAbsorb(target: string, value: number) {
    if (target === "party") {
      this.partyAbsorbed += value;
      return;
    }

    this.initTarget(target);
    this.sums[target].absorbed += value;
  }

  calculateAbsorbFromTargetHp(target: string, vl: number) {
    const targetStats = this.holders.jobs.get(target).stats;
    const absorb = ((targetStats?.hp || 0) * vl) / 100;
    return absorb;
  }

  calculateAbsorbFromPotency(
    context: MitigationCalculateContext,
    value: number
  ) {
    const jobMap = this.holders.jobs.get(context.jobId);
    const jobStats = jobMap.stats;
    const ab = this.holders.itemUsages.get(context.abilityId);
    const potency =
      context.effect?.potency ||
      context.status?.potency ||
      ab.ability.ability.potency;

    const healingBuffs = this.holders.itemUsages.filter(
      (item) =>
        item.ability.hasAnyValue(
          AbilityType.HealingBuff,
          AbilityType.PartyHealingBuff
        ) && item.checkCoversDate(ab.start)
    );

    const visitor = new HealIncreaseVisitor(this.holders);
    healingBuffs.forEach((item) => {
      const target =
        item.getSettingData("target")?.value || item.ability.job.id;
      const lc = { ...context, target };
      item.ability.ability.statuses?.forEach((status) => {
        status.effects?.forEach((effect) => {
          effect.visit(visitor, lc);
        });
      });
    });

    const modifier = 1 + (visitor.Values[context.jobId]?.value || 0);

    const lvlModifier = levelModifiers[context.level];

    var detVal =
      Math.floor(
        (140 * (jobStats.determination - lvlModifier.Main)) / lvlModifier.Div
      ) / 10000;
    var tenVal = isTank(jobMap)
      ? Math.floor(
          (100 * (jobStats.tenacity - lvlModifier.Sub)) / lvlModifier.Div
        ) / 10000
      : 0;

    var ap = jobStats.attackMagicPotency;
    var weaponDamage =
      Math.floor(
        (lvlModifier.Main * attackModifier(jobMap)) / 1000.0 +
          jobStats.weaponDamage
      ) / 100.0;
    var healPot =
      Math.floor((569.0 * (ap - lvlModifier.Main)) / 1522.0 + 100) / 100.0;
    var normalHeal = Math.floor(
      Math.floor(
        Math.floor(Math.floor(100 * healPot * weaponDamage) * (1 + detVal)) *
          (1 + tenVal)
      ) * (isCaster(jobMap) ? traitModifiers(jobMap, context.level) : 1)
    );

    return (
      (Number.isNaN(modifier) ? 1 : modifier) *
      normalHeal *
      (value / 100) *
      (potency / 100)
    );
  }

  delay(value: number) {}

  accept(mitigator: IMitigator, context: MitigationCalculateContext) {
    const self = this;
    const visitorContext = {
      jobId: context.jobId,
      abilityId: context.abilityId,
      attackAt: context.attackAt,
      holders: self.holders,
      addMitigationForTarget(value: number, damageType: DamageType) {
        if (context.target) {
          if (
            damageType === DamageType.None ||
            damageType === DamageType.All ||
            (damageType & context.damageType) === damageType
          ) {
            self.addMitigation(context.target, (value || 0) / 100);
          }
        }
      },
      addMitigationForParty(value: number, damageType: DamageType) {
        if (
          damageType === DamageType.None ||
          damageType === DamageType.All ||
          (damageType & context.damageType) === damageType
        ) {
          self.addMitigation("party", (value || 0) / 100);
        }
      },
      addShieldForTarget(value: number, hpFromJob?: string) {
        if (context.target) {
          self.addShield(context.target, value || 0);
          self.addAbsorb(
            context.target,
            self.calculateAbsorbFromTargetHp(
              hpFromJob || context.target,
              value || 0
            )
          );
        }
      },
      addShieldForParty(value: number, hpFromJob?: string) {
        self.addShield("party", value || 0);
        self.holders.jobs.getAll().forEach((j) => {
          self.addAbsorb(
            j.id,
            self.calculateAbsorbFromTargetHp(hpFromJob || j.id, value || 0)
          );
        });
      },
      addAbsorbFromAbilityForTarget(value: number) {
        if (context.target) {
          self.addAbsorb(
            context.target,
            self.calculateAbsorbFromPotency(context, value)
          );
        }
      },
      addAbsorbFromAbilityForParty(value: number) {
        self.holders.jobs.getAll().forEach((j) => {
          self.addAbsorb(j.id, self.calculateAbsorbFromPotency(context, value));
        });
      },
      addHealIncreaseForParty(value) {},
      addHealIncreaseForTarget(value) {},
    } as MitigationVisitorContext;

    mitigator.apply(visitorContext);
  }

  public build() {
    const defStats = this.holders.jobs.getAll().map((jobMap) => {
      const agg = this.sums[jobMap.id];
      const mitigationValue =
        agg?.mitigation === undefined ? 1 : agg?.mitigation;

      const mitigation = 1 - Math.abs(mitigationValue * this.partyMitigation);
      const shield = (agg?.absorbed || 1) / jobMap?.stats.hp || 0;

      return {
        name: jobMap?.job.name,
        id: jobMap.id,
        mitigation: Number(mitigation.toFixed(3)),
        shield: Number(shield.toFixed(3)),
        icon: jobMap?.job.icon,
      };
    });
    return defStats;
  }
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
      target: target,
      abilityId: a.id,
      jobId: a.jobId,
      damageType: attack.type,
      attackAt: bossAttackStart,
      level: holders.level || 90,
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
