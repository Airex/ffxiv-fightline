import { Injectable } from "@angular/core";
import { LocalStorageService } from "./LocalStorageService";

@Injectable()
export class RecentActivityService {
  private storageKey = "recentActivity";

  constructor(private storage: LocalStorageService) {

  }

  public load(): IRecentStorage {
    const result = this.storage.getObject<IRecentStorage>(this.storageKey);

    return result || {
      activities: []
    };
  }

  public save(storage: IRecentStorage) {
    this.storage.setObject(this.storageKey, storage);
  }


  public register(input: Partial<IRecentActivity>): void {
    const storage = this.load();

    input = { pinned: false, timestamp: new Date(), ...input };

    const found = storage.activities.find(t => t.id === input.id);
    if (found) {
      storage.activities.push({ ...found });
    }
    else {
      storage.activities.push(input);
    }

    let result = new Array<Partial<IRecentActivity>>();
    const map = {};
    for (const item of storage.activities.reverse()) {
      if (!map[item.id]) {
        map[item.id] = {}; // set any value to Map
        result.push(item);
      }
    }
    result = result.reverse();
    if (result.length > 20) {
      result.splice(0, result.length - 20);
    }

    storage.activities = result;

    this.save(storage);

  }
}

export enum ActivitySource {
  FFLogs,
  Table,
  Timeline
}

export interface IRecentStorage {
  activities: Partial<IRecentActivity>[];

}

export interface IRecentActivity {
  id: string;
  source: ActivitySource;
  name: string;
  url: string;
  timestamp: Date;
  pinned: boolean;
}

export interface IFFLogsActivity extends  IRecentActivity {
  source: ActivitySource.FFLogs;
  url: string;
}
