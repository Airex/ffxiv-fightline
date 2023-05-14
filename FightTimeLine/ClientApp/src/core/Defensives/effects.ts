import {
  DamageType,
  IAbilityEffect,
  IEffectVisitor,
  IMitigator,
  MitigationCalculateContext,
  MitigationVisitorContext,
} from "../Models";

export enum AbilityTarget {
  Solo,
  Party,
  Owner,
}

function asKeysIfDefined<T>(obj: T): T {
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] !== undefined) acc[key] = key;
    return acc;
  }, {}) as T;
}

class MitigationEffect implements IAbilityEffect, IMitigator {
  constructor(
    private damageType: DamageType,
    private value: number,
    private targetType: AbilityTarget = AbilityTarget.Solo
  ) {}

  private modifier: IMitigator;
  apply(context: MitigationVisitorContext) {
    switch (this.targetType) {
      case AbilityTarget.Party:
        context.addMitigationForParty(this.value, this.damageType);
        break;
      case AbilityTarget.Solo:
        context.addMitigationForTarget(this.value, this.damageType);
        break;
    }
  }
  visit(visitor: IEffectVisitor, targetContext: MitigationCalculateContext) {
    visitor.accept(this.modifier || this, targetContext);
  }

  withModifier<T extends IMitigator>(
    t: new (value: number, damageType: DamageType) => T
  ): this {
    this.modifier = new t(this.value, this.damageType);
    return this;
  }
}

class ShieldEffect implements IAbilityEffect, IMitigator {
  constructor(
    private value: number,
    private targetType: AbilityTarget = AbilityTarget.Solo
  ) {}

  private modifier: IMitigator;

  apply(context: MitigationVisitorContext) {
    switch (this.targetType) {
      case AbilityTarget.Party:
        context.addShieldForParty(this.value);
        break;
      case AbilityTarget.Solo:
        context.addShieldForTarget(this.value);
        break;
    }
  }

  withModifier<T extends IMitigator>(t: new (value: number) => T): this {
    this.modifier = new t(this.value);
    return this;
  }

  visit(visitor: IEffectVisitor, targetContext: MitigationCalculateContext) {
    visitor.accept(this.modifier || this, targetContext);
  }
}

class ShieldFromHealEffect implements IAbilityEffect, IMitigator {
  constructor(
    private value: number,
    private targetType: AbilityTarget = AbilityTarget.Solo
  ) {}

  private modifier: IMitigator;

  apply(context: MitigationVisitorContext) {
    switch (this.targetType) {
      case AbilityTarget.Party:
        context.addAbsorbFromAbilityForParty(this.value);
        break;
      case AbilityTarget.Solo:
        context.addAbsorbFromAbilityForTarget(this.value);
        break;
    }
  }

  withModifier<T extends IMitigator>(t: new (value: number) => T): this {
    this.modifier = new t(this.value);
    return this;
  }

  visit(visitor: IEffectVisitor, targetContext: MitigationCalculateContext) {
    visitor.accept(this.modifier || this, targetContext);
  }
}

class HealingIncreaseEffect implements IAbilityEffect, IMitigator {
  constructor(
    private value: number,
    private targetType: AbilityTarget = AbilityTarget.Solo
  ) {}

  private modifier: IMitigator;

  apply(context: MitigationVisitorContext): void {
    switch (this.targetType) {
      case AbilityTarget.Party:
        context.addHealIncreaseForParty(this.value);
        break;
      case AbilityTarget.Solo:
        context.addHealIncreaseForTarget(this.value);
        break;
      case AbilityTarget.Owner:
        context.addHealIncreaseForOwner(this.value);
        break;
    }
  }

  withModifier<T extends IMitigator>(
    t: new (value: number) => T
  ): this {
    this.modifier = new t(this.value);
    return this;
  }

  visit(visitor: IEffectVisitor, targetContext: MitigationCalculateContext) {
    visitor.accept(this.modifier || this, targetContext);
  }
}

class DelayEffect implements IAbilityEffect {
  constructor(private value: number) {}
  visit(visitor: IEffectVisitor, targetContext: MitigationCalculateContext) {
    visitor.delay(this.value);
  }
}

export default {
  mitigation: {
    solo: (value: number, damageType: DamageType = DamageType.All) =>
      new MitigationEffect(damageType, value, AbilityTarget.Solo),
    party: (value: number, damageType: DamageType = DamageType.All) =>
      new MitigationEffect(damageType, value, AbilityTarget.Party),
  },
  shield: {
    solo: (value: number) => new ShieldEffect(value, AbilityTarget.Solo),
    party: (value: number) => new ShieldEffect(value, AbilityTarget.Party),
  },
  shieldFromHeal: {
    solo: (value: number) =>
      new ShieldFromHealEffect(value, AbilityTarget.Solo),
    party: (value: number) =>
      new ShieldFromHealEffect(value, AbilityTarget.Party),
  },
  damage: {},
  healingIncrease: {
    solo: (value: number) =>
      new HealingIncreaseEffect(value, AbilityTarget.Solo),
    party: (value: number) =>
      new HealingIncreaseEffect(value, AbilityTarget.Party),
  },
  incomingHealingIncrease: {
    solo: (value: number) =>
      new HealingIncreaseEffect(value, AbilityTarget.Owner),
  },
  delay: (value: number) => new DelayEffect(value),
};
