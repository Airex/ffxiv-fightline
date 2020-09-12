import { Component, Inject, Input, TemplateRef, ViewChild, OnInit } from "@angular/core";
import { IExportResultSet } from "../../core/BaseExportTemplate"
import { FormBuilder, FormGroup, Validators, ValidatorFn, FormControl } from "@angular/forms"
import { FirstTemplate } from "../../core/ExportTemplates/FirstTemplate"
import { EachRowOneSecondTemplate } from "../../core/ExportTemplates/EachRowOneSecondTemplate"
import { BossAttackDefensiveTemplate } from "../../core/ExportTemplates/BossAttackDefensiveTemplate"
import { ExportTemplate } from "../../core/BaseExportTemplate"
import { NzModalRef } from "ng-zorro-antd"
import * as Models from "../../core/Models";


@Component({
  selector: "tableViewDialog",
  templateUrl: "./tableViewDialog.component.html",
  styleUrls: ["./tableViewDialog.component.css"]
})
export class TableViewDialog implements OnInit {

  ngOnInit() {
  }

  @Input("data")
  data: Models.ExportData;

  exportTemplatesControl = new FormControl();
  set: IExportResultSet = {
    rows: [],
    columns: [],
    title: ""
  };
  loading = false;
  templates: ExportTemplate[] = [
    new FirstTemplate(), new EachRowOneSecondTemplate(), new BossAttackDefensiveTemplate(),
    new BossAttackDefensiveTemplate(true)
  ];

  constructor(
    public dialogRef: NzModalRef
  ) {
  }

  show() {
    if (!this.exportTemplatesControl.value) return;

    this.loading = true;
    setTimeout(() => {
      const d = this.templates.find(it => it.name === this.exportTemplatesControl.value).build(this.data);
      this.set = d;
      this.loading = false;
    }
    )

  }



  getTitle(text: string) {
    switch (text) {
      case "time":
        return "Time";
      case "boss":
        return "Attack name";
      case "target":
        return "Target";
    }
    return text;
  }

  getWidth(text: string, hasIcon) {
    if (hasIcon)
      return "auto";
    switch (text) {
      case "time":
        return "50px";
      case "boss":
        return "200px";
      case "target":
        return "65px";
    }
    return "";
  }

  onClose(): void {
    this.dialogRef.destroy();
  }
}
