import { ExportTemplate,  IExportResultSet, IExportColumn, IExportRow, ITextCell, IItemsCell} from "../BaseExportTemplate"
import { Utils } from "../Utils"
import * as Models from "../Models";

export class EachRowOneSecondTemplate extends ExportTemplate {
    get name(): string {
        return "Each row as one second";
    }

    build(data: Models.ExportData): IExportResultSet {
        const list: IExportRow[] = [];

        for (let i = 946677600000; i < 946677600000 + 200 * 1000; i += 1000) {
            const offset = Utils.formatTime(new Date(i));
            const bossAttacks = data.data.boss.attacks.filter(it => it.offset === offset).map(it => it.name).join(", ");
            const playerAttacks = data.data.jobs.map(it => <IItemsCell>{ 
              items: data.data.abilities
                .filter(a => a.start === offset && a.job === it.id)
                .map(p => <ITextCell>{
                  text: p.ability,
                  icon: p.icon,
                  type: "text"
                })
            });
            list.push({
              cells: [
                <ITextCell>{ text: offset },
                <ITextCell>{ text: bossAttacks },
                ...playerAttacks
              ]
            })
        }

        return <IExportResultSet>{
            columns: [
                { text: "time" },
                { text: "boss" },
                ...data.data.jobs.map(it => <IExportColumn>{ text: it.name, icon: it.icon })],
            rows: list,
            title: this.name
        };
    }
}
