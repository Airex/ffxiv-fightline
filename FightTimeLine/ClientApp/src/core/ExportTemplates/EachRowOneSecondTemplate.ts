import { TableViewTemplate, ExportTemplateContext } from "../BaseExportTemplate";
import { IExportResultSet, ITableOptionSettings } from "../ExportModels";
import { IColumnTemplate } from "../TableModels";

export class EachRowOneSecondTemplate extends TableViewTemplate<number> {

  public loadOptions(): ITableOptionSettings {
    return null;
  }
  get name(): string {
    return "Each row as one second";
  }

  buildTable(context: ExportTemplateContext): IExportResultSet {

    // const list: IExportRow[] = [];

    // for (let i = 946677600000; i < 946677600000 + 200 * 1000; i += 1000) {
    //   const offset = Utils.formatTime(new Date(i));
    //   const bossAttacks = data.data.boss.attacks.filter(it => it.offset === offset).map(it => it.name).join(", ");
    //   const playerAttacks = data.data.jobs.map(it =>
    //     this.items(data.data.abilities
    //       .filter(a => a.start === offset && a.job === it.id)
    //       .map(p => ({
    //         text: p.ability,
    //         icon: p.icon,
    //       })), {}));

    //   list.push({
    //     cells: [
    //       this.text({ text: offset }),
    //       this.text({ text: bossAttacks }),
    //       ...playerAttacks
    //     ]
    //   })
    // }

    return {
      columns: [],
      filterByFirstEntry: true,
      rows: [],
      title: this.name
    };
  }

  getColumns(context: ExportTemplateContext): IColumnTemplate<number>[] {

    // const list: IExportRow[] = [];

    // for (let i = 946677600000; i < 946677600000 + 200 * 1000; i += 1000) {
    //   const offset = Utils.formatTime(new Date(i));
    //   const bossAttacks = data.data.boss.attacks.filter(it => it.offset === offset).map(it => it.name).join(", ");
    //   const playerAttacks = data.data.jobs.map(it =>
    //     this.items(data.data.abilities
    //       .filter(a => a.start === offset && a.job === it.id)
    //       .map(p => ({
    //         text: p.ability,
    //         icon: p.icon,
    //       })), {}));

    //   list.push({
    //     cells: [
    //       this.text({ text: offset }),
    //       this.text({ text: bossAttacks }),
    //       ...playerAttacks
    //     ]
    //   })
    // }

    return [
    ];

    // return [<IExportResultSet>{
    //   columns: [
    //     { text: "time" },
    //     { text: "boss" },
    //     ...data.data.jobs.map(it => <IExportColumn>{ text: it.name, icon: it.icon })],
    //   rows: list,
    //   title: this.name
    // }];
  }
}
