import { Component, Inject, Input, TemplateRef, ViewChild, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import { NzModalRef } from "ng-zorro-antd"

@Component({
  selector: "bossSaveDialog",
  templateUrl: "./bossSaveDialog.component.html",
  styleUrls: ["./bossSaveDialog.component.css"]
})

export class BossSaveDialog implements OnInit {
  ngOnInit(): void {
    this.dialogRef.getConfig().nzFooter = this.buttons;
  }

  fightNameControl = new FormControl();
  @ViewChild("buttonsTemplate", { static: true }) buttons: TemplateRef<any>;
  @Input("data") data: string;
  submitted = false;  

  constructor(
    public dialogRef: NzModalRef
  ) {

  }

  onSaveClick(): void {
    this.submitted = true;
    if (!this.fightNameControl.valid) {
      this.fightNameControl.markAsTouched({ onlySelf: true });
      return;
    }

    this.dialogRef.destroy(this.data);
  }
  
  onNoClick(): void {
    this.dialogRef.destroy();
  }

}
