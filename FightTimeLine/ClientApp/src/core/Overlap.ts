import { AbilityUsageMap } from "./Maps";
import { IOverlapCheckContext, IOverlapStrategy } from "./Models";

export class BaseOverlapStrategy implements IOverlapStrategy {
    getDependencies(): string[] {
        return null;
    }

    check(context: IOverlapCheckContext): boolean {

        const chargesBased = !!context.ability.charges;
        if (chargesBased) { return false; }

        const result = context.holders.itemUsages
            .getByAbility(context.jobAbilityId)
            .filter(x => !context.selectionRegistry || context.selectionRegistry.indexOf(x.id) === -1)
            .some((x: AbilityUsageMap) => {
                const timeCheck = x.start < context.end && x.end > context.start;
                return timeCheck;
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
        const chargesBased = !!context.ability.charges;
        if (chargesBased) { return false; }

        const map = context.holders.abilities.get(context.jobAbilityId);
        const items = context.holders.itemUsages.getByAbility(context.jobAbilityId);
        // todo: possible multiple shares
        const sharedAbility = context.holders.abilities.getByParentAndAbility(map.job.id, this.sharesWith[0]);
        const sharedItems = context.holders.itemUsages.getByAbility(sharedAbility.id);

        const checkResult = [...items, ...sharedItems]
            .filter(x => !context.selectionRegistry || context.selectionRegistry.indexOf(x.id) === -1)
            .some(x => {
                const timeCheck = x.start < context.end && x.end > context.start;
                const result = timeCheck;
                return result;
            });
        return checkResult;
    }
}

export class ChargesBasedOverlapStrategy implements IOverlapStrategy {
    getDependencies(): string[] {
        return null;
    }

    check(context: IOverlapCheckContext): boolean {

        return false;
    }
}

export class AllowOverlapStrategy implements IOverlapStrategy {
    getDependencies(): string[] {
        return null;
    }

    check(context: IOverlapCheckContext): boolean {
        return false;
    }
}
