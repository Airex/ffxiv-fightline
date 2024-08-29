import { Injectable } from "@angular/core";
import {DataSetDataGroup, DataSetDataItem } from "vis-timeline";
import { Holders } from "../core/Holders";
import { ITimelineContainer } from "../core/Holders/BaseHolder";
import { PresenterManager } from "../core/PresentationManager";
import { LocalStorageService } from "./LocalStorageService";
import { DataGroup, DataItem } from "ngx-vis/ngx-vis";
import { DataSet } from "vis-data";

@Injectable()
export class VisStorageService {
  private items: DataSetDataItem;
  private groups: DataSetDataGroup;
  private itemsBoss: DataSetDataItem;
  private groupsBoss: DataSetDataGroup;

  public holders: Holders;
  public presenter: PresenterManager;

  constructor(
    private storage: LocalStorageService
  ) {
    this.items = new DataSet<DataItem>([], {});
    this.groups = new DataSet<DataGroup>([], {});
    this.itemsBoss = new DataSet<DataItem>([], {});
    this.groupsBoss = new DataSet<DataGroup>([], {});

    this.bossContainer.groups.add({ id: "boss", content: "BOSS", className: "boss" });
    this.playerContainer.groups.add({ id: 0, content: "", className: "" });

    this.presenter = new PresenterManager(this.storage);
    this.holders = new Holders(this.playerContainer, this.bossContainer);

  }

  get playerContainer(): ITimelineContainer {
    return {
      items: this.items,
      groups: this.groups
    };
  }

  get bossContainer(): ITimelineContainer {
    return {
      items: this.itemsBoss,
      groups: this.groupsBoss
    };
  }

  clear() {
    this.holders.clear();
  }
}
