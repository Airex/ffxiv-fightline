import { IAbility, IEffectVisitor, IMitigator, runEffectVisitor } from "./Models";

export function calculateDuration(ability: IAbility): number {
    return Math.max(0, Math.max.apply(null, ability.statuses?.map(x=>x.duration)));    
}

export function calculateOffset(ability: IAbility): number {

    class DelayEffectVisitor implements IEffectVisitor {
        delayValue: number = 0;

        delay(value: number) {           
            this.delayValue+=value;
        }
        mitigate(mitigator: IMitigator) {            
        }
    }
    return runEffectVisitor(DelayEffectVisitor, ability).delayValue;    
}