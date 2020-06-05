import { Component, Inject, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import { IAbilitySetting, IAbilitySettingData,IAbility } from "../../core/Models";
import { NzModalRef } from "ng-zorro-antd";

@Component({
  selector: "abilityEditDialog",
  templateUrl: "./abilityEditDialog.component.html",
  styleUrls: ["./abilityEditDialog.component.css"]
})
export class AbilityEditDialog implements OnInit {
  ngOnInit(): void {
    const group: any = {};

    for (let d of this.data.settings) {
      const value = this.data.values && this.data.values.find((it) => it.name === d.name);
      group[d.name] = new FormControl(value ? value.value : d.default);
    }

    this.form = new FormGroup(group);
  }

  @Input("data") data: { ability: IAbility, settings: IAbilitySetting[], values: IAbilitySettingData[] }
  form: FormGroup;

  constructor(
    public dialogRef: NzModalRef,
  ) {
    
  }

  onNoClick(): void {
    this.dialogRef.destroy();
  }

  onYesClick(): void {
    const settings = new Array<IAbilitySettingData>();

    const controls = this.form.controls;
    for (let d in controls) {
      if (controls.hasOwnProperty(d)) {
        const control = controls[d];
        settings.push({ name: d, value: control.value });
      }
    }

    this.dialogRef.destroy(settings);
  };
}

