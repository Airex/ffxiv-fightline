import { Injectable } from "@angular/core"
import { DataItem, DataGroup, DataSet } from "ngx-vis";



export interface ITimelineContainer {
  items: DataSet<DataItem>;
  groups: DataSet<DataGroup>;
}

@Injectable()
export class VisStorageService {
  items: DataSet<DataItem>;
  groups: DataSet<DataGroup>;
  itemsBoss: DataSet<DataItem>;
  groupsBoss: DataSet<DataGroup>;

  constructor() {
    this.items = new DataSet<DataItem>([], {});
    this.groups = new DataSet<DataGroup>([], {});
    this.itemsBoss = new DataSet<DataItem>([], {});
    this.groupsBoss = new DataSet<DataGroup>([], {});
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
    this.items.clear();
    this.itemsBoss.clear();
    this.groups.clear();
    this.groupsBoss.clear();
  }
}
