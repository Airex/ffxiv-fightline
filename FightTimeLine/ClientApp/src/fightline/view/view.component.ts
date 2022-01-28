import { Component, EventEmitter, Output } from "@angular/core";
import { VisStorageService } from "src/services/VisStorageService";
import { IView } from "../../core/Models"
import { PresenterManager } from "../../core/PresentationManager"


@Component({
  selector: "viewMenu",
  templateUrl: "./view.component.html",
  styleUrls: ["./view.component.css"]
})
export class ViewComponent {

  public presenterManager: PresenterManager;
  @Output() public changed: EventEmitter<IView> = new EventEmitter();

  constructor(
    private visStorage: VisStorageService
  ) {
    this.presenterManager = this.visStorage.presenter;
  }

  options = Object.entries(<{ [name in keyof IView]: [number, string] }>{
    showDowntimesInPartyArea: [0, "Phases in party area"],
    buffmap: [1, "Damage Buffs Heatmap"],
    ogcdAsPoints: [2, "OGCD attacks as points"],
    verticalBossAttacks: [3, "Vertical Boss Attacks"],
    compactView: [4, "Compact View"],
    highlightLoaded: [5, "Highlight Loaded"],
    showAbilityAvailablity: [6, "Abilities Availability Map"],
    colorfulDurations: [7, "Colorful Durations"]    
  })
    .filter(f => f[1][1])
    .sort((a, b) => a[1][0] - b[1][0])
    .map(a => ({ name: a[0], desc: a[1][1] }));

  updateView(): void {
    setTimeout(() => {
      this.changed.emit(this.presenterManager.view);
    });

  }
}

