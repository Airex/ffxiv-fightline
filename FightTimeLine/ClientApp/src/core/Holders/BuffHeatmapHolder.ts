import { DataItem, DataSetDataItem } from "vis-timeline"
import { BaseHolder } from "./BaseHolder";
import {HeatmapMap }from "../Maps/HeatmapMap";

export class BuffHeatmapHolder extends BaseHolder<string, DataItem, HeatmapMap> {

  constructor(private visItems: DataSetDataItem) {
    super();
  }

  add(i: HeatmapMap): void {
    super.add(i);
    this.visItems.add(this.itemOf(i));
  }

  addRange(i: HeatmapMap[]): void {
    super.addRange(i);
//    this.visItems.add(this.itemsOf(i));
  }

  clear(): void {
    this.visItems.remove(this.getIds());
    super.clear();
  }

  remove(ids: string[]): void {
    super.remove(ids);
    this.visItems.remove(ids);
  }

  update(items: HeatmapMap[]) {
    // console.log("update HeatmapMap")   
    this.visItems.update(this.itemsOf(items));
  }
}
