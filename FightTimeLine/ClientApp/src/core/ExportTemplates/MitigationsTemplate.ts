import { IJobRegistryService } from "src/services/jobregistry.service-interface";
import { ExportTemplate } from "../BaseExportTemplate";
import { calculateDefsForAttack, calculateMitigationForAttack } from "../Defensives";
import { ExportAttack, ExportData, ExportJob, IExportCell, IExportColumn, IExportResultSet, IExportRow, ITableOptions, ITableOptionSettings } from "../ExportModels";
import { Holders } from "../Holders";
import { PresenterManager } from "../PresentationManager";
import { Utils } from "../Utils";

export class MitigationsTemplate extends ExportTemplate {
   public get options(): ITableOptionSettings {
      return null;
   }
   public get name(): string {
      return "Mitigations";
   }

   constructor(private ids?: number[]) {
      super()
   }

   build(data: ExportData, presenter: PresenterManager, jobRegistry: IJobRegistryService,options:ITableOptions, holders: Holders): IExportResultSet {

      const jobs = data.data.jobs.sort((a, b) => a.role - b.role);

      const columns: IExportColumn[] = [
         {
            text: "Time",
            name: "time",
            width: "50px",
            align: "center",
            listOfFilter: data.data.boss.downTimes
               .sort((a, b) => this.offsetCompareFn(a.start, b.start))
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
         {
            text: "Party",
            name: "party",
            width: "auto"
         },
         ...jobs.map(it => {
            return {
               text: it.name,
               name: it.id,
               icon: it.icon,
               refId: it.id,
               width: "auto"
            } as IExportColumn
         }),
      ];

      const rows = data.data.boss.attacks
         .sort((a, b) => this.offsetCompareFn(a.offset, b.offset))
         .map(attack => {
            const cells = [
               this.time(attack, data),
               this.attackName(attack),
               this.bossTargets(data, attack, jobs),
            ];

            const defs = calculateDefsForAttack(holders, attack.id);
            const mts = calculateMitigationForAttack(holders, defs, attack)

            let cell = this.createJobCell(mts, "party");
            cells.push(cell);

            jobs.forEach(j => {
               let cell = this.createJobCell(mts, j.id);
               cells.push(cell);
            });

            return <IExportRow>{
               cells,
               filterData: attack
            }
         });


      return {
         columns,
         rows,
         title: this.name,
         filterByFirstEntry: true
      }
   }

   private createJobCell(mts: { name: string; id: string; mitigation: number; shield: number; icon: string; }[], v: string) {
      const mt = mts.find(m => m.id === v);
      let cell;
      if (mt) {
         cell = this.items([
            {
               text: (mt.mitigation*100).toFixed()+"%",
               color: "blue",
               tooltip: "Mitigation"
            },
            {
               text: mt.shield.toFixed()+"%",
               color: "red",
               tooltip: "Shield"
            }
         ], {});
      } else {
         cell = this.items([], {});
      }
      return cell;
   }

   private bossTargets(data: ExportData, attack: ExportAttack, jobs:ExportJob[]): IExportCell {
      return this.items(
         data.data.bossTargets
            .filter(bt => this.isOffsetInRange(attack.offset, bt.start, bt.end))
            .map(bt => jobs.find(j => j.id === bt.target))
            .map(p => ({ text: p.name, icon: p.icon, refId: p.id })),
         {
            align: "center",
            disableUnique: true,
         }
      );
   }

   private attackName(attack: ExportAttack): IExportCell {
      return this.text({
         text: attack.name,
         color: this.getColor(attack),
         refId: attack.id,
         tooltip: attack.desc
      });
   }

   private time(attack: ExportAttack, data: ExportData): IExportCell {
      return this.text({
         text: attack.offset,
         align: "center",
         refId: (data.data.boss.downTimes.find(d => Utils.inRange(d.start, d.end, attack.offset)) || { id: null }).id,
         disableUnique: true,
         colorFn: (a) => {
            const dt = data.data.boss.downTimes.find(d => Utils.inRange(d.start, d.end, a.offset));
            return dt && dt.color || "";
         },
         bgRefIdFn: (a) => {
            const dt = data.data.boss.downTimes.find(d => Utils.inRange(d.start, d.end, attack.offset));
            return dt && dt.id;
         }
      });
   }
}