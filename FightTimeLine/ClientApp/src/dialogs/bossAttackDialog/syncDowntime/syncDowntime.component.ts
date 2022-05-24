import { Component, Input, OnInit } from "@angular/core";
import { VisStorageService } from "src/services/VisStorageService";
import * as M from "../../../core/Models";

@Component({
  selector: "syncDowntime",
  templateUrl: "./syncDowntime.component.html",
  styleUrls: ["./syncDowntime.component.css"]
})
export class SyncDowntimeComponent implements OnInit {

  @Input() data: M.IBossAbility;
  downtimes: any[];
  selected: any;
  selectedPre: any;

  constructor(
    private visStorage: VisStorageService
  ) {

  }

  ngOnInit() {
    this.downtimes = this.visStorage.holders.bossDownTime.getAll();
    this.selected = this.data.syncDowntime;
    this.selectedPre = this.data.syncPreDowntime;
  }
}

