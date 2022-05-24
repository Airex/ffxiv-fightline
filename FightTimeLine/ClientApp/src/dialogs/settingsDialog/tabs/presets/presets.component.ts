import { Component } from "@angular/core";
import { IPresetStorage, IPresetTemplate } from "src/core/Models";
import { LocalStorageService } from "src/services";
import { ISettings } from "src/services/SettingsService";
import { VisStorageService } from "src/services/VisStorageService";
import { ISettingTab } from "../tabs";


@Component({
  selector: "settingsDialogPresetsTab",
  templateUrl: "./presets.component.html",
  styleUrls: ["./presets.component.css"]
})

export class SettingsDialogPresetsTab implements ISettingTab {

  constructor(private storage: LocalStorageService, private visStorage: VisStorageService) {

  }

  presets = Object.entries(this.storage.getObject<IPresetStorage>("presets") || {});

  removevisiblechanged(el: HTMLElement, visible: any) { // todo: check passed value
    el.className = el.className.replace("forcevisible", "");
    if (visible) {
      el.className += " forcevisible";
    }
  }

  remove(v) {

    const p = this.storage.getObject<IPresetStorage>("presets") || {};
    delete p[v[0]];
    this.storage.setObject("presets", p);
    this.visStorage.presenter.presets = p;
    this.visStorage.presenter.selectedPreset =
      this.visStorage.presenter.selectedPreset in this.visStorage.presenter.presets
        ? this.visStorage.presenter.selectedPreset
        : undefined;

    this.presets = Object.entries(p);

  }

  updateResult(settings: ISettings): void {

  }
}
