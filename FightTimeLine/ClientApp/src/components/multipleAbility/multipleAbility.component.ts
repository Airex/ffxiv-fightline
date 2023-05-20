import { Component, OnInit, OnDestroy, Inject } from "@angular/core";
import * as S from "../../services/index";
import { Holders } from "../../core/Holders";
import { Utils } from "../../core/Utils";
import { VisStorageService } from "src/services/VisStorageService";
import { DispatcherPayloads } from "src/services/dispatcher.service";
import { Subscription } from "rxjs";
import { ISidePanelComponent, SIDEPANEL_DATA, SidepanelParams } from "../sidepanel/ISidePanelComponent";


@Component({
  selector: "multipleAbility",
  templateUrl: "./multipleAbility.component.html",
  styleUrls: ["./multipleAbility.component.css"],
})
export class MultipleAbilityComponent implements OnDestroy, ISidePanelComponent {


  constructor(
    private visStorage: VisStorageService,
    @Inject("DispatcherPayloads") private dispatcher: S.DispatcherService<DispatcherPayloads>,
    @Inject(SIDEPANEL_DATA) public data: SidepanelParams
  ) {
    this.items = this.data.items.sort((a: any, b: any) => a.start - b.start);
    this.holders = this.visStorage.holders;
    this.sub = this.data.refresh.subscribe(() => {
      this.refresh();
    });
    this.refresh();

  }

  isSameGroup: boolean;
  holders: Holders;
  items: any[];
  sub: Subscription;

  refresh() {
    const distinct = (value, index, self) => {
      return self.indexOf(value) === index;
    };
    this.isSameGroup = this.items.map((value) => value.item.group).filter(distinct).length <= 1;
  }

  remove() {
    this.dispatcher.dispatch("abilitiesRemove", this.items.map(p => p.id));
  }

  formatDate(date: Date): string {
    return Utils.formatTime(date);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

}
