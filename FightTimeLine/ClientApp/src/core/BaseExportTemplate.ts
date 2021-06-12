import { Utils } from "./Utils"
import { ExportAttack, ExportData, IExportCell, IExportItem, IExportResultSet, IExportRow, ITableOptions, ITableOptionSettings } from "./ExportModels";
import { PresenterManager } from "./PresentationManager";
import { Holders } from "./Holders";
import { IJobRegistryService } from "src/services/jobregistry.service-interface";
import { IColumnTemplate } from "./TableModels";

export abstract class ExportTemplate<RowType = any> {
  public abstract get name(): string;

  abstract getColumns(
    data: ExportData,
    presenter: PresenterManager,
    jobRegistry: IJobRegistryService,
    options?: ITableOptions,
    holders?: Holders
  ): IColumnTemplate<RowType>[];

  abstract buildTable(
    data: ExportData,
    presenter: PresenterManager,
    jobRegistry: IJobRegistryService,
    options?: ITableOptions,
    holders?: Holders
  ): IExportResultSet;

  public abstract get options(): ITableOptionSettings | null;

  offsetCompareFn(a: string, b: string): number {
    const d = new Date();
    return Utils.getDateFromOffset(a, d).valueOf() - Utils.getDateFromOffset(b, d).valueOf();
  }
}

export abstract class AttackRowExportTemplate extends ExportTemplate<ExportAttack>{
  buildTable(
    data: ExportData,
    presenter: PresenterManager,
    jobRegistry: IJobRegistryService,
    options?: ITableOptions,
    holders?: Holders
  ): IExportResultSet {

    const cols = this.getColumns(data, presenter, jobRegistry, options, holders);
    const rows = data.data.boss.attacks
      .sort((a, b) => this.offsetCompareFn(a.offset, b.offset))
      .map(attack => <IExportRow>{
        cells: cols.map(t => t.buildCell(data, attack)),
        filterData: attack
      });

    const columns = cols.map(t => t.buildHeader(data));

    return <IExportResultSet>{
      columns: columns,
      rows: rows,
      title: this.name,
      filterByFirstEntry: true
    };
  }
}


