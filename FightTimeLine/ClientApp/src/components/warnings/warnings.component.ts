import { Component, OnDestroy, Inject } from "@angular/core";
import * as S from "../../services/index";
import { Holders } from "../../core/Holders";
import { VisStorageService } from "src/services/VisStorageService";
import { IForSidePanel } from "src/core/Holders/BaseHolder";
import { DispatcherPayloads } from "src/services/dispatcher.service";
import { Subscription } from "rxjs";
import {
  ISidePanelComponent,
  SIDEPANEL_DATA,
  SidepanelParams,
} from "../sidepanel/ISidePanelComponent";
import { Warning } from "src/core/Defensives/types";

@Component({
  selector: "[warnings]",
  templateUrl: "./warnings.component.html",
  styleUrls: ["./warnings.component.css"],
})
export class WarningsComponent implements OnDestroy, ISidePanelComponent {
  items: IForSidePanel[];
  holders: Holders;
  sub: Subscription;
  warnings:Warning[];

  constructor(
    visStorage: VisStorageService,
    @Inject("DispatcherPayloads")
    private dispatcher: S.DispatcherService<DispatcherPayloads>,
    @Inject(SIDEPANEL_DATA) public data: SidepanelParams
  ) {
    this.items = this.data.items;
    this.holders = visStorage.holders;
    this.sub = this.data.refresh.subscribe(() => {
      this.refresh();
    });
    this.refresh();
  }

  refresh() {
    this.warnings = [...this.holders.warnings];
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
