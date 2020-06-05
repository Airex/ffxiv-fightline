import { Component, OnInit, OnDestroy } from "@angular/core";
import { ISidePanelComponent } from "../ISidePanelComponent"
import * as M from "../../../core/Models"
import * as S from "../../../services"
import { Holders } from "../../../core/Holders";
import { Utils } from "../../../core/Utils";
import { BossDownTimeMap } from "../../../core/Maps";



@Component({
  selector: "downtime-area",
  templateUrl: "./downtime.component.html",
  styleUrls: ["./downtime.component.css"],
})
export class DownTimeComponent implements OnInit, OnDestroy, ISidePanelComponent {

  items: any[];
  holders: Holders;
  color: string;
  comment: string;
  initialComment: string;
  from: string;
  to:string;

  constructor(private dispatcher: S.DispatcherService) {

  }

  get it(): BossDownTimeMap {
    return this.items[0];
  }

  getType(id: number): string {
    return M.DamageType[id];
  }

  setItems(items: any[], holders: Holders): void {
    this.items = items;
    this.holders = holders;
    this.color = this.it.color;
    this.from = Utils.formatTime(this.it.start);
    this.to = Utils.formatTime(this.it.end);
    this.initialComment = this.comment = this.it.comment;
  }



  setColor(color) {
    this.dispatcher.dispatch({
      name: "SidePanel Color Downtime",
      payload: {
        id: this.it.id,
        color: color
      }
    });
  }


  remove(job: BossDownTimeMap) {
    this.dispatcher.dispatch({
      name: "SidePanel Remove Downtime",
      payload: job.id
    });
  }

  setComment() {
    this.dispatcher.dispatch({
      name: "SidePanel Comment Downtime",
      payload: {
        id: this.it.id,
        comment: this.comment
      }
    });
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    if (this.initialComment !== this.comment) {
//      this.setComment();
    }
  }

}
