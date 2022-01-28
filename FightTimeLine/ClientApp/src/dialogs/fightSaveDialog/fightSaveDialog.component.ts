import { Component, Inject, Input, TemplateRef, ViewChild , OnInit} from "@angular/core";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import { IFight } from "../../core/Models"
import { IFightService } from "../../services/fight.service-interface"
import { ScreenNotificationsService } from "../../services/ScreenNotificationsService"
import { fightServiceToken } from "../../services/fight.service-provider"
import { NzModalRef } from "ng-zorro-antd/modal";

@Component({
  selector: "fightSaveDialog",
  templateUrl: "./fightSaveDialog.component.html",
  styleUrls: ["./fightSaveDialog.component.css"]
})

export class FightSaveDialog implements OnInit {
  ngOnInit(): void {
  }

  fightNameControl = new FormControl();
  @Input("data") data: IFight;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private notification: ScreenNotificationsService,
    public dialogRef: NzModalRef,
    @Inject(fightServiceToken) public service: IFightService
  ) {
    
  }

  onSaveClick(): void {
    this.submitted = true;
    if (!this.fightNameControl.valid) {
      this.fightNameControl.markAsTouched({ onlySelf: true });
      return;
    }

    this.service
      .saveFight(this.data)
      .subscribe((data) => {
        this.dialogRef.close(data);
      }, this.handleSaveError.bind(this));
  }

  onSaveAsNewClick(): void {
    this.submitted = true;
    if (!this.fightNameControl.valid) {
      this.fightNameControl.markAsTouched({ onlySelf: true });
      return;
    }
    this.data.id = "";
    this.service
      .saveFight(this.data)
      .subscribe((data) => {
        this.dialogRef.close(data);
      }, this.handleSaveError.bind(this));

  }

  handleSaveError(error: any) {
    //console.log(error);
    let text: string = error.statusText;
    if (error.status === 403) {
      text = "Invalid Username or Secret used to update this Fight";
    }
    this.notification.error(text);
  }

  onNoClick(): void {
    this.dialogRef.destroy();
  }

}
