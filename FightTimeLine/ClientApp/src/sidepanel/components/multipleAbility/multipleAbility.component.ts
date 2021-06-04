import { Component, OnInit, OnDestroy, Inject } from "@angular/core";
import { ISidePanelComponent, SidepanelParams, SIDEPANEL_DATA } from "../ISidePanelComponent"
import * as M from "../../../core/Models"
import * as S from "../../../services/index"
import { Holders } from "../../../core/Holders";
import { JobMap, AbilityMap } from "../../../core/Maps/index";
import { Utils } from "../../../core/Utils";
import { VisStorageService } from "src/services/VisStorageService";


@Component({
  selector: "multipleAbility",
  templateUrl: "./multipleAbility.component.html",
  styleUrls: ["./multipleAbility.component.css"],
})
export class MultipleAbilityComponent implements OnInit, OnDestroy, ISidePanelComponent {


  constructor(
    private visStorage: VisStorageService,
    private dispatcher: S.DispatcherService,
    @Inject(SIDEPANEL_DATA) public data: SidepanelParams
  ) {
    this.items = this.data.items.sort((a:any, b:any) => a.start - b.start);
    this.holders = this.visStorage.holders;
    this.refresh();

  }

  isSameGroup: boolean;
  holders: Holders;
  items: any[];

  refresh() {
    const distinct = (value, index, self) => {
      return self.indexOf(value) === index;
    }
    this.isSameGroup = this.items.map((value) => value.item.group).filter(distinct).length <= 1;
  }

  remove() {
    this.dispatcher.dispatch({
      name: "SidePanel Multiple Abilities Remove",
      payload: this.items.map(p => p.id)
    });
  }

  formatDate(date: Date): string {
    return Utils.formatTime(date);
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

}
