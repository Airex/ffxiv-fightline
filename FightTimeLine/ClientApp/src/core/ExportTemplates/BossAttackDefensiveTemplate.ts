import { ExportTemplate, IExportResultSet, IExportColumn, IExportRow, IExportItem } from "../BaseExportTemplate"
import { SettingsEnum } from "../Jobs/FFXIV/shared";
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
    const used: any[] = [];
    const jobs = data.data.jobs.sort((a, b) => a.role - b.role);
    const rows = data.data.boss.attacks
      .sort((a, b) => this.offsetCompareFn(a.offset, b.offset))
      .map(attack => <IExportRow>{
        cells: [
          this.text({
            text: attack.offset,
            align: "center",
            refId: (data.data.boss.downTimes.find(d => Utils.inRange(d.start, d.end, attack.offset)) || { id: null }).id,
            disableUnique: true,
            colorFn: (a) => {
              const dt = data.data.boss.downTimes.find(d => Utils.inRange(d.start, d.end, a.offset));
              return dt && dt.color || "";
            },
            bgRefIdFn: (a) => {
              const dt = data.data.boss.downTimes.find(d => Utils.inRange(d.start, d.end, attack.offset))
              return dt && dt.id;
            }
          }),
          this.text({
            text: attack.name,
            color: this.getColor(attack),
            refId: attack.id
          }),
          this.items(
            data.data.bossTargets
              .filter(bt => this.isOffsetInRange(attack.offset, bt.start, bt.end))
              .map(bt => jobs.find(j => j.id === bt.target))
              .map(p => ({ text: p.name, icon: p.icon, refId: p.id })),
            {
              align: "center",
              disableUnique: true
            }
          ),
          ...jobs.map(job => this.items(
            data.data.abilities
              .filter(ability =>
                (this.coverAll || used.indexOf(ability) === -1) &&
                ability.job === job.id &&
                this.isDefenceAbility(ability) &&
                this.isOffsetInRange(attack.offset, ability.start, this.offsetFromDuration(ability.start, ability.duration)))
              .map(ability => {
                used.push(ability);
                return <IExportItem>{
                  text: ability.ability,
                  icon: ability.icon,
                  refId: ability.id,
                  targetIcon: this.buildTargetIcon(ability, jobs),
                  usageOffset: Utils.formatTime(new Date(Utils.getDateFromOffset(ability.start).getTime() - Utils.getDateFromOffset(attack.offset).getTime()))
                };  
              })
            , {}))
        ],
        filterData: attack
      });

    const columns = [
      {
        text: "Time",
        name: "time",
        width: "50px",
        align: "center",
        listOfFilter: data.data.boss.downTimes
          .map(d => ({ text: d.comment, value: d, byDefault: true }))
          .concat({ text: "Other", value: <any>{ comment: "Other" }, byDefault: true }),
        filterFn: (data, row, col) => {
          const found = col && col.listOfFilter && col.listOfFilter.find(item => item.value && Utils.inRange(item.value.start, item.value.end, row.filterData.offset))

          if (found)
            return data.some(item => item && item.comment === found.value.comment);

          return data.some(item => item && item.comment === "Other");
        },
      },
      {
        name: "boss",
        text: "Attack",
        width: "200px",
        listOfFilter: (presenter && presenter.tags || []).concat(["Other"]).map(t => ({ text: t, value: t, byDefault: true })),
        filterFn: (a, d) => {
          let visible = !a || a.some(value => ((!d.filterData.tags || d.filterData.tags.length === 0) && value === "Other") || d.filterData.tags && d.filterData.tags.includes(value));
          return visible;
        }
      },
      {
        name: "target",
        text: "Target",
        align: "center",
        width: "65px"

      },
      ...jobs.map(it => <IExportColumn>{ text: it.name, icon: it.icon, refId: it.id, cursor: 'pointer', width: "auto" }),
      // {          
      //   text: "Description",          
      // },
    ];


    return <IExportResultSet>{
      columns: columns,
      rows: rows,
      title: this.name,
      filterByFirstEntry: true
    };
  }

  private buildTargetIcon(ability: Models.ExportAbility, jobs: Models.ExportJob[]): string {
    const target = ability.settings?.find(s => s.name === SettingsEnum.Target)?.value;
    const job = target && jobs?.find(j=>j.id === target);
    return job?.icon;
  }

  private isDefenceAbility(a: any) {
    return ((a.type & 1) === 1) ||
      ((a.type & 256) === 256) ||
      ((a.type & 1024) === 1024) ||
      ((a.type & 4096) === 4096) ||
      ((a.type & 2048) === 2048)
  }
}

