import { Component, OnInit, OnDestroy, Inject } from "@angular/core";
import { ISidePanelComponent, SidepanelParams, SIDEPANEL_DATA } from "../ISidePanelComponent"
import * as M from "../../../core/Models"
import * as S from "../../../services/index"
import { Holders } from "../../../core/Holders";
import { JobMap, AbilityMap } from "../../../core/Maps/index";
import { Utils } from "../../../core/Utils";

@Component({
  selector: "multipleAttack",
  templateUrl: "./multipleAttack.component.html",
  styleUrls: ["./multipleAttack.component.css"],
})
export class MultipleAttackComponent implements OnInit, OnDestroy, ISidePanelComponent {
  

  constructor(
    private dispatcher: S.DispatcherService,
    @Inject(SIDEPANEL_DATA) private data: SidepanelParams
  ) {
    this.items = this.data.items;
    this.holders = this.data.holders;
    this.refresh();

  }

  isSameName: boolean;
  holders: Holders;
  items: any[];

  get ability(): any {
    return this.items[0];
  }

  refresh() {
    const distinct = (value, index, self) => {
      return self.indexOf(value) === index;
    }
    this.isSameName = this.items.map((value) => value.attack.name).filter(distinct).length <= 1;
  }

  remove() {
    this.dispatcher.dispatch({
      name: "SidePanel Multiple Attacks Remove",
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
