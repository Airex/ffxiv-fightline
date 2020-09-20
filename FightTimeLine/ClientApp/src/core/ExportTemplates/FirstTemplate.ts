import { ExportTemplate, IExportResultSet, IExportColumn, IExportRow } from "../BaseExportTemplate"
import * as Models from "../Models";

export class FirstTemplate extends ExportTemplate {
  get name(): string {
    return "First template";
  }


  build(data: Models.ExportData): IExportResultSet {
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
