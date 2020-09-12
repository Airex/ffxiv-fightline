import { ExportTemplate, IExportResultSet, ITextCell, IExportColumn, IExportRow, IItemsCell } from "../BaseExportTemplate"
import * as Models from "../Models";

export class BossAttackDefensiveTemplate extends ExportTemplate {
  constructor(private coverAll: boolean = false) {
    super();
  }

  get name(): string {
    return this.coverAll ? "Defensive cooldowns (cover attacks)" : "Defensive cooldowns";
  }

  getColor(it: any) {
    return (it.type === 1 ? "red" : (it.type === 2 ? "blue" : ""));
  }

  build(data: Models.ExportData): IExportResultSet {

    const used: any[] = [];
    const jobs = data.data.jobs.sort((a, b) => a.role - b.role);
    const rows = data.data.boss.attacks
      .sort((a, b) => this.offsetCompareFn(a.offset, b.offset))
      .map(it => <IExportRow>{
        cells: [
          this.text({ text: it.offset }),
          this.text({ text: it.name, color: this.getColor(it), refId: it.id }),
          this.items({
            items: data.data.bossTargets
              .filter(bt => this.isOffsetInRange(it.offset, bt.start, bt.end))
              .map(bt => jobs.find(j => j.id === bt.target))
              .map(p => this.text({ text: p.name, icon: p.icon, refId: p.id })),
          }),
          ...jobs.map(t => this.items({
            items: data.data.abilities
              .filter(a =>
                (this.coverAll || used.indexOf(a) === -1) &&
                a.job === t.id &&
                (((a.type & 1) === 1) || ((a.type & 256) === 256) || ((a.type & 1024) === 1024) || ((a.type & 2048) === 2048)) &&
                this.isOffsetInRange(it.offset, a.start, this.offsetFromDuration(a.start, a.duration)))
              .map(a => {
                used.push(a);
                return this.text({ text: a.ability, icon: a.icon, refId: a.id })
              })
          }))
        ]
      });


    return <IExportResultSet>{
      columns: [
        { text: "time" },
        { text: "boss" },
        { text: "target" },
        ...jobs.map(it => <IExportColumn>{ text: it.name, icon: it.icon, refId: it.id })],
      rows: rows,
      title: this.name
    };
  }
}
