import { Holders } from "../Holders";
import { AbilityUsageMap } from "../Maps";
import {
  IAbility,
  IAbilityStatus,
  DamageType,
  MitigationCalculateContext,
  IEffectVisitor,
  IMitigator,
  runEffectVisitor,
} from "../Models";
import { StatusPart } from "./types";
import { AbilityTypeVisitor } from "./visitors";

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

export function getDurations(ability: IAbility): number[] {
  return ability.statuses?.map((x) => x.duration).sort((a,b) => a - b);
}

export function buildEffects(
  holders: Holders,
  item: AbilityUsageMap,
  offset: number
): StatusPart[] {
  const visitor = new AbilityTypeVisitor();
  const typeFn = (status: IAbilityStatus) => {
    if (!status.effects || status.effects.length === 0) {
      return item.ability.ability.abilityType;
    }
    status.effects.forEach((effect) => {
      const context = {
        targetJobId: item.target,
        sourceAbilityId: item.id,
        sourceJobId: item.ability.job.id,
        attackDamageType: DamageType.All,
        level: holders.level || 90,
        holders,
        status,
        effect,
      } as MitigationCalculateContext;
      effect.visit(visitor, context);
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
