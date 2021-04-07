import { ExportTemplate } from "../BaseExportTemplate"
import { ExportData, IExportColumn, IExportResultSet, IExportRow } from "../ExportModels";

export class FirstTemplate extends ExportTemplate {
  get name(): string {
    return "First template";
  }


  build(data: ExportData): IExportResultSet {
    const rows = data.data.boss.attacks
      .sort((a, b) => this.offsetCompareFn(a.offset, b.offset))
      .map(it => <IExportRow>{
        cells: [
          this.text({ text: it.offset }),
          this.text({ text: it.name })
        ]
      });
    return <IExportResultSet>{
      columns: [
        <IExportColumn>{ text: "time" },
        <IExportColumn>{ text: "name" }
      ],
      rows: rows,
      title: this.name
    };
  }
}
