import { Component, Inject,OnInit, ViewChild, TemplateRef } from "@angular/core";
import {NzModalRef} from "ng-zorro-antd";

@Component({
  selector: "helpDialog",
  templateUrl: "./helpDialog.component.html",
  styleUrls: ["./helpDialog.component.css"]
})

export class HelpDialog implements  OnInit {
  ngOnInit(): void {
  }

  
  constructor(
    private dialogRef: NzModalRef
    ) { }

  onNoClick(): void {
    
  }

  showSection(section: string) {

  }
}
