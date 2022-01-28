import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { IJobStats } from 'src/core/Models';
import { IGameService } from 'src/services/game.service-interface';
import { gameServiceToken } from 'src/services/game.service-provider';

@Component({
  selector: 'app-character-dialog',
  templateUrl: './character-dialog.component.html',
  styleUrls: ['./character-dialog.component.css']
})
export class CharacterDialogComponent implements OnInit {

  @Input("data") data: IJobStats;
  editForm: FormGroup;
  submitted = false;

  constructor(    
    private formBuilder: FormBuilder,
    @Inject(gameServiceToken)
    public gameService: IGameService,
    public dialogRef: NzModalRef
  ) { }

  get f() { return this.editForm.controls; }

  ngOnInit(): void {
    this.editForm = this.formBuilder.group({
      weaponDamage: new FormControl(this.data.weaponDamage),
      mainStat: new FormControl(this.data.mainStat),
      criticalHit: new FormControl(this.data.criticalHit),
      determination: new FormControl(this.data.determination),
      directHit: new FormControl(this.data.directHit),
      speed: new FormControl(this.data.speed),
      hp: new FormControl(this.data.hp)
    });
  }

  submitForm(): void {
    for (const i in this.editForm.controls) {
      this.editForm.controls[i].markAsDirty();
      this.editForm.controls[i].updateValueAndValidity();
    }
  }


  onSaveClick(): void {
    this.submitted = true;

    if (this.editForm.invalid) {
      Object.values(this.editForm.controls).forEach(it => {
        it.markAsTouched({ onlySelf: true });
      });
      return;
    }
    this.updateResult();

    this.dialogRef.close({ data: this.data });
  };

  updateResult(): void {
    this.data.weaponDamage = this.f.weaponDamage.value;    
    this.data.mainStat = this.f.mainStat.value;
    this.data.criticalHit = this.f.criticalHit.value;
    this.data.determination = this.f.determination.value;
    this.data.directHit = this.f.directHit.value;
    this.data.speed = this.f.speed.value;    
    this.data.hp = this.f.hp.value;    
  }

}
