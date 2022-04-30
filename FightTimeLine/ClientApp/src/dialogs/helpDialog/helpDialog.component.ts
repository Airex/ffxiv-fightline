import { Component } from "@angular/core";
import { NzModalRef } from "ng-zorro-antd/modal";

@Component({
  selector: "helpDialog",
  templateUrl: "./helpDialog.component.html",
  styleUrls: ["./helpDialog.component.css"]
})

export class HelpDialog {



  constructor(
    public dialogRef: NzModalRef
  ) { }

  showSection(section: string) {

  }
}
