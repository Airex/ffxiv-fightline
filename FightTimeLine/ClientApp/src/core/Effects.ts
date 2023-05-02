import { DamageType, IAbilityEffect, IEffectVisitor, IMitigator, MitigationCalculateContent, MitigationVisitorContext } from "./Models";


export enum DefenceTarget {
  Solo,
  Party
}

class MitigationEffect implements IAbilityEffect, IMitigator {
  constructor(private damageType: DamageType, private value: number, private targetType: DefenceTarget = DefenceTarget.Solo) {

  }

  private modifier: IMitigator;
  apply(context: MitigationVisitorContext) {
    switch (this.targetType) {
      case DefenceTarget.Party:
        context.addMitigationForParty(this.value, this.damageType);
        break;
      case DefenceTarget.Solo:
        context.addMitigationForTarget(this.value, this.damageType);
        break;
    }
  }
  visit(visitor: IEffectVisitor, targetContext: MitigationCalculateContent) {
    visitor.accept(this.modifier || this, targetContext) ;
  }

  withModifier<T extends IMitigator>(t: new (value: number, damageType: DamageType) => T): this {
    this.modifier = new t(this.value, this.damageType);
    return this;
  }
}

class ShieldEffect implements IAbilityEffect, IMitigator {
  constructor(private value: number, private targetType: DefenceTarget = DefenceTarget.Solo) {

  }

  private modifier: IMitigator;

  apply(context: MitigationVisitorContext) {
    switch (this.targetType) {
      case DefenceTarget.Party:
        context.addShieldForParty(this.value);
        break;
      case DefenceTarget.Solo:
        context.addShieldForTarget(this.value);
        break;
    }
  }

  withModifier<T extends IMitigator>(t: new (value: number) => T): this {
    this.modifier = new t(this.value);
    return this;
  }


  visit(visitor: IEffectVisitor, targetContext: MitigationCalculateContent) {
    visitor.accept(this.modifier || this, targetContext);
  }
}

class ShieldFromHealEffect implements IAbilityEffect, IMitigator {
  constructor(private value: number, private targetType: DefenceTarget = DefenceTarget.Solo) {

  }

  private modifier: IMitigator;

  apply(context: MitigationVisitorContext) {
    switch (this.targetType) {
      case DefenceTarget.Party:
        context.addAbsorbFromAbilityForParty(this.value);
        break;
      case DefenceTarget.Solo:
        context.addAbsorbFromAbilityForTarget(this.value);
        break;
    }
  }

  withModifier<T extends IMitigator>(t: new (value: number) => T): this {
    this.modifier = new t(this.value);
    return this;
  }


  visit(visitor: IEffectVisitor, targetContext: MitigationCalculateContent) {
    visitor.accept(this.modifier || this, targetContext);
  }
}

class HealingIncreaseEffect implements IAbilityEffect, IMitigator {
  constructor(private value: number, private targetType: DefenceTarget = DefenceTarget.Solo) {

  }
  apply(context: MitigationVisitorContext): void {
    switch (this.targetType) {
      case DefenceTarget.Party:
        context.addHealIncreaseForParty(this.value);
        break;
      case DefenceTarget.Solo:
        context.addHealIncreaseForTarget(this.value);
        break;
    }
  }

  visit(visitor: IEffectVisitor, targetContext: MitigationCalculateContent) {
    visitor.accept(this, targetContext);
  }


}

class DelayEffect implements IAbilityEffect {
  constructor(private value: number) {

  }
  visit(visitor: IEffectVisitor, targetContext: MitigationCalculateContent) {
    visitor.delay(this.value);
  }
}

export default {
  mitigation: {
    solo: (value: number, damageType: DamageType = DamageType.All) => new MitigationEffect(damageType, value, DefenceTarget.Solo),
    party: (value: number, damageType: DamageType = DamageType.All) => new MitigationEffect(damageType, value, DefenceTarget.Party),
  },
  shield: {
    solo: (value: number) => new ShieldEffect(value, DefenceTarget.Solo),
    party: (value: number) => new ShieldEffect(value, DefenceTarget.Party),
  },
  shieldFromHeal:{
    solo: (value: number) => new ShieldFromHealEffect(value, DefenceTarget.Solo),
    party: (value: number) => new ShieldFromHealEffect(value, DefenceTarget.Party),
  },
  damage: {

  },
  healingIncrease: {
    solo: (value: number) => new HealingIncreaseEffect(value, DefenceTarget.Solo),
    party: (value: number) => new HealingIncreaseEffect(value, DefenceTarget.Party)
  },
  delay: (value: number) => new DelayEffect(value)
};
