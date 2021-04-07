import { Component, Inject, Input, TemplateRef, ViewChild, OnInit } from "@angular/core";
import { EachRowOneSecondTemplate } from "../../core/ExportTemplates/EachRowOneSecondTemplate"
import { BossAttackDefensiveTemplate } from "../../core/ExportTemplates/BossAttackDefensiveTemplate"
import { ExportTemplate } from "../../core/BaseExportTemplate"
import { NzModalRef } from "ng-zorro-antd/modal";
import { DescriptiveTemplate } from "src/core/ExportTemplates/DescriptiveTemplate";
import { ExportData, IExportCell, IExportColumn, IExportResultSet, IExportRow } from "src/core/ExportModels";
import { PresenterManager } from "src/core/PresentationManager";


@Component({
  selector: "tableViewDialog",
  templateUrl: "./tableViewDialog.component.html",
  styleUrls: ["./tableViewDialog.component.css"]
})
export class TableViewDialog implements OnInit {


  pagesize = Number.MAX_VALUE;
  ngOnInit() {
  }

  @Input("data")
  data: ExportData;
  presenterManager = new PresenterManager();

  selectedValue = null;
  
  set: IExportResultSet = {
    rows: [],
    columns: [],
    title: "",
    filterByFirstEntry: false
  };
  loading = false;
  templates: ExportTemplate[] = [    
    new EachRowOneSecondTemplate(), 
    new BossAttackDefensiveTemplate(),
    new BossAttackDefensiveTemplate(true),
    new DescriptiveTemplate()
  ];

  constructor(
    public dialogRef: NzModalRef
  ) {
  }

  show() {
    if (!this.selectedValue) return;

    this.loading = true;
    setTimeout(() => {
      const d = this.templates.find(it => it.name === this.selectedValue).build(this.data, this.presenterManager);
      this.set = d;
      this.filterChange(null, null);
      this.loading = false;
    }
    )

  }
  
  filtered: IExportRow[] = [];

  filterData = {};

  filterChange(event: any, column: string) {
    if (column) {
      this.filterData[column] = event;
    }
    const cellFilter = this.filterCell();
    this.filtered = this.set.rows.filter(row => {
      const visible = this.set.columns.every(c => {
        return !c.filterFn || !this.filterData[c.name] || c.filterFn(this.filterData[c.name], row, c)
      });

      if (visible)
        row.cells.forEach(cell => cellFilter(cell));

      return visible;
    });
  }


  filterCell() {
    let unique = new Set();
    const fn = (cell: IExportCell) => {
      if (cell.disableUnique) return;
      cell.items.forEach(it => {
        if (!it.refId) return;
        if (unique.has(it.refId)) {
          it.visible = false;
        } else {
          it.visible = true;
          unique.add(it.refId)
        }
      });
    };
    return fn;
  }

  trackByName(_: number, item: IExportColumn): string {
    return item.text;
  }

  onClose(): void {
    this.dialogRef.destroy();
  }
}
