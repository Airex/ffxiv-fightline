import {
  calculateDefsForAttack,
  calculateMitigationForAttack,
} from "./Defensives/functions";
import { DefsCalcResultAbility, Warning } from "./Defensives/types";
import { Holders } from "./Holders";
import { BossAttackMap } from "./Maps";
import { Utils } from "./Utils";

export namespace Warnings {
  export function cantUseOnSelfWarning(a: DefsCalcResultAbility) {
    return {
      id: `cant_use_on_self_${a.id}_${a.start}`,
      message: `Cant use on self @ ${Utils.formatTime(a.start)}`,
      category: "Mitigation",
      type: "warning",
      icon: a.ability.icon,
      source: a.id,
    } as Warning;
  }

  export function duplicateMitigationWarning(a: DefsCalcResultAbility) {
    return {
      id: `duplicate_${a.id}_${a.start}`,
      message: `Duplicate mitigation @ ${Utils.formatTime(a.start)}`,
      category: "Mitigation",
      type: "warning",
      icon: a.ability.icon,
      source: a.id,
    } as Warning;
  }

  export function deathWarning(
    overkill: string,
    overkillPercent: string,
    icon: string,
    source: string
  ): Warning {
    return {
      id: `death_${source}`,
      message: `Death. Overkill: ${overkill} (${overkillPercent}%)`,
      category: "Mitigation",
      type: "warning",
      icon,
      source,
    };
  }

  export function attackDamageNotSet(attack: BossAttackMap): Warning {
    return {
      id: `${attack.id}-damage`,
      message: `attack damage is not set`,
      category: "Mitigation",
      type: "warning",
      icon: "https://xivapi.com/c/BNpcName.png",
      source: attack.id,
    };
  }

  export function collectWarnings(holders: Holders): Warning[] {
    const warnings = holders.bossAttacks.getAll().reduce((acc, it) => {
      const defs = calculateDefsForAttack(holders, it.id);
      const mitigations = calculateMitigationForAttack(holders, defs);
      return mitigations.warnings.reduce((acc1, w) => {
        acc[w.id] = w;
        return acc1;
      }, acc);
    }, {} as Record<string, Warning>);
    const rawWarnings = Object.values(warnings);
    // console.log(
    //   rawWarnings
    //     .map((w) => w.message)
    //     .join("\n")
    // );

    return rawWarnings;
  }
}
