import {
  AttackRowExportTemplate,
  ExportTemplateContext,
} from "../BaseExportTemplate";
import {
  IExportCell,
  IExportColumn,
  ITableOptions,
  ITableOptionSettings,
} from "../ExportModels";
import { Holders } from "../Holders";
import { BossAttackMap } from "../Maps";
import { BaseColumnTemplate, IColumnTemplate } from "../TableModels";
import { AttackNameColumn, AttackTagsColumn } from "./Columns/AttackNameColumn";
import { TimeColumn } from "./Columns/TimeColumn";

export class DescriptiveTemplate extends AttackRowExportTemplate {
  public loadOptions(): ITableOptionSettings {
    return [...super.loadOptions()];
  }
  constructor() {
    super();
  }

  get name(): string {
    return "Descriptive";
  }

  getColumns(context: ExportTemplateContext): IColumnTemplate<BossAttackMap>[] {
    return [
      new TimeColumn(),
      new AttackNameColumn(context.presenter),
      new AttackDescriptionColumn(),
      new AttackTagsColumn(),
    ];
  }
}

class AttackDescriptionColumn
  extends BaseColumnTemplate
  implements IColumnTemplate<BossAttackMap>
{
  buildHeader(data: Holders): IExportColumn {
    return {
      name: "desc",
      text: "Description",
    };
  }
  buildCell(data: Holders, attack: BossAttackMap): IExportCell {
    return this.text({
      text: attack.attack.description,
      ignoreShowText: true,
    });
  }

  getColumns(
    data: Holders,
    at: BossAttackMap,
    options?: ITableOptions
  ): IColumnTemplate<BossAttackMap>[] {
    return undefined;
  }
}
