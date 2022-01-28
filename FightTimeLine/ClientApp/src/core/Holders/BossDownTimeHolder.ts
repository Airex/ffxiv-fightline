import { DataItem, DataSetDataItem } from "vis-timeline"
import { BaseHolder } from "./BaseHolder";
import {BossDownTimeMap} from "../Maps/BossDownTimeMap";

export class BossDownTimeHolder extends BaseHolder<string, DataItem, BossDownTimeMap> {
  showInPartyArea = false;

  setShowInPartyArea(showDowntimesInPartyArea: boolean): void {
    this.showInPartyArea = showDowntimesInPartyArea;
    if (this.showInPartyArea) {
      this.values.forEach(it => this.visPartyItems.add(this.itemOf(it)));
    } else {
      this.values.forEach(it => this.visPartyItems.remove(it.id));
    }
  }

  constructor(private visBossItems: DataSetDataItem, private visPartyItems: DataSetDataItem) {
    super();
  }

  add(i: BossDownTimeMap): void {
    super.add(i);
    const item = this.itemOf(i);
    this.visBossItems.add(item);
    if (this.showInPartyArea)
      this.visPartyItems.add(item);
  }

  remove(ids: string[]): void {
    super.remove(ids);
    this.visBossItems.remove(ids);
    if (this.showInPartyArea)
      this.visPartyItems.remove(ids);
  }

  clear(): void {
    this.visBossItems.remove(this.getIds());
    if (this.showInPartyArea)
      this.visPartyItems.remove(this.getIds());
    super.clear();
  }

  update(items: BossDownTimeMap[]): void {
    // console.log("update BossDownTimeMap")   
    const tu = this.itemsOf(items);
    this.visBossItems.update(tu);
    if (this.showInPartyArea)
      this.visPartyItems.update(tu);
  }

  getById(id: string): BossDownTimeMap {
    return this.values.find((it) => it.endId === id || it.startId === id);
  }
}
