import { Utils } from "./Utils";
import { ExportAttack, ExportData, IExportResultSet, IExportRow, ITableOptions, ITableOptionSettings } from "./ExportModels";
import { PresenterManager } from "./PresentationManager";
import { Holders } from "./Holders";
import { IJobRegistryService } from "src/services/jobregistry.service-interface";
import { IColumnTemplate } from "./TableModels";

export type ExportTemplateContext = {
  data: ExportData,
  presenter: PresenterManager,
  jobRegistry: IJobRegistryService,
  options?: ITableOptions,
  holders?: Holders
};

export abstract class ExportTemplate<RowType = any> {
  public abstract get name(): string;

  abstract getColumns(context: ExportTemplateContext): IColumnTemplate<RowType>[];

  abstract buildTable(context: ExportTemplateContext): IExportResultSet;

  public abstract loadOptions(data?: ExportData): ITableOptionSettings | null;

  offsetCompareFn(a: string, b: string): number {
    const d = new Date();
    return Utils.getDateFromOffset(a, d).valueOf() - Utils.getDateFromOffset(b, d).valueOf();
  }
}

export abstract class AttackRowExportTemplate extends ExportTemplate<ExportAttack>{
  buildTable(context: ExportTemplateContext): IExportResultSet {

    const cols = this.getColumns(context);
    const rows = context.data.data.boss.attacks
      .sort((a, b) => this.offsetCompareFn(a.offset, b.offset))
      .map(attack => ({
        cells: cols.map(t => t.buildCell(context.data, attack)),
        filterData: attack
      }));

    const columns = cols.map(t => t.buildHeader(context.data));

    return {
      columns,
      rows,
      title: this.name,
      filterByFirstEntry: true
    } as IExportResultSet;
  }
}


