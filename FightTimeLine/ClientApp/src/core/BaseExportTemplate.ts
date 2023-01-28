import { Utils } from "./Utils";
import { IExportResultSet, ITableOptions, ITableOptionSettings } from "./ExportModels";
import { PresenterManager } from "./PresentationManager";
import { Holders } from "./Holders";
import { IJobRegistryService } from "src/services/jobregistry.service-interface";
import { IColumnTemplate } from "./TableModels";
import { BossAttackMap } from "./Maps";

export type ExportTemplateContext = {
  presenter: PresenterManager,
  jobRegistry: IJobRegistryService,
  options?: ITableOptions,
  holders?: Holders
};

export abstract class TableViewTemplate<RowType = any> {
  public abstract get name(): string;

  abstract getColumns(context: ExportTemplateContext): IColumnTemplate<RowType>[];

  abstract buildTable(context: ExportTemplateContext): IExportResultSet;

  public abstract loadOptions(holders?: Holders): ITableOptionSettings | null;

  offsetCompareFn(a: string, b: string): number {
    const d = new Date();
    return Utils.getDateFromOffset(a, d).valueOf() - Utils.getDateFromOffset(b, d).valueOf();
  }
}

export abstract class AttackRowExportTemplate extends TableViewTemplate<BossAttackMap>{
  buildTable(context: ExportTemplateContext): IExportResultSet {

    const ffSource  = context.options['fflogs']? 'cast' : 'damage';

    const cols = this.getColumns(context);
    const headers = cols.map(t => t.buildHeader(context.holders));
    const rows = context.holders.bossAttacks.getAll()
      .filter(a=> a.isForFfLogs(ffSource))
      .sort((a, b) => this.offsetCompareFn(a.offset, b.offset))
      .map(attack => ({
        cells: cols.map(columnTemplate => columnTemplate.buildCell(context.holders, attack)),
        filterData: attack
      }));

    return {
      columns: headers,
      rows,
      title: this.name,
      filterByFirstEntry: true
    } as IExportResultSet;
  }
}


