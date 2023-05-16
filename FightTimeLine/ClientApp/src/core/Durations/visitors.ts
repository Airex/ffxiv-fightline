import { IEffectVisitor, IMitigator, MitigationCalculateContext, DamageType, AbilityType } from "../Models";

export class AbilityTypeVisitor implements IEffectVisitor {
  delay(value: number): void {}
  constructor() {}
  public type: AbilityType | undefined = undefined;

  accept(mitigator: IMitigator, context: MitigationCalculateContext) {
    const self = this;
    mitigator.apply({
      ...context,
      addMitigationForTarget(value: number, damageType: DamageType) {
        self.type = AbilityType.SelfDefense;
      },
      addMitigationForParty(value: number, damageType: DamageType) {
        self.type = AbilityType.PartyDefense;
      },
      addShieldForTarget(value: number) {
        self.type = AbilityType.SelfShield;
      },
      addShieldForParty(value: number) {
        self.type = AbilityType.PartyShield;
      },
      addAbsorbFromAbilityForTarget(value: number) {
        self.type = AbilityType.SelfShield;
      },
      addAbsorbFromAbilityForParty(value: number) {
        self.type = AbilityType.PartyShield;
      },
      addHealIncreaseForParty(value) {
        self.type = AbilityType.PartyHealingBuff;
      },
      addHealIncreaseForTarget(value) {
        self.type = AbilityType.HealingBuff;
      },
      addHealIncreaseForOwner(value) {
        self.type = AbilityType.HealingBuff;
      },
      addHealIncreaseForSelf(value) {
        self.type = AbilityType.HealingBuff;
      },
      addHpIncreaseForOwner(value) {
        // self.type = AbilityType.HealingBuff;
      },
      addHpIncreaseForTarget(value) {
        // self.type = AbilityType.HealingBuff;
      },
      addHpIncreaseForParty(value) {

      },
    });
  }
}
