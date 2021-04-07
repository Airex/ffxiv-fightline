import { AbilityUsageMap } from "./Maps";
import { IOverlapCheckContext, IOverlapStrategy } from "./Models";

export class BaseOverlapStrategy implements IOverlapStrategy {
    getDependencies(): string[] {
        return null;
    }

    check(context: IOverlapCheckContext): boolean {

        const result = context.holders.itemUsages.getByAbility(context.group).some((x: AbilityUsageMap) => {
            const chargesBased = !!x.ability.ability.charges;
            if (chargesBased) return false;

            const idCheck = (context.id === undefined || x.id !== context.id);
            const timeCheck = x.start < context.end && x.end > context.start;
            const selectionCheck = (!context.selectionRegistry || !(x.id in context.selectionRegistry));
            const result = idCheck && timeCheck && selectionCheck;
            return result;
        });
        return result;
    }
}

export class SharedOverlapStrategy implements IOverlapStrategy {
    getDependencies(): string[] {
        return this.sharesWith;
    }

    constructor(private sharesWith: string[]) {

    }
    check(context: IOverlapCheckContext): boolean {
        const map = context.holders.abilities.get(context.group);
        const items = context.holders.itemUsages.getByAbility(context.group);
        const sharedAbility = context.holders.abilities.getByParentAndAbility(map.job.id, this.sharesWith[0]);
        const sharedItems = context.holders.itemUsages.getByAbility(sharedAbility.id);


        const result = [...items, ...sharedItems].some((x: AbilityUsageMap) => {
            const chargesBased = !!x.ability.ability.charges;
            if (chargesBased) return false;

            const idCheck = (context.id === undefined || x.id !== context.id);
            const timeCheck = x.start < context.end && x.end > context.start;
            const selectionCheck = (!context.selectionRegistry || !(x.id in context.selectionRegistry));
            const result = idCheck && timeCheck && selectionCheck;
            return result as any;
        });
        return result;
    }
}

class ChargesBasedOverlapStrategy implements IOverlapStrategy {
    getDependencies(): string[] {
        return null;
    }

    check(): boolean {
        return false;
    }
}