import { Component, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl } from "@angular/forms"
import { ISettings, SettingsService } from "src/services/SettingsService";
import { ISettingTab } from "../tabs";


@Component({
  selector: "settingsDialogTeamworkTab",
  templateUrl: "./teamwork.component.html",
  styleUrls: ["./teamwork.component.css"]
})

export class SettingsDialogTeamworkTabComponent implements OnInit, ISettingTab {


  teamworkForm: UntypedFormGroup;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private settingsService: SettingsService
  ) {

  }

  ngOnInit() {
    const settings = this.settingsService.load();

    this.teamworkForm = this.formBuilder.group({
      displayName: new UntypedFormControl(settings.teamwork.displayName || "")
    }, {});
  }

  get tf() { return this.teamworkForm.controls; }

  updateResult(settings: ISettings): void {
    settings.teamwork.displayName = this.tf.displayName.value;
  }


}
