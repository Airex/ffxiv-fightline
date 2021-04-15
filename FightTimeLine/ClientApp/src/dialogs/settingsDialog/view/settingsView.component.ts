import { Component } from "@angular/core";
import { IView } from "../../../core/Models"


@Component({
  selector: "settingsView",
  templateUrl: "./settingsView.component.html",
  styleUrls: ["./settingsView.component.css"]
})
export class SettingsViewComponent {

  public buffmap = false;
  public ogcdAsPoints = false;
  public showDowntimesInPartyArea = false;
  public verticalBossAttacks = false;
  public compactView = false;
  public highlightLoaded = false;
  public abilityAvailablity = false;
  public colorfulDurations = false;


  public set(view: IView): void {
    this.buffmap = view.buffmap;
    this.ogcdAsPoints = view.ogcdAsPoints;
    this.showDowntimesInPartyArea = view.showDowntimesInPartyArea;
    this.verticalBossAttacks = view.verticalBossAttacks;
    this.compactView = view.compactView;
    this.highlightLoaded = view.highlightLoaded;
    this.abilityAvailablity = view.showAbilityAvailablity;
    this.colorfulDurations = view.colorfulDurations;
  }


  public get(): IView {
    return <IView>{
      buffmap: this.buffmap,
      ogcdAsPoints: this.ogcdAsPoints,
      showDowntimesInPartyArea: this.showDowntimesInPartyArea,
      verticalBossAttacks: this.verticalBossAttacks,
      compactView: this.compactView,
      highlightLoaded: this.highlightLoaded,
      showAbilityAvailablity: this.abilityAvailablity,
      colorfulDurations: this.colorfulDurations
    };
  }
}

