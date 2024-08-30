import { Utils } from "./Utils";
import {
  IExportColumn,
  IExportResultSet,
  ITableOptions,
  ITableOptionSettings,
  TableOptionSettingType,
} from "./ExportModels";
import { PresenterManager } from "./PresentationManager";
import { Holders } from "./Holders";
import { IJobRegistryService } from "src/services/jobregistry.service-interface";
import { IColumnTemplate } from "./TableModels";
import { BossAttackMap, BossTargetMap } from "./Maps";
import { generate } from "ng-zorro-antd/core/color";

export type ExportTemplateContext = {
  presenter: PresenterManager;
  jobRegistry: IJobRegistryService;
  options?: ITableOptions;
  holders?: Holders;
};

export abstract class TableViewTemplate<RowType = any> {
  public abstract get name(): string;

  abstract getColumns(
    context: ExportTemplateContext
  ): IColumnTemplate<RowType>[];

  abstract buildTable(context: ExportTemplateContext): IExportResultSet;

  public abstract loadOptions(holders?: Holders): ITableOptionSettings | null;

  offsetCompareFn(a: string, b: string): number {
    const d = new Date();
    return (
      Utils.getDateFromOffset(a).valueOf() -
      Utils.getDateFromOffset(b).valueOf()
    );
  }
}

export abstract class AttackRowExportTemplate extends TableViewTemplate<BossAttackMap> {
  public loadOptions(holders?: Holders): ITableOptionSettings | null {
    return [
      {
        name: "fflogs",
        defaultValue: false,
        displayName: "FFLogsSource",
        kind: TableOptionSettingType.Boolean,
        visible: true,
        options: {
          true: "Cast",
          false: "Damage",
        },
      },
    ];
  }

  recalculateColumns(columns: IColumnTemplate<BossAttackMap>[]) {
    const layers = [];
    for (const column of columns) {
      if (column.getColumns) {
        layers.push(column.getColumns);
      }
    }
  }

  buildTable(context: ExportTemplateContext): IExportResultSet {
    const ffSource = context.options["fflogs"] ? "cast" : "damage";

    const rawCols = this.getColumns(context);
    const cols = getBottomColumns(rawCols, context.holders, context.options);

    const headers = generateTableHeaders(
      rawCols,
      context.holders,
      context.options
    );
    const rows = context.holders.bossAttacks
      .getAll()
      .filter((a) => a.isForFfLogs(ffSource))
      .sort((a, b) => this.offsetCompareFn(a.offset, b.offset))
      .map((attack) => ({
        cells: cols.map((columnTemplate) =>
          columnTemplate.buildCell(context.holders, attack)
        ),
        filterData: attack,
      }));

    return {
      headers: headers,
      columns: cols.map((x) => x.buildHeader(context.holders)),
      rows,
      title: this.name,
      filterByFirstEntry: true,
    } as IExportResultSet;
  }
}

// Function to get the most bottom (leaf) columns in the same order as declared in the array
function getBottomColumns(
  columns: IColumnTemplate<BossAttackMap>[],
  holder: Holders,
  options?: ITableOptions
): IColumnTemplate<BossAttackMap>[] {
  let bottomColumns = [];

  function traverse(column: IColumnTemplate<BossAttackMap>, _i, _a) {
    const childColumns = column.getColumns(holder, options);
    if (!childColumns?.length) {
      // If there are no children, this is a bottom column
      bottomColumns.push(column);
    } else {
      // Otherwise, continue to traverse the children
      childColumns.forEach(traverse);
    }
  }

  columns.forEach(traverse);
  return bottomColumns;
}

// Function to calculate the depth of columns recursively
function calculateDepth(
  column: IColumnTemplate<BossAttackMap>,
  holders: Holders,
  options?: ITableOptions
): number {
  const childColumns = column.getColumns(holders, options);
  if (!childColumns?.length) {
    return 1;
  }
  return (
    1 +
    Math.max(...childColumns.map((x) => calculateDepth(x, holders, options)))
  );
}

// Function to convert columns to HTML
function generateTableHeaders(
  columns: IColumnTemplate<BossAttackMap>[],
  holders: Holders,
  options?: ITableOptions
) {
  const maxDepth = Math.max(
    ...columns.map((x) => calculateDepth(x, holders, options))
  );
  let rows = Array.from({ length: maxDepth }, () => [] as IExportColumn[]);

  function fillRows(column: IColumnTemplate<BossAttackMap>, depth: number) {
    const childColumns = column.getColumns(holders, options);
    const rowspan = maxDepth - depth;
    const colspan =
      !childColumns?.length
        ? 1
        : childColumns
            .map((x) => calculateDepth(x, holders, options))
            .reduce((a, b) => a + b, 0);

    const header = column.buildHeader(holders);
    header.rowSpan = !childColumns?.length ? rowspan : 1;
    header.colSpan = !!childColumns?.length ? colspan : 1;
    rows[depth].push(header);

    childColumns?.forEach((child) => fillRows(child, depth + 1));
  }

  columns.forEach((col) => fillRows(col, 0));
  return rows;
}
