import * as FF from "./FFLogs"
import { IDetectionDependencies, IDetectionStrategy } from "./Models";

export const byName = (ids: string[], names: string[]) => {
    return new ByNameDetecor(ids, names);
}

export const byBuffApply = (id: number, abilityName?: string) => {
    return new ByBuffApplyDetector(id, abilityName);
}

export const byBuffRemove = (id: number, abilityName?: string, offsetCorrect?: number) => {
    return new ByBuffRemoveDetector(id, abilityName, offsetCorrect);
}

const isAbility = (ev: FF.Event): ev is FF.AbilityEvent => {
    return (ev.type === "cast");
}

const isBuffApply = (ev: FF.Event): ev is FF.BuffEvent => {
    return (ev.type === "applybuff");
}

const isBuffRemove = (ev: FF.Event): ev is FF.BuffEvent => {
    return (ev.type === "removebuff");
}


class ByNameDetecor implements IDetectionStrategy {
    constructor(private ids: string[], private names: string[]) {
        this.names = names;
    }

    process(ev: FF.Event): { offset: number; name: string } {
        if (isAbility(ev)) {
            if (this.names.some((n => n === ev.ability.name) as any)) {
                return { offset: ev.timestamp, name: this.names[0] }
            }
        }
        return null;
    }

    get deps(): IDetectionDependencies {
        return {
            abilities: this.ids.map(it => parseInt(it)),
            buffs: []
        }
    }
}

class ByBuffApplyDetector implements IDetectionStrategy {
    constructor(private id: number, private abilityName?: string) {
    }

    process(ev: FF.Event): { offset: number; name: string } {
        if (isBuffApply(ev)) {
            if (ev.ability.guid === this.id) {
                return { offset: ev.timestamp, name: this.abilityName || ev.ability.name }
            }
        }
        return null;
    }

    get deps(): IDetectionDependencies {
        return {
            abilities: [],
            buffs: [this.id]
        };
    }
}

class ByBuffRemoveDetector implements IDetectionStrategy {
    constructor(private id: number, private abilityName?: string, private offsetCorrection?: number) {
    }

    process(ev: FF.Event): { offset: number; name: string } {
        if (isBuffRemove(ev)) {
            if (ev.ability.guid === this.id && ev.sourceID === ev.targetID) {
                return { offset: ev.timestamp - (this.offsetCorrection || 0) * 1000, name: this.abilityName || ev.ability.name }
            }
        }
        return null;
    }

    get deps(): IDetectionDependencies {
        return {
            abilities: [],
            buffs: [this.id]
        };
    }
}