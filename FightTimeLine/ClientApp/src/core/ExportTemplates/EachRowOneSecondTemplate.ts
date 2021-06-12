import { IJobRegistryService } from "src/services/jobregistry.service-interface";
import { ExportTemplate } from "../BaseExportTemplate"
import { ExportData, IExportResultSet, IExportRow, ITableOptions, ITableOptionSettings } from "../ExportModels";
import { Holders } from "../Holders";
import { PresenterManager } from "../PresentationManager";
import { IColumnTemplate } from "../TableModels";
import { Utils } from "../Utils";

export class EachRowOneSecondTemplate extends ExportTemplate<number> {
  
  public get options(): ITableOptionSettings {
    return null;
  }
  get name(): string {
    return "Each row as one second";
  }

  buildTable(data: ExportData, presenter: PresenterManager, jobRegistry: IJobRegistryService, options?: ITableOptions, holders?: Holders): IExportResultSet {

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
    }
  }

  getColumns(data: ExportData): IColumnTemplate<number>[] {

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
