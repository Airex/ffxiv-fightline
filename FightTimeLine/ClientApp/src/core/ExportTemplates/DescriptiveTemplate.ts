import { AttackRowExportTemplate, ExportTemplateContext } from "../BaseExportTemplate"
import { ExportAttack, ExportData, IExportCell, IExportColumn, ITableOptionSettings } from "../ExportModels";
import { AttackNameColumn, BaseColumnTemplate, IColumnTemplate, TimeColumn } from "../TableModels";

export class DescriptiveTemplate extends AttackRowExportTemplate {
  public loadOptions(): ITableOptionSettings {
    return null;
  }
  constructor() {
    super();
  }

  get name(): string {
    return "Descriptive";
  }

  getColumns(context:ExportTemplateContext): IColumnTemplate<ExportAttack>[] {
    return [
      new TimeColumn(),
      new AttackNameColumn(context.presenter),
      new AttackDescriptionColumn(),
      new AttackTagsColumn()
    ];
  }
}

class AttackDescriptionColumn extends BaseColumnTemplate implements IColumnTemplate<ExportAttack>{
  buildHeader(data: ExportData): IExportColumn {
    return {
      name: "desc",
      text: "Description",
    };
  }
  buildCell(data: ExportData, attack: ExportAttack): IExportCell {
    return this.text({
      text: attack.desc,
      ignoreShowText: true
    })
  }
}

class AttackTagsColumn extends BaseColumnTemplate implements IColumnTemplate<ExportAttack>{
  buildHeader(data: ExportData): IExportColumn {
    return {
      name: "tags",
      text: "Tags",
    };
  }
  buildCell(data: ExportData, attack: ExportAttack): IExportCell {
    return this.items(attack.tags?.map(t => ({ text: t, ignoreShowText: true })) || [], {});
  }
}

