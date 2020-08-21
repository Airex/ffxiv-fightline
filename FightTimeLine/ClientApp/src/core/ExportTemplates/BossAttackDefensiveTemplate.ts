import { ExportTemplate, ExportData, IExportResultSet, IExportResultItem } from "../BaseExportTemplate"
import { Utils } from "../Utils"

export class BossAttackDefensiveTemplate extends ExportTemplate {
  constructor(private coverAll: boolean = false) {
    super();
  }

  get name(): string {
    return this.coverAll ? "Defensive cooldowns (cover attacks)" : "Defensive cooldowns";
  }


  build(data: ExportData): IExportResultSet {

    const used: any[] = [];
    const jobs = data.data.jobs.sort((a, b) => a.role - b.role);
    const rows = data.data.boss.attacks
      .sort((a, b) => this.offsetCompareFn(a.offset, b.offset))
      .map(it => [
        [<IExportResultItem>{ text: it.offset }],
        [<IExportResultItem>{ text: it.name, lineColor: it.type === 1 ? "red" : (it.type === 2 ? "blue" : null) }],
        data.data.bossTargets
          .filter(bt => this.isOffsetInRange(it.offset, bt.start, bt.end))
          .map(bt => jobs.find(j => j.id === bt.target))
          .map(it => <IExportResultItem>{ text: it.name, icon: it.icon }),
        ...jobs.map(t => {
          return data.data.abilities
            .filter(a =>
              (this.coverAll || used.indexOf(a) === -1) &&
              a.job === t.id &&
              (((a.type & 1) === 1) || ((a.type & 256) === 256) || ((a.type & 1024) === 1024) || ((a.type & 2048) === 2048)) &&
              this.isOffsetInRange(it.offset, a.start, this.offsetFromDuration(a.start, a.duration)))
            .map(a => {
              used.push(a);
              return <IExportResultItem>{ text: a.ability, icon: a.icon }
            });
        })]);



    return {
      columns: [
        { text: "time" },
        { text: "boss" },
        { text: "target" },
        ...jobs.map(it => <IExportResultItem>{ text: it.name, icon: it.icon })],
      rows: rows,
      title: this.name
    };
  }
}
