import * as FF from "./FFLogs";
import { IDetectionDependencies, IDetectionStrategy } from "./Models";

export namespace DetectStrategies {
  export const byName = (ids: (string | number)[], names: string[]) => {
    return new ByNameDetector(ids, names);
  };

  export const byBuffApply = (id: number, abilityName?: string) => {
    return new ByBuffApplyDetector(id, abilityName);
  };

  export const byBuffRemove = (
    id: number,
    abilityName?: string,
    offsetCorrect?: number
  ) => {
    return new ByBuffRemoveDetector(id, abilityName, offsetCorrect);
  };

  export const combined = (detectors: IDetectionStrategy[]) => {
    return new CombinedDetector(detectors);
  };
}

const isAbility = (ev: FF.BaseEventFields): ev is FF.AbilityEvent => {
  return (ev as any).type === "cast";
};

const isBuffApply = (ev: FF.BaseEventFields): ev is FF.BuffEvent => {
  return (ev as any).type === "applybuff";
};

const isBuffRemove = (ev: FF.BaseEventFields): ev is FF.BuffEvent => {
  return (ev as any).type === "removebuff";
};

class CombinedDetector implements IDetectionStrategy {
  constructor(private detectors: IDetectionStrategy[]) {}

  process(ev: FF.BaseEventFields): { offset: number; name: string } {
    for (const d of this.detectors) {
      const res = d.process(ev);
      if (res) {
        return res;
      }
    }
    return null;
  }

  get deps(): IDetectionDependencies {
    return this.detectors.reduce(
      (acc, it) => {
        const deps = it.deps;
        return {
          abilities: [...acc.abilities, ...deps.abilities],
          buffs: [...acc.buffs, ...deps.buffs],
        };
      },
      { abilities: [], buffs: [] }
    );
  }
}

class ByNameDetector implements IDetectionStrategy {
  constructor(private ids: (string | number)[], private names: string[]) {
    this.names = names;
  }

  process(ev: FF.BaseEventFields): { offset: number; name: string } {
    if (isAbility(ev)) {
      if (this.names.some((n) => n === ev.ability.name)) {
        return { offset: ev.timestamp, name: this.names[0] };
      }
      if (this.ids.some((n) => n === ev.ability.guid)) {
        return { offset: ev.timestamp, name: this.names[0] };
      }
    }
    return null;
  }

  get deps(): IDetectionDependencies {
    return {
      abilities: this.ids.map((it) => +it.toString()),
      buffs: [],
    };
  }
}

class ByBuffApplyDetector implements IDetectionStrategy {
  constructor(private id: number, private abilityName?: string) {}

  process(ev: FF.BaseEventFields): { offset: number; name: string } {
    if (isBuffApply(ev)) {
      if (ev.ability.guid === this.id) {
        return {
          offset: ev.timestamp,
          name: this.abilityName || ev.ability.name,
        };
      }
    }
    return null;
  }

  get deps(): IDetectionDependencies {
    return {
      abilities: [],
      buffs: [this.id],
    };
  }
}

class ByBuffRemoveDetector implements IDetectionStrategy {
  constructor(
    private id: number,
    private abilityName?: string,
    private offsetCorrection?: number
  ) {}

  process(ev: FF.BaseEventFields): { offset: number; name: string } {
    if (isBuffRemove(ev)) {
      if (ev.ability.guid === this.id && ev.sourceID === ev.targetID) {
        return {
          offset: ev.timestamp - (this.offsetCorrection || 0) * 1000,
          name: this.abilityName || ev.ability.name,
        };
      }
    }
    return null;
  }

  get deps(): IDetectionDependencies {
    return {
      abilities: [],
      buffs: [this.id],
    };
  }
}
