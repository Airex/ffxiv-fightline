import { Component, inject, Input } from "@angular/core";
import { UntypedFormControl } from "@angular/forms";
import { NZ_MODAL_DATA, NzModalRef } from "ng-zorro-antd/modal";

@Component({
  selector: "bossSaveDialog",
  templateUrl: "./bossSaveDialog.component.html",
  styleUrls: ["./bossSaveDialog.component.css"]
})

export class BossSaveDialogComponent {
  fightNameControl = new UntypedFormControl();
  @Input() data: string  = inject(NZ_MODAL_DATA);;
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
