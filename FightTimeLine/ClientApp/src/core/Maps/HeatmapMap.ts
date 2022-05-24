import { DataItem } from "vis-timeline";
import { IPresenterData } from "../Models";
import { BaseMap } from "./BaseMap";

export interface IHeatmapMapData {
  start?: Date;
  end?: Date;
}

export class HeatmapMap extends BaseMap<string, DataItem, IHeatmapMapData> {

  target: string;

  constructor(presenter: IPresenterData, id: string, target: string, data: IHeatmapMapData) {
    super(presenter, id);
    this.target = target;
    this.applyData(data);
  }

  get start(): Date {
    return this.item.start as Date;
  }

  get end(): Date {
    return this.item.end as Date;
  }

  set start(v: Date) {
    this.item.start = v;
  }

  set end(v: Date) {
    this.item.end = v;
  }


  onDataUpdate(data: IHeatmapMapData): void {
    this.setItem(this.createHeatMap(data.start, data.end, this.id, this.target));
  }

  createHeatMap(start: Date, end: Date, id: string, group?: string) {
    const result = {
      start,
      end,
      id,
      content: "",
      type: "background",
      className: "buffMap",
    } as DataItem;

    if (group) {
      result.group = group;
    }
    return result;
  }
}
