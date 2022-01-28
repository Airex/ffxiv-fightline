import { Component } from "@angular/core";
import { ISettings } from "src/services/SettingsService";
import { ISettingTab } from "../tabs";


@Component({
  selector: "settingsDialogPresetsTab",
  templateUrl: "./presets.component.html",
  styleUrls: ["./presets.component.css"]
})

export class SettingsDialogPresetsTab implements ISettingTab {

  constructor() {

  }

  updateResult(settings: ISettings): void {

  }
}
