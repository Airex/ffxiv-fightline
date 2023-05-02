import { Holders } from "./Holders";
import { AbilityMap, AbilityUsageMap } from "./Maps";
import {
  AbilityType,
  DamageType,
  IAbility,
  IAbilityStatus,
  IEffectVisitor,
  IMitigator,
  MitigationCalculateContent,
  runEffectVisitor,
} from "./Models";

export function calculateDuration(ability: IAbility): number {
  return Math.max(
    0,
    Math.max.apply(
      null,
      ability.statuses
        ?.filter((st) => {
          return true;
        })
        .map((x) => x.duration)
    )
  );
}

export type FramePart = {
  extraStyle?: string;
  start: number;
  length: number;
  type: AbilityType;
};

export type StatusPart = {
  start: number;
  length: number;
  type: AbilityType;
  shieldBroken?: boolean;
};

class ColorVisitor implements IEffectVisitor {
  delay(value: number): void {

  }
  constructor(private holders: Holders) {}
  public type: AbilityType | undefined = undefined;

  accept(mitigator: IMitigator, target: MitigationCalculateContent) {
    const self = this;
    mitigator.apply({
      jobId: target.jobId,
      abilityId: target.abilityId,
      holders: this.holders,
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
          self.type = AbilityType.HealingBuff
      },
    });
  }
}

export function buildEffects(
  holders: Holders,
  item: AbilityUsageMap,
  offset: number
): StatusPart[] {
  const typeFn = (status: IAbilityStatus) => {
    if (!status.effects || status.effects.length === 0) {
      return item.ability.ability.abilityType;
    }

    const visitor = new ColorVisitor(holders);
    status.effects.forEach((effect) => {
      effect.visit(visitor, {
        target: item.ability.job.id,
        abilityId: item.id,
        jobId: item.ability.job.id,
        damageType: DamageType.All,
        level: holders.level || 90,
        status,
        effect,
      });
    });
    return visitor.type;
  };

  const statuses = item.ability.ability.statuses?.sort(
    (a, b) => a.duration - b.duration
  );
  return (
    statuses?.map((status) => {
      return {
        start: offset,
        length: status.duration,
        type: typeFn(status),
      };
    }) || []
  );
}

export function calculateOffset(ability: IAbility): number {
  class DelayEffectVisitor implements IEffectVisitor {
    delayValue = 0;

    delay(value: number) {
      this.delayValue += value;
    }

    accept(mitigator: IMitigator) {}
  }
  return runEffectVisitor(DelayEffectVisitor, ability).delayValue;
}
