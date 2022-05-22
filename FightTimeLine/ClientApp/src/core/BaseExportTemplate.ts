import { Utils } from "./Utils";
import { IExportResultSet,  ITableOptions, ITableOptionSettings } from "./ExportModels";
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

    const cols = this.getColumns(context);
    const rows = context.holders.bossAttacks.getAll()
      .sort((a, b) => this.offsetCompareFn(a.offset, b.offset))
      .map(attack => ({
        cells: cols.map(t => t.buildCell(context.holders, attack)),
        filterData: attack
      }));

    const columns = cols.map(t => t.buildHeader(context.holders));

    return {
      columns,
      rows,
      title: this.name,
      filterByFirstEntry: true
    } as IExportResultSet;
  }
}


