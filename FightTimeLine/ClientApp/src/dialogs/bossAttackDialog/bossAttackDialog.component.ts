import { Component, Input, OnInit, ViewChild, Inject } from "@angular/core";
import { SyncSettingsComponent } from "./syncSettings/syncSettings.component"
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms"
import * as M from "../../core/Models";
import { Time } from "../../heplers/TimeValidator";
import { NzModalRef } from "ng-zorro-antd";
import * as Gameserviceprovider from "../../services/game.service-provider";
import * as Gameserviceinterface from "../../services/game.service-interface";

@Component({
  selector: "bossAttackDialog",
  templateUrl: "./bossAttackDialog.component.html",
  styleUrls: ["./bossAttackDialog.component.css"]
})

export class BossAttackDialog implements OnInit {

  @Input("data") data: M.IBossAbility;
  @ViewChild("syncSettings") syncSettings: SyncSettingsComponent;
  editForm: FormGroup;
  submitted = false;
  newAttack = true;
  settings: any;
  uniqueIndex: number = 0;
  expression: string;

  constructor(
    private formBuilder: FormBuilder,
    @Inject(Gameserviceprovider.gameServiceToken) public gameService: Gameserviceinterface.IGameService,
    public dialogRef: NzModalRef) {
  }

  ngOnInit() {
    this.newAttack = !this.data.name;
    this.dialogRef.getInstance().nzFooter = [
      {
        label: "Cancel",
        type: "primary",
        onClick: () => this.dialogRef.destroy()
      },
      {
        label: "Ok",
        onClick: () => this.onSaveClick()
      },
      {
        label: "Ok for All with same name",
        onClick: () => this.onSaveAllClick(),
        show: () => !this.newAttack
      }];

    this.editForm = this.formBuilder.group({
      bossAttackName: new FormControl(this.data.name, Validators.required),
      damageType: new FormControl(this.data.type, Validators.required),
      bossAttackTime: new FormControl(this.data.offset, Validators.required),
      tankBuster: new FormControl(this.data.isTankBuster),
      aoe: new FormControl(this.data.isAoe),
      share: new FormControl(this.data.isShareDamage),
      description: new FormControl(this.data.description)
    }, {
        validator: Time('bossAttackTime')
      });
  }

  get f() { return this.editForm.controls; }

  onNoClick(): void {
    this.dialogRef.destroy();
  }

  updateResult(): void {
    this.data.name = this.f.bossAttackName.value;
    this.f.bossAttackTime.updateValueAndValidity({ onlySelf: true });
    this.data.offset = this.f.bossAttackTime.value;
    this.data.type = this.f.damageType.value;
    this.data.isTankBuster = this.f.tankBuster.value;
    this.data.isAoe = this.f.aoe.value;
    this.data.isShareDamage = this.f.share.value;
    this.data.description = this.f.description.value;

    if (this.syncSettings)
      this.data.syncSettings = this.syncSettings.buildSyncSettings();
  }

  onSaveClick(): void {
    this.submitted = true;

    if (this.editForm.invalid) {
      Object.keys(this.editForm.controls).forEach(it => {
        this.editForm.controls[it].markAsTouched({ onlySelf: true });
      });
      return;
    }
    this.updateResult();

    this.dialogRef.close({ updateAllWithSameName: false, data: this.data });
  };

  onSaveAllClick(): void {
    this.submitted = true;

    if (this.editForm.invalid) {
      Object.keys(this.editForm.controls).forEach(it => {
        this.editForm.controls[it].markAsTouched({ onlySelf: true });
      });
      return;
    }

    this.updateResult();

    this.dialogRef.close({ updateAllWithSameName: true, data: this.data });
  };

}

