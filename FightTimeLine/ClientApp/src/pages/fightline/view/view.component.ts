import { Component, EventEmitter, Output } from "@angular/core";
import { VisStorageService } from "src/services/VisStorageService";
import { IView } from "../../../core/Models";
import { PresenterManager } from "../../../core/PresentationManager";
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from "@ngx-translate/core";

type NewType = { [name in keyof IView]: [number, string] };

@Component({
  selector: "viewMenu",
  templateUrl: "./view.component.html",
  styleUrls: ["./view.component.css"]
})
export class ViewComponent {

  public presenterManager: PresenterManager;
  @Output() public changed: EventEmitter<IView> = new EventEmitter();

  options = this.loadView();
  constructor(
    private visStorage: VisStorageService,
    private trans: TranslateService
  ) {
    this.trans.onLangChange.subscribe(() => {
      this.options = this.loadView();
    });
    this.presenterManager = this.visStorage.presenter;
  }

  loadView() {
    return Object.entries({
      showDowntimesInPartyArea: [0, this.trans.instant(marker("view.phasesInPartyArea"))], // Phases in party area
      buffmap: [1, this.trans.instant(marker("view.damageBuffsHeatmap"))], // Damage Buffs Heatmap
      ogcdAsPoints: [2, this.trans.instant(marker("view.ogcdAsPoints"))], // OGCD attacks as points
      verticalBossAttacks: [3, this.trans.instant(marker("view.verticalBossAttacks"))], // Vertical Boss Attacks
      compactView: [4, this.trans.instant(marker("view.compactView"))],  // Compact View
      highlightLoaded: [5, this.trans.instant(marker("view.highlightLoaded"))],  // Highlight Loaded
      showAbilityAvailablity: [6, this.trans.instant(marker("view.abiliesAvailability"))], // Abilities Availability Map
      colorfulDurations: [7, this.trans.instant(marker("view.colorfullDurations"))] // Colorful Durations
    } as NewType)
      .filter(f => f[1][1])
      .sort((a, b) => a[1][0] - b[1][0])
      .map(a => ({ name: a[0], desc: a[1][1] }));

  }



  updateView(): void {
    setTimeout(() => {
      this.changed.emit(this.presenterManager.view);
    });

  }
}

