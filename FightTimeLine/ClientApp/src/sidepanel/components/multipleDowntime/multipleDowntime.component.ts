import { Component, OnInit, OnDestroy, Inject } from "@angular/core";
import { ISidePanelComponent, SIDEPANEL_DATA, SidepanelParams } from "../ISidePanelComponent"
import * as M from "../../../core/Models"
import * as S from "../../../services"
import { Holders } from "../../../core/Holders";
import { Utils } from "../../../core/Utils";
import { BossDownTimeMap } from "../../../core/Maps";
import { VisStorageService } from "src/services/VisStorageService";



@Component({
  selector: "multipleDowntime-area",
  templateUrl: "./multipleDowntime.component.html",
  styleUrls: ["./multipleDowntime.component.css"],
})
export class MultipleDownTimeComponent implements OnInit, OnDestroy, ISidePanelComponent {

  items: any[];
  holders: Holders;

  constructor(
    private visStorage: VisStorageService,    
    private dispatcher: S.DispatcherService, 
    @Inject(SIDEPANEL_DATA) 
    public data: SidepanelParams) {
    this.items = this.data.items;
    this.holders = this.visStorage.holders;
    this.refresh();

  }

  get its(): BossDownTimeMap[] {
    return this.items;
  }

  getType(id: number): string {
    return M.DamageType[id];
  }

  formatDate(date: Date) {
    return Utils.formatTime(date);
  }


  refresh() {
    //this.color = this.it.color;
    //this.from = Utils.formatTime(this.it.start);
    //this.to = Utils.formatTime(this.it.end);
    //this.initialComment = this.comment = this.it.comment;
  }

  onSelectClick(item: BossDownTimeMap) {
    this.dispatcher.dispatch({
      name: "Multiple Downtimes Select",
      payload: item.id
    })
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
  }

}
