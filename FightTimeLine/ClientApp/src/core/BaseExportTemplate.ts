import { Utils } from "./Utils"
import * as Models from "./Models";

export abstract class ExportTemplate {
    public startDate = new Date(946677600000);
    name: string;
    abstract build(data: ExportData): IExportResultSet;

    offsetCompareFn(a: string, b: string): number {
        const d = new Date();
        return Utils.getDateFromOffset(a, d).valueOf() - Utils.getDateFromOffset(b, d).valueOf();
    }

    

    offsetFromDuration(start: string, duration: number): string {
        return Utils.formatTime(new Date(Utils.getDateFromOffset(start, this.startDate).valueOf() + duration * 1000));
    }

    isOffsetInRange(offset: string, start: string, end: string) {
        const point = Utils.getDateFromOffset(offset, this.startDate);
        return Utils.getDateFromOffset(start, this.startDate) <= point &&
            Utils.getDateFromOffset(end, this.startDate) >= point;
    }
}

export interface IExportResultSet {
    columns: IExportResultItem[];
    rows: IExportResultItem[][][];
    title: string;
}

export interface IExportResultItem {
    text: string;
    icon?: string;
    lineColor?:string;
}

export class ExportData {
    name: string;
    userName: string;
    data: {
        boss: {
            attacks: {
                name: string;
                type: number;
                isAoe: boolean;
                isShareDamage: boolean;
                isTankBuster: boolean;
                offset: string;
            }[];
            downTimes: {
                start: string;
                end: string;
            }[];
        };
        initialTarget: string;
        bossTargets: {
            target: string;
            start: string;
            end: string;
        }[],
        jobs: {
            id: string;
            name: string;
            role: number;
            order: number;
            pet: string;
            icon: string;
        }[];
        abilities: {
            job: string;
            ability: string;
            type: Models.AbilityType;
            duration: number;
            start: string;
            icon: string;
        }[];
    }
}
