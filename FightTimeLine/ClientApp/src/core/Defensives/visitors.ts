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
import { DefsCalcResult, MitigationForAttack } from "./types";

export type HealIncreaseContainer = {
  outgoingModifier?: number;
  incomingModifier?: number;
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
      self.Values[target].outgoingModifier *= value / 100;
    };
    const addIncomingHeal = (target: string, value: number) => {
      self.Values[target] = self.Values[target] || {};
      self.Values[target].incomingModifier =
        self.Values[target].incomingModifier || 1;
      self.Values[target].incomingModifier *= value / 100;
    };

    mitigator.apply({
      ...context,
      addMitigationForTarget(value: number, damageType: DamageType): void {},
      addMitigationForParty(value: number, damageType: DamageType): void {},
      addShieldForTarget(value: number, hpFromJob?: string): void {},
      addShieldForParty(value: number, hpFromJob?: string): void {},
      addAbsorbFromAbilityForTarget(value: number): void {},
      addAbsorbFromAbilityForParty(value: number): void {},
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
      addHpIncreaseForOwner(value) {},
      addHpIncreaseForTarget(value) {},
    });
  }
  delay(value: number): void {}
}

export class MitigationVisitor implements IEffectVisitor {
  constructor(private holders: Holders) {}

  public partyMitigation = -1;
  public partyAbsorbed = 0;
  public partyShield = 0;
  public sums: Record<
    string,
    {
      absorbed: number;
      shield: number;
      mitigation: number;
      hpIncrease?: number;
    }
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
    this.sums[target].shield += value || 0;
  }

  addHpIncrease(target: string, value: number) {
    this.initTarget(target);
    this.sums[target].hpIncrease = (this.sums[target].hpIncrease || 1) * value;
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
    const level = this.holders.level || 90;
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

    console.debug(healingBuffs.map((it) => it.ability.ability.name));

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

    console.debug(visitor.Values);

    const outgoingModifier =
      visitor.Values[context.sourceJobId]?.outgoingModifier;
    const incomingModifier =
      visitor.Values[context.targetJobId]?.incomingModifier;

    const modifier =
      1 +
      [outgoingModifier, incomingModifier].reduce(
        (a, b) => (b ? (a || 1) * b : a),
        0
      );

    const lvlModifier = levelModifiers[level];

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
      ...context,
      addMitigationForTarget(value: number, damageType: DamageType) {
        if (context.targetJobId) {
          if (
            damageType === DamageType.None ||
            damageType === DamageType.All ||
            (damageType & context.attackDamageType) === damageType
          ) {
            self.addMitigation(context.targetJobId, (value || 0) / 100);
          }
        }
      },
      addMitigationForParty(value: number, damageType: DamageType) {
        if (
          damageType === DamageType.None ||
          damageType === DamageType.All ||
          (damageType & context.attackDamageType) === damageType
        ) {
          self.addMitigation("party", (value || 0) / 100);
        }
      },
      addShieldForTarget(value: number, hpFromJob?: string) {
        if (context.targetJobId) {
          self.addShield(context.targetJobId, value || 0);
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
        self.addShield("party", value || 0);
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
      addHealIncreaseForParty(value) {},
      addHealIncreaseForTarget(value) {},
      addHealIncreaseForOwner(value) {},
      addHealIncreaseForSelf(value) {},
      addHpIncreaseForOwner(value) {
        self.addHpIncrease(context.sourceJobId, value / 100);
      },
      addHpIncreaseForTarget(value) {
        self.addHpIncrease(context.targetJobId, value / 100);
      },
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
        hpIncrease: Number((agg?.hpIncrease || 0).toFixed(3)),
        icon: jobMap?.job.icon,
      } as MitigationForAttack;
    });
    return defStats;
  }
}
