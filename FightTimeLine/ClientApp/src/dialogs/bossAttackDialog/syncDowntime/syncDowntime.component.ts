import { Component, Input, OnInit, ViewChild } from "@angular/core";

import * as M from "../../../core/Models";
import * as H from "../../../core/Holders";


@Component({
  selector: "syncDowntime",
  templateUrl: "./syncDowntime.component.html",
  styleUrls: ["./syncDowntime.component.css"]
})



export class SyncDowntimeComponent implements OnInit {

  @Input("data") data: M.IBossAbility;
  @Input("holders") holders: H.Holders;
  downtimes: any[];
  selected: any;
  selectedPre: any;

  ngOnInit() {
    this.downtimes = this.holders.bossDownTime.getAll();
    this.selected = this.data.syncDowntime;
    this.selectedPre = this.data.syncPreDowntime;
  }
}

