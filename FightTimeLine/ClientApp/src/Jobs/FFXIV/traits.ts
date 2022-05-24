import { IAbility, IJob, TraitFunction } from "src/core/Models";

export function abilityTrait(abilityName: string, func: (abiility: IAbility) => void): TraitFunction {
  return (job: IJob) => {
    const ability = job.abilities[abilityName];
    if (ability) {
      func(ability);
    }
  };
}

export function abilityRemovedTrait(abilityName: string, level: number): TraitFunction {
  return abilityTrait(abilityName, ab => ab.levelRemoved = level);
}


export function combineTraits(traits: TraitFunction[]): TraitFunction {
  return (job: IJob) => {
    traits.forEach(t => t(job));
  };
}

