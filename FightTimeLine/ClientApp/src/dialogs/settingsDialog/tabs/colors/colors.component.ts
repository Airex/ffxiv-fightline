import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms"
import { IGameService } from "src/services/game.service-interface";
import { gameServiceToken } from "src/services/game.service-provider";
import { ISettings, SettingsService } from "src/services/SettingsService";
import { ISettingTab } from "../tabs";


@Component({
  selector: "settingsColorsTab",
  templateUrl: "./colors.component.html",
  styleUrls: ["./colors.component.css"]
})

export class SettingsDialogColorTab implements ISettingTab, OnInit {

  colorsForm: FormGroup;

  colorDisplayNames: { [t: string]: string } = {
    SelfShield: "Self Shield",
    Healing: "Healing",
    HealingBuff: "Healing Buff",
    PartyDamageBuff: "Party Damage Buff",
    PartyDefense: "Party Defense",
    PartyShield: "Party Shield",
    SelfDamageBuff: "Self Damage Buff",
    SelfDefense: "Self Defense",
    TargetDefense: "Target Defense",
    Utility: "Utility"
  }

  colors: any[];

  constructor(
    private formBuilder: FormBuilder,
    private settingsService: SettingsService,
    @Inject(gameServiceToken) public gameService: IGameService) {

  }

  ngOnInit() {
    const settings = this.settingsService.load();

    this.colors = Object.keys(settings.colors).map(it => {
      return {
        name: it,
        color: settings.colors[it]
      }
    });

    this.colorsForm = this.formBuilder.group({}, {});
  }


  updateResult(settings: ISettings): void {
    settings.colors = this.colors.reduce((p, c) => {
      p[c.name] = c.color;
      return p;
    }, {});
  }
}
