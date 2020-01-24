import { Component, Inject,OnInit, ViewChild, TemplateRef } from "@angular/core";
import {NzModalRef} from "ng-zorro-antd";

@Component({
  selector: "helpDialog",
  templateUrl: "./helpDialog.component.html",
  styleUrls: ["./helpDialog.component.css"]
})

export class HelpDialog implements  OnInit {
  ngOnInit(): void {
    this.dialogRef.getInstance().nzFooter = this.buttonsTemplate;
  }

  @ViewChild("buttonsTemplate", { static: true }) buttonsTemplate : TemplateRef<any>;
  constructor(
    private dialogRef: NzModalRef
    ) { }

  onNoClick(): void {
    
  }

  showSection(section: string) {

  }
}
