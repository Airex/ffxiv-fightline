import { ExportTemplate } from "../BaseExportTemplate"
import { ExportData, IExportColumn, IExportResultSet, IExportRow } from "../ExportModels";
import { Utils } from "../Utils"

export class EachRowOneSecondTemplate extends ExportTemplate {
  get name(): string {
    return "Each row as one second";
  }

  build(data: ExportData): IExportResultSet {
    const list: IExportRow[] = [];

    for (let i = 946677600000; i < 946677600000 + 200 * 1000; i += 1000) {
      const offset = Utils.formatTime(new Date(i));
      const bossAttacks = data.data.boss.attacks.filter(it => it.offset === offset).map(it => it.name).join(", ");
      const playerAttacks = data.data.jobs.map(it =>
        this.items(data.data.abilities
          .filter(a => a.start === offset && a.job === it.id)
          .map(p => ({
            text: p.ability,
            icon: p.icon,
          })), {}));

      list.push({
        cells: [
          this.text({ text: offset }),
          this.text({ text: bossAttacks }),
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
