import { EntryType } from "./Models"
import { Guid } from "guid-typescript"

export class IdGenerator {
    private itemId: number = 0;
    private uniqueId = Guid.create().toString();

    private getNextItemId(): string {
        return this.uniqueId + "|"+(++ this.itemId);
    }

    getEntryType(input: string | number | undefined): EntryType {
        if (input !== undefined) {
            const value = input.toString();
            if (value.startsWith("b"))
                return EntryType.BossAttack;
            if (value.startsWith("u"))
                return EntryType.AbilityUsage;
            if (value.startsWith("t"))
                return EntryType.BossTarget;
            if (value.startsWith("d"))
                return EntryType.BossDownTime;
            if (value.startsWith("hm"))
                return EntryType.BuffMap;
            if (value.startsWith("c"))
                return EntryType.CompactViewAbilityUsage;
            if (value.startsWith("j"))
                return EntryType.Job;
            if (value.startsWith("a"))
                return EntryType.Ability;
            if (value.startsWith("s"))
                return EntryType.StanceUsage;
            if (value.startsWith("v"))
                return EntryType.AbilityAvailability;
        }
        return EntryType.Unknown;
    }

    isUnknown(input: string | number | undefined): boolean {
        return this.getEntryType(input) === EntryType.Unknown;
    }

    isBossAttack(input: string | number | undefined): boolean {
        return this.getEntryType(input) === EntryType.BossAttack;
    }

    isAbilityUsage(input: string | number | undefined): boolean {
        return this.getEntryType(input) === EntryType.AbilityUsage;
    }

    isBossTarget(input: string | number | undefined): boolean {
        return this.getEntryType(input) === EntryType.BossTarget;
    }
    isBossDownTime(input: string | number | undefined): boolean {
        return this.getEntryType(input) === EntryType.BossDownTime;
    }
    isBuffMap(input: string | number | undefined): boolean {
        return this.getEntryType(input) === EntryType.BuffMap;
    }

    isCompactViewAbilityUsage(input: string | number | undefined): boolean {
        return this.getEntryType(input) === EntryType.CompactViewAbilityUsage;
    }

    isJob(input: string | number | undefined): boolean {
        return this.getEntryType(input) === EntryType.Job;
    }

    isAbility(input: string | number | undefined): boolean {
        return this.getEntryType(input) === EntryType.Ability;
    }

    isStanceUsage(input: string | number | undefined): boolean {
        return this.getEntryType(input) === EntryType.StanceUsage;
    }

    getNextId(type: EntryType): string {
        if (type === EntryType.BossAttack)
            return "b" + this.getNextItemId();
        if (type === EntryType.AbilityUsage)
            return "u" + this.getNextItemId();
        if (type === EntryType.BossTarget)
            return "t" + this.getNextItemId();
        if (type === EntryType.BossDownTime)
            return "d" + this.getNextItemId();
        if (type === EntryType.BuffMap)
            return "hm" + this.getNextItemId();
        if (type === EntryType.CompactViewAbilityUsage)
            return "c" + this.getNextItemId();
        if (type === EntryType.Job)
            return "j" + this.getNextItemId();
        if (type === EntryType.Ability)
            return "a" + this.getNextItemId();
        if (type === EntryType.StanceUsage)
            return "s" + this.getNextItemId();
        if (type === EntryType.AbilityAvailability)
            return "v" + this.getNextItemId();
        throw "Unsupported type";
    }

    reset(): void {
        this.itemId = 0;
    }
}


