import { Holders } from "../Holders";
import {
  AbilityType,
  DamageType,
  IEffectVisitor,
  IMitigator,
  MitigationCalculateContext,
  MitigationVisitorContext,
} from "../Models";
import {
  attackModifier,
  isCaster,
  isTank,
  levelModifiers,
  traitModifiers,
} from "./jobValues";
import { MitigationForAttack, emptyVisitorContextFunction } from "./types";

export type HealIncreaseContainer = {
  outgoingModifier?: number;
  incomingModifier?: number;
};

type MitigationSum = {
  absorbed: number;
  mitigation: number;
  hpIncrease?: number;
};

export class HealIncreaseVisitor implements IEffectVisitor {
  public Values: Record<string, HealIncreaseContainer> = {};

  constructor(private holders: Holders) {}

  accept(mitigator: IMitigator, context: MitigationCalculateContext): void {
    const self = this;
    const addOutgoingHeal = (target: string, value: number) => {
      self.Values[target] = self.Values[target] || {};
      self.Values[target].outgoingModifier =
        self.Values[target].outgoingModifier || 1;
      self.Values[target].outgoingModifier *= 1 + value / 100;
    };
    const addIncomingHeal = (target: string, value: number) => {
      self.Values[target] = self.Values[target] || {};
      self.Values[target].incomingModifier =
        self.Values[target].incomingModifier || 1;
      self.Values[target].incomingModifier *= 1 + value / 100;
    };

    mitigator.apply({
      ...emptyVisitorContextFunction,
      ...context,
      addHealIncreaseForTarget(value: number): void {
        addOutgoingHeal(context.targetJobId, value);
      },
      addHealIncreaseForParty(value: number): void {
        self.holders.jobs.getAll().forEach((job) => {
          addOutgoingHeal(job.id, value);
        });
      },
      addHealIncreaseForOwner(value) {
        addIncomingHeal(context.targetJobId, value);
      },
      addHealIncreaseForSelf(value) {
        addIncomingHeal(context.sourceJobId, value);
      },
    });
  }
  delay(value: number): void {}
}

export class MitigationVisitor implements IEffectVisitor {
  constructor(private holders: Holders) {}

  public sums: Record<string, MitigationSum> = {};

  initTarget(target: string) {
    if (!this.sums[target]) {
      this.sums[target] = {
        absorbed: 0,
        mitigation: 1,
      };
    }
  }

  addHpIncrease(target: string, value: number) {
    this.initTarget(target);
    this.sums[target].hpIncrease = (this.sums[target].hpIncrease || 1) * value;
  }

  addMitigation(target: string, value: number) {
    this.initTarget(target);
    this.sums[target].mitigation *= 1 - value;
  }

  addAbsorb(target: string, value: number) {
    this.initTarget(target);
    this.sums[target].absorbed += value || 0;
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
    const level = this.holders.level || 100;
    const jobMap = this.holders.jobs.get(context.sourceJobId);
    const jobStats = jobMap.stats;
    const ab = this.holders.itemUsages.get(context.sourceAbilityId);
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

    // console.debug(healingBuffs.map((it) => it.ability.ability.name));

    const visitor = new HealIncreaseVisitor(this.holders);
    healingBuffs.forEach((item) => {
      const target = item.target;
      const lc = { ...context, target };
      item.ability.ability.statuses?.forEach((status) => {
        status.effects?.forEach((effect) => {
          effect.visit(visitor, lc);
        });
      });
    });

    // console.debug(visitor.Values);

    const outgoingModifier =
      visitor.Values[context.sourceJobId]?.outgoingModifier;
    const incomingModifier =
      visitor.Values[context.targetJobId]?.incomingModifier;

    const modifier =
      [outgoingModifier, incomingModifier].reduce(
        (a, b) => (b ? (a || 1) * b : a),
        0
      );

    const lvlModifier = levelModifiers[level] || levelModifiers[100]; // lets assume 100 if not found

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
      ) * (isCaster(jobMap) ? traitModifiers(jobMap, level) : 1)
    );

    return (
      (Number.isNaN(modifier) || !modifier ? 1 : modifier) *
      normalHeal *
      (value / 100) *
      (potency / 100)
    );
  }

  delay(value: number) {}

  accept(mitigator: IMitigator, context: MitigationCalculateContext) {
    const self = this;
    const validateDamageType = (damageType: DamageType) =>
      damageType === DamageType.None ||
      damageType === DamageType.All ||
      (damageType & context.attackDamageType) === damageType;

    const visitorContext = {
      ...emptyVisitorContextFunction,
      ...context,
      addMitigationForTarget(value: number, damageType: DamageType) {
        if (context.targetJobId) {
          if (validateDamageType(damageType)) {
            self.addMitigation(context.targetJobId, (value || 0) / 100);
          }
        }
      },
      addMitigationForParty(value: number, damageType: DamageType) {
        if (validateDamageType(damageType)) {
          self.holders.jobs.getAll().forEach((j) => {
            self.addMitigation(j.id, (value || 0) / 100);
          });
        }
      },
      addShieldForTarget(value: number, hpFromJob?: string) {
        if (context.targetJobId) {
          self.addAbsorb(
            context.targetJobId,
            self.calculateAbsorbFromTargetHp(
              hpFromJob || context.targetJobId,
              value || 0
            )
          );
        }
      },
      addShieldForParty(value: number, hpFromJob?: string) {
        self.holders.jobs.getAll().forEach((j) => {
          self.addAbsorb(
            j.id,
            self.calculateAbsorbFromTargetHp(hpFromJob || j.id, value || 0)
          );
        });
      },
      addAbsorbFromAbilityForTarget(value: number) {
        if (context.targetJobId) {
          self.addAbsorb(
            context.targetJobId,
            self.calculateAbsorbFromPotency(context, value)
          );
        }
      },
      addAbsorbFromAbilityForParty(value: number) {
        self.holders.jobs.getAll().forEach((j) => {
          self.addAbsorb(
            j.id,
            self.calculateAbsorbFromPotency(
              { ...context, targetJobId: j.id },
              value
            )
          );
        });
      },
      addHpIncreaseForOwner(value) {
        self.addHpIncrease(context.sourceJobId, value / 100);
      },
      addHpIncreaseForTarget(value) {
        self.addHpIncrease(context.targetJobId, value / 100);
      },
      addHpIncreaseForParty(value: number) {
        self.holders.jobs.getAll().forEach((j) => {
          self.addHpIncrease(j.id, value / 100);
        });
      },
    } as MitigationVisitorContext;

    mitigator.apply(visitorContext);
  }

  public build() {
    const defStats = this.holders.jobs.getAll().map((jobMap) => {
      const agg = this.sums[jobMap.id];
      const mitigationValue =
        agg?.mitigation === undefined ? 1 : agg?.mitigation;

      const mitigation = 1 - Math.abs(mitigationValue);
      const shield = (agg?.absorbed || 1) / jobMap?.stats.hp || 0;

      return {
        id: jobMap.id,
        name: jobMap.job.name,
        icon: jobMap.job.icon,
        mitigation: Number(mitigation.toFixed(3)),
        shield: Number(shield.toFixed(3)),
        absorb: Number((agg?.absorbed || 0).toFixed(3)),
        hpIncrease: Number((agg?.hpIncrease || 0).toFixed(3)),
      } as MitigationForAttack;
    });
    return defStats;
  }
}
