import { Component, OnInit, OnDestroy, Inject } from "@angular/core";
import { ISidePanelComponent, SidepanelParams, SIDEPANEL_DATA } from "../ISidePanelComponent"
import * as M from "../../../core/Models"
import * as S from "../../../services/index"
import { Holders } from "../../../core/Holders";
import { JobMap, AbilityMap } from "../../../core/Maps/index";
import { Utils } from "../../../core/Utils";
import * as Index from "../../../core/Maps/index";
import { VisStorageService } from "src/services/VisStorageService";
import { DispatcherPayloads } from "src/services/dispatcher.service";

@Component({
  selector: "multipleAttack",
  templateUrl: "./multipleAttack.component.html",
  styleUrls: ["./multipleAttack.component.css"],
})
export class MultipleAttackComponent implements OnInit, OnDestroy, ISidePanelComponent {


  constructor(
    private visStorage: VisStorageService,
    @Inject("DispatcherPayloads") private dispatcher: S.DispatcherService<DispatcherPayloads>,
    @Inject(SIDEPANEL_DATA) public data: SidepanelParams
  ) {
    this.items = this.data.items.sort((a: Index.BossAttackMap, b: Index.BossAttackMap) => a.startAsNumber - b.startAsNumber);
    this.holders = this.visStorage.holders;
    this.refresh();
  }

  isSameName: boolean;
  holders: Holders;
  items: any[];
  distance: string;

  get ability(): any {
    return this.items[0];
  }

  refresh() {
    const distinct = (value, index, self) => {
      return self.indexOf(value) === index;
    }
    this.isSameName = this.items.map((value) => value.attack.name).filter(distinct).length <= 1;
    if (this.items.length === 2) {
      this.distance = Utils.formatTime(new Date(Math.abs(this.items[0].startAsNumber - this.items[1].startAsNumber) + 946677600000));
    }
  }

  remove() {
    this.dispatcher.dispatch("attacksRemove", this.items.map(p => p.id));
  }

  copy() {
    this.dispatcher.dispatch("attackCopy", this.items.map(t => t.id));
  }

  formatDate(date: Date): string {
    return Utils.formatTime(date);
  }

  getColor(ab: Index.BossAttackMap) {
    const it = ab.attack;
    return (it.type === 1 ? "red" : (it.type === 2 ? "blue" : ""));
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

}
