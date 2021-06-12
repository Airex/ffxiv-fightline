import { IJobRegistryService } from "src/services/jobregistry.service-interface";
import { AttackRowExportTemplate } from "../BaseExportTemplate";
import { calculateDefsForAttack, calculateMitigationForAttack } from "../Defensives";
import { ExportAttack, ExportData, ExportJob, IExportCell, IExportColumn, ITableOptions, ITableOptionSettings } from "../ExportModels";
import { Holders } from "../Holders";
import { PresenterManager } from "../PresentationManager";
import { AttackNameColumn, BaseColumnTemplate, BossTargetColumn, IColumnTemplate, TimeColumn } from "../TableModels";

export class MitigationsTemplate extends AttackRowExportTemplate {
   public get options(): ITableOptionSettings {
      return null;
   }
   public get name(): string {
      return "Mitigations";
   }

   constructor(private ids?: number[]) {
      super()
   }

   getColumns(data: ExportData, presenter: PresenterManager, jobRegistry: IJobRegistryService, options: ITableOptions, holders: Holders): IColumnTemplate<ExportAttack>[] {

      const jobs = data.data.jobs.sort((a, b) => a.role - b.role);

      const partyJob:ExportJob = {
         name: "Party",
         id: "party",
         icon: null,
         order: -1,
         pet: null,
         role: null
      };

      return [
         new TimeColumn(),
         new AttackNameColumn(presenter),
         new BossTargetColumn(false),
         ...[partyJob, ...jobs].map(j => new MitigationColumn(j, holders))
      ];
   }
}

class MitigationColumn extends BaseColumnTemplate implements IColumnTemplate<ExportAttack>{
   constructor(private it: ExportJob, private holders: Holders) {
      super()
   }
   buildHeader(data: ExportData): IExportColumn {
      return {
         text: this.it.name,
         name: this.it.id,
         icon: this.it.icon,
         refId: this.it.id,
         width: "auto"
      } as IExportColumn
   }
   buildCell(data: ExportData, attack: ExportAttack): IExportCell {
      const defs = calculateDefsForAttack(this.holders, attack.id);
      const mts = calculateMitigationForAttack(this.holders, defs, attack)
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
               tooltip: "Mitigation"
            },
            {
               text: mt.shield.toFixed() + "%",
               color: "red",
               tooltip: "Shield"
            }
         ], {});
      } else {
         cell = this.items([], {});
      }
      return cell;
   }
}