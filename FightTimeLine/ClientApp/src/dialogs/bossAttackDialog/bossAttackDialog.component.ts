import { Component, Input, OnInit, ViewChild, Inject } from "@angular/core";
import { SyncSettingsComponent } from "./syncSettings/syncSettings.component";
import { SyncDowntimeComponent } from "./syncDowntime/syncDowntime.component";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { IBossAbility } from "../../core/Models";
import { time } from "../../heplers/TimeValidator";
import { gameServiceToken } from "../../services/game.service-provider";
import { IGameService } from "../../services/game.service-interface";
import { NzModalRef } from "ng-zorro-antd/modal";
import { VisStorageService } from "src/services/VisStorageService";

@Component({
  selector: "bossAttackDialog",
  templateUrl: "./bossAttackDialog.component.html",
  styleUrls: ["./bossAttackDialog.component.css"]
})
export class BossAttackDialog implements OnInit {

  @Input() data: IBossAbility;
  @ViewChild("syncSettings") syncSettings: SyncSettingsComponent;
  @ViewChild("syncDowntime") syncDowntime: SyncDowntimeComponent;
  editForm: FormGroup;
  submitted = false;
  newAttack = true;
  settings: any;
  uniqueIndex = 0;
  expression: string;
  defaultTags  = [];

  colors = ["red", "blue", "pink", "purple", "green", "orange", "silver"];

  constructor(
    private visStorage: VisStorageService,
    private formBuilder: FormBuilder,
    @Inject(gameServiceToken)
    public gameService: IGameService,
    public dialogRef: NzModalRef) {
  }

  ngOnInit() {
    this.newAttack = !this.data.name;
    this.defaultTags = this.visStorage.presenter.activeTags.filter(t => t.text !==  "Other");
    this.editForm = this.formBuilder.group({
      bossAttackName: new FormControl(this.data.name, Validators.required),
      damageType: new FormControl(this.data.type || 0, Validators.required),
      bossAttackTime: new FormControl(this.data.offset, Validators.required),
      bossAttackSource: new FormControl(this.data.source),
      description: new FormControl(this.data.description),
      tags: new FormControl(this.data.tags),
      rawDamage: new FormControl(this.data.rawDamage),
      color: new FormControl(this.data.color)
    }, {
        validator: time('bossAttackTime')
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
    this.data.source = this.f.bossAttackSource.value;
    this.data.description = this.f.description.value;
    this.data.tags = this.f.tags.value;
    this.data.rawDamage = this.f.rawDamage.value;
    this.data.color = this.f.color.value;

    if (this.syncSettings) {
      this.data.syncSettings = this.syncSettings.buildSyncSettings();
    }
    if (this.syncDowntime) {
      this.data.syncDowntime = this.syncDowntime.selected;
    }
    if (this.syncDowntime) {
      this.data.syncPreDowntime = this.syncDowntime.selectedPre;
    }
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
  }

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
  }

}

