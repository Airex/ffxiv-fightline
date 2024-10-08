import { Component, OnDestroy, Inject } from "@angular/core";
import * as M from "../../core/Models";
import * as S from "../../services";
import { Holders } from "../../core/Holders";
import { Utils } from "../../core/Utils";
import { BossDownTimeMap } from "../../core/Maps";
import { VisStorageService } from "../../services/VisStorageService";
import { DispatcherPayloads } from "../../services/dispatcher.service";
import { Subscription } from "rxjs";
import { ISidePanelComponent, SIDEPANEL_DATA, SidepanelParams } from "../sidepanel/ISidePanelComponent";



@Component({
  selector: "downtime-area",
  templateUrl: "./downtime.component.html",
  styleUrls: ["./downtime.component.css"],
})
export class DownTimeComponent implements OnDestroy, ISidePanelComponent {

  items: any[];
  holders: Holders;
  color: string;
  comment: string;
  initialComment: string;
  from: string;
  to: string;
  showCommentButton = false;
  sub: Subscription;

  constructor(
    @Inject("DispatcherPayloads") private dispatcher: S.DispatcherService<DispatcherPayloads>,
    visStorage: VisStorageService,
    @Inject(SIDEPANEL_DATA)
    public data: SidepanelParams) {
    this.items = this.data.items;
    this.holders = visStorage.holders;
    this.sub = this.data.refresh.subscribe(() => {
      this.refresh();
    });
    this.refresh();

  }

  get it(): BossDownTimeMap {
    return this.items[0];
  }

  getType(id: number): string {
    return M.DamageType[id];
  }



  setColor(color) {
    this.dispatcher.dispatch("downTimeColor", {
      id: this.it.id,
      color
    });
  }


  remove(job: BossDownTimeMap) {
    this.dispatcher.dispatch("downtimeRemove", job.id);
  }

  setComment() {
    this.dispatcher.dispatch("downtimeComment", {
      id: this.it.id,
      comment: this.comment
    });
  }

  refresh() {
    this.color = this.it.color;
    this.from = Utils.formatTime(this.it.start);
    this.to = Utils.formatTime(this.it.end);
    this.initialComment = this.comment = this.it.comment;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

}
