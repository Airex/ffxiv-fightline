import { AttackRowExportTemplate, ExportTemplateContext } from "../BaseExportTemplate";
import { calculateDefsForAttack, calculateMitigationForAttack } from "../Defensives";
import { ExportAttack, ExportData, ExportJob, IExportCell, IExportColumn, ITableOptionSettings } from "../ExportModels";
import { Holders } from "../Holders";
import { AttackNameColumn, BaseColumnTemplate, BossTargetColumn, IColumnTemplate, TimeColumn } from "../TableModels";

export class MitigationsTemplate extends AttackRowExportTemplate {
   public loadOptions(): ITableOptionSettings {
      return null;
   }
   public get name(): string {
      return "Mitigations";
   }

   constructor() {
      super();
   }

   getColumns(context: ExportTemplateContext): IColumnTemplate<ExportAttack>[] {

      const jobs = context.data.data.jobs.sort((a, b) => a.role - b.role);

      const partyJob: ExportJob = {
         name: "Party",
         id: "party",
         icon: null,
         order: -1,
         pet: null,
         role: null
      };

      return [
         new TimeColumn(),
         new AttackNameColumn(context.presenter),
         new BossTargetColumn(),
         ...[partyJob, ...jobs].map(j => new MitigationColumn(j, context.holders))
      ];
   }
}

class MitigationColumn extends BaseColumnTemplate implements IColumnTemplate<ExportAttack>{
   constructor(private it: ExportJob, private holders: Holders) {
      super();
   }
   buildHeader(data: ExportData): IExportColumn {
      return {
         text: this.it.name,
         name: this.it.id,
         icon: this.it.icon,
         refId: this.it.id,
         width: "auto"
      } as IExportColumn;
   }
   buildCell(data: ExportData, attack: ExportAttack): IExportCell {
      const defs = calculateDefsForAttack(this.holders, attack.id);
      const mts = calculateMitigationForAttack(this.holders, defs, attack);
      return this.createJobCell(mts, this.it.id);
   }

   private createJobCell(mts: { name: string; id: string; mitigation: number; shield: number; icon: string; }[], v: string) {
      const mt = mts.find(m => m.id === v);
      let cell;
      if (mt) {
         cell = this.items([
            {
               text: (mt.mitigation * 100).toFixed() + "%",
               color: "blue",
               tooltip: "Mitigation",
               ignoreShowText: true
            },
            {
               text: mt.shield.toFixed() + "%",
               color: "red",
               tooltip: "Shield",
               ignoreShowText: true
            }
         ], {});
      } else {
         cell = this.items([], {});
      }
      return cell;
   }
}
