import { Component, Inject, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import { IAbilitySetting, IAbilitySettingData,IAbility, IFraction } from "../../core/Models";
import { ActivatedRoute, Router } from "@angular/router";
import { NzModalRef } from "ng-zorro-antd/modal";

@Component({
  selector: "fractionSelectionDialog",
  templateUrl: "./fractionSelectionDialog.component.html",
  styleUrls: ["./fractionSelectionDialog.component.css"]
})
export class FractionSelectionDialog implements OnInit {
  ngOnInit(): void {
  }

  @Input("data") data: IFraction[];

  constructor(
    public dialogRef: NzModalRef,
    private router: Router,
  ) {
    this.dialogRef.getConfig().nzFooter = [
      {
        label: "Cancel",
        type: "primary",
        onClick: () => this.onNoClick()
      }
    ];
  }

  onClick(fraction: string) {
    this.dialogRef.destroy(fraction);
  }

  onNoClick(): void {
    this.dialogRef.destroy();
  }
  
}

