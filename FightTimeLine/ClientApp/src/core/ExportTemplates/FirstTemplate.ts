import { ExportTemplate, IExportResultSet, IExportColumn, IExportRow, ITextCell } from "../BaseExportTemplate"
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
          <ITextCell>{ text: it.offset, type: "text" },
          <ITextCell>{ text: it.name, type: "text" }
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
