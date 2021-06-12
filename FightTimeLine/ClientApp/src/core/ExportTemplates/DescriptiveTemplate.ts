import { AttackRowExportTemplate } from "../BaseExportTemplate"
import { ExportAttack, ExportData, IExportCell, IExportColumn, ITableOptionSettings } from "../ExportModels";
import { PresenterManager } from "../PresentationManager";
import { AttackNameColumn, BaseColumnTemplate, IColumnTemplate, TimeColumn } from "../TableModels";

export class DescriptiveTemplate extends AttackRowExportTemplate {
  public get options(): ITableOptionSettings {
    return null;
  }
  constructor() {
    super();
  }

  get name(): string {
    return "Descriptive";
  }

  getColumns(data: ExportData, presenter: PresenterManager): IColumnTemplate<ExportAttack>[] {
    return [
      new TimeColumn(),
      new AttackNameColumn(presenter),
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
      text: attack.desc
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
    return this.items(attack.tags?.map(t => ({ text: t })) || [], {});
  }
}

