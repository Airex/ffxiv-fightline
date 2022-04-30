import { DamageType, IAbilityEffect, IEffectVisitor, IMitigator, MitigationVisitorContext } from "./Models";


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
        this.mitigationParty(context);
        break;
      case DefenceTarget.Solo:
        this.mitigation(context);
        break;
    }
  }
  visit(visitor: IEffectVisitor) {
    visitor.mitigate(this.modifier || this);
  }

  withModifier<T extends IMitigator>(t: new (value: number, damageType: DamageType) => T): this {
    this.modifier = new t(this.value, this.damageType);
    return this;
  }

  mitigation(context: MitigationVisitorContext) {
    context.addMitigationForTarget(this.value, this.damageType);
  }

  mitigationParty(context: MitigationVisitorContext) {
    context.addMitigationForParty(this.value, this.damageType);
  }
}


class ShieldEffect implements IAbilityEffect, IMitigator {
  constructor(private value: number, private targetType: DefenceTarget = DefenceTarget.Solo) {

  }

  private modifier: IMitigator;

  apply(context: MitigationVisitorContext) {
    switch (this.targetType) {
      case DefenceTarget.Party:
        this.shieldParty(context);
        break;
      case DefenceTarget.Solo:
        this.shield(context);
        break;
    }
  }

  withModifier<T extends IMitigator>(t: new (value: number) => T): this {
    this.modifier = new t(this.value);
    return this;
  }


  visit(visitor: IEffectVisitor) {
    visitor.mitigate(this.modifier || this);
  }

  shield(context: MitigationVisitorContext) {
    context.addShieldForTarget(this.value);
  }


  shieldParty(context: MitigationVisitorContext) {
    context.addShieldForParty(this.value);
  }
}

class DelayEffect implements IAbilityEffect {
  constructor(private value: number) {

  }
  visit(visitor: IEffectVisitor) {
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
  damage: {

  },
  delay: (value: number) => new DelayEffect(value)
};
