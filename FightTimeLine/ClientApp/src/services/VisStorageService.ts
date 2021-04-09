import { Injectable } from "@angular/core"
import { DataItem, DataGroup, DataSet } from "ngx-vis";
import { Holders } from "src/core/Holders";
import { ITimelineContainer } from "src/core/Holders/BaseHolder";

@Injectable()
export class VisStorageService {
  private items: DataSet<DataItem>;
  private groups: DataSet<DataGroup>;
  private itemsBoss: DataSet<DataItem>;
  private groupsBoss: DataSet<DataGroup>;

  public holders: Holders;

  constructor() {
    this.items = new DataSet<DataItem>([], {});
    this.groups = new DataSet<DataGroup>([], {});
    this.itemsBoss = new DataSet<DataItem>([], {});
    this.groupsBoss = new DataSet<DataGroup>([], {});

    this.bossContainer.groups.add({ id: "boss", content: "BOSS", className: "boss" });
    this.playerContainer.groups.add({ id: 0, content: "", className: "" });

    this.holders = new Holders(this.playerContainer, this.bossContainer);
  }

  get playerContainer(): ITimelineContainer {
    return {
      items: this.items,
      groups: this.groups
    }
  }

  get bossContainer(): ITimelineContainer {
    return {
      items: this.itemsBoss,
      groups: this.groupsBoss
    }
  }

  clear() {
    this.holders.clear();    
  }
}
