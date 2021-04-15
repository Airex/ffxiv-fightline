import { Component, ViewChild, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms"
import { IGameService } from "src/services/game.service-interface";
import { gameServiceToken } from "src/services/game.service-provider";
import { ScreenNotificationsService } from "src/services/ScreenNotificationsService";
import { ISettings, SettingsService } from "src/services/SettingsService";
import { SettingsFilterComponent } from "../../filter/settingsFilter.component";
import { SettingsViewComponent } from "../../view/settingsView.component";
import { ISettingTab } from "../tabs";


@Component({
  selector: "settingsMainTab",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.css"]
})

export class SettingsDialogMainTab implements OnInit, ISettingTab {

  mainForm: FormGroup;      

  @ViewChild("filter", { static: true })
  filter: SettingsFilterComponent;
  @ViewChild("view", { static: true })
  view: SettingsViewComponent;

  colors: any[];

  constructor(    
    private formBuilder: FormBuilder,
    private settingsService: SettingsService,    
    @Inject(gameServiceToken) public gameService: IGameService,
    private notifications: ScreenNotificationsService) {
  }

  ngOnInit() {
    const settings = this.settingsService.load();   
    
    this.filter.set(settings.main.defaultFilter);
    this.view.set(settings.main.defaultView);
    this.colors = Object.keys(settings.colors).map(it => {
      return {
        name: it,
        color: settings.colors[it]
      }
    });

    this.mainForm = this.formBuilder.group({}, {});    
  }

  get mf() { return this.mainForm.controls; }    
  
  updateResult(settings: ISettings): void {    

    settings.main.defaultView = this.view.get();
    settings.main.defaultFilter = this.filter.get();    
  }
  

  onClearCachesClick(): void {
    localStorage.removeItem("events_cache");
    localStorage.removeItem("zones_cache");
    localStorage.removeItem("fights_cache");
    this.notifications.info("Caches have been cleared.");
  }
}
