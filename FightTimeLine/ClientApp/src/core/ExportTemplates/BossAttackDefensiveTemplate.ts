import { ExportTemplate, IExportResultSet, IExportColumn, IExportRow, IExportItem } from "../BaseExportTemplate"
import * as Models from "../Models";
import * as PresentationManager from "../PresentationManager";
import { Utils } from "../Utils";

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

  build(data: Models.ExportData, presenter: PresentationManager.PresenterManager): IExportResultSet {
    this.coverAll = true;

    const used: any[] = [];
    const jobs = data.data.jobs.sort((a, b) => a.role - b.role);
    const rows = data.data.boss.attacks
      .sort((a, b) => this.offsetCompareFn(a.offset, b.offset))
      .map(it => <IExportRow>{
        cells: [
          this.text({
            text: it.offset,
            align: "center",
            refId: (data.data.boss.downTimes.find(d => Utils.inRange(d.start, d.end, it.offset)) || { id: null }).id,
            disableUnique: true,
            colorFn: (a) => {
              const dt = data.data.boss.downTimes.find(d => Utils.inRange(d.start, d.end, a.offset));
              return dt && dt.color || "";
            },
            bgRefIdFn: (a) => {
              const dt = data.data.boss.downTimes.find(d => Utils.inRange(d.start, d.end, it.offset))
              return dt && dt.id;
            }
          }),
          this.text({
            text: it.name,
            color: this.getColor(it),
            refId: it.id
          }),
          this.items(
            data.data.bossTargets
              .filter(bt => this.isOffsetInRange(it.offset, bt.start, bt.end))
              .map(bt => jobs.find(j => j.id === bt.target))
              .map(p => ({ text: p.name, icon: p.icon, refId: p.id })),
            {
              align: "center",
              disableUnique: true
            }
          ),
          ...jobs.map(t => this.items(
            data.data.abilities
              .filter(a =>
                (this.coverAll || used.indexOf(a) === -1) &&
                a.job === t.id &&
                (((a.type & 1) === 1) ||
                  ((a.type & 256) === 256) ||
                  ((a.type & 1024) === 1024) ||
                  ((a.type & 4096) === 4096) ||
                  ((a.type & 2048) === 2048)) &&
                this.isOffsetInRange(it.offset, a.start, this.offsetFromDuration(a.start, a.duration)))
              .map(a => {
                used.push(a);
                return <IExportItem>{ text: a.ability as string, icon: a.icon as string, refId: a.id as string };
              })
            , {}))
        ],
        filterData: it
      });


    return <IExportResultSet>{
      columns: [
        {
          text: "time",
          name: "time",
          align: "center",
          listOfFilter: data.data.boss.downTimes.map(d => ({ text: d.comment, value: d, byDefault: true })).concat({ text: "Other", value: undefined, byDefault: true }),
          filterFn: (data, row, col) => {
            const dt = col.listOfFilter.find(item => item.value && Utils.inRange(item.value.start, item.value.end, row.filterData.offset));
            if (!dt) {
              return data.some(item => item.text === "Other");
            }
            
            return data.some(item => item.text === dt.text);
          },
        },
        {
          name: "boss",
          text: "boss",
          listOfFilter: (presenter && presenter.tags || []).concat(["Other"]).map(t => ({ text: t, value: t, byDefault: true })),
          filterFn: (a, d) => {
            let visible = !a || a.some(value => ((!d.filterData.tags || d.filterData.tags.length === 0) && value === "Other") || d.filterData.tags && d.filterData.tags.includes(value));
            return visible;
          }
        },
        {
          text: "target",
          align: "center"
        },
        ...jobs.map(it => <IExportColumn>{ text: it.name, icon: it.icon, refId: it.id, cursor: 'pointer' })],
      rows: rows,
      title: this.name,
      filterByFirstEntry: true
    };
  }
}
