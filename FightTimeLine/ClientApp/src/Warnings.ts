import { DefsCalcResultAbility, Warning } from "./core/Defensives/types";
import { Utils } from "./core/Utils";

export function cantUseOnSelfWarning(a: DefsCalcResultAbility) {
  return {
    message: `Cant use on self @ ${Utils.formatTime(a.start)}`,
    category: "Mitigation",
    type: "warning",
    icon: a.ability.icon,
    source: a.id,
  } as Warning;
}


export function duplicateMitigationWarning(a: DefsCalcResultAbility) {
  return {
    message: `Duplicate mitigation @ ${Utils.formatTime(a.start)}`,
    category: "Mitigation",
    type: "warning",
    icon: a.ability.icon,
    source: a.id,
  } as Warning;
}


export function deathWarning(overkill: string, overkillPercent: string, icon: string, source: string): Warning {
  return {
    message: `Death. Overkill: ${overkill} (${overkillPercent}%)`,
    category: "Mitigation",
    type: "warning",
    icon,
    source,
  };
}
