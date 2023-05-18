import { Component, Inject, ViewChild } from "@angular/core";
import { SettingsService, ISettings } from "../../services/SettingsService";
import * as Gameserviceinterface from "../../services/game.service-interface";
import * as Gameserviceprovider from "../../services/game.service-provider";
import * as Dispatcherservice from "../../services/dispatcher.service";
import { NzModalRef } from "ng-zorro-antd/modal";
import { ISettingTab } from "./tabs/tabs";
import { SettingsDialogColorTabComponent } from "./tabs/colors/colors.component";
import { SettingsDialogFflogsTabComponent } from "./tabs/fflogs/fflogs.component";
import { SettingsDialogMainTabComponent } from "./tabs/main/main.component";
import { SettingsDialogPresetsTabComponent } from "./tabs/presets/presets.component";
import { SettingsDialogTableviewTabComponent } from "./tabs/tableview/tableview.component";
import { SettingsDialogTeamworkTabComponent } from "./tabs/teamwork/teamwork.component";
import { DispatcherPayloads } from "../../services/dispatcher.service";

@Component({
  selector: "settingsDialog",
  templateUrl: "./settingsDialog.component.html",
  styleUrls: ["./settingsDialog.component.css"]
})
export class SettingsDialogComponent {

  constructor(
    private dialogRef: NzModalRef,
    private settingsService: SettingsService,
    @Inject("DispatcherPayloads") private dispatcher: Dispatcherservice.DispatcherService<DispatcherPayloads>,
    @Inject(Gameserviceprovider.gameServiceToken) public gameService: Gameserviceinterface.IGameService) {
  }

  @ViewChild(SettingsDialogColorTabComponent) tab1: ISettingTab;
  @ViewChild(SettingsDialogFflogsTabComponent) tab2: ISettingTab;
  @ViewChild(SettingsDialogMainTabComponent) tab3: ISettingTab;
  @ViewChild(SettingsDialogPresetsTabComponent) tab4: ISettingTab;
  @ViewChild(SettingsDialogTableviewTabComponent) tab5: ISettingTab;
  @ViewChild(SettingsDialogTeamworkTabComponent) tab6: ISettingTab;


  onYesClick() {

    const settings = this.settingsService.load();
    this.updateResult(settings);
    this.settingsService.save(settings);
    this.dispatcher.dispatch("updateSettings");
    this.dialogRef.destroy();


  }

  updateResult(settings: ISettings): void {
    const tabs = [this.tab1, this.tab2, this.tab3, this.tab4, this.tab5, this.tab6];
    tabs.forEach(t => t.updateResult(settings));
  }

  onNoClick(): void {
    this.dialogRef.destroy();
  }
}
