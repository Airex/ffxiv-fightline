import { DataItem } from "vis-timeline"
import { IPresenterData } from "../Models";
import {BaseMap} from "./BaseMap";

export interface IHeatmapMapData {
  start?: Date;
  end?: Date;
}

export class HeatmapMap extends BaseMap<string, DataItem, IHeatmapMapData> {
  onDataUpdate(data: IHeatmapMapData): void {
    this.setItem(this.createHeatMap(data.start, data.end, this.id, this.target));
  }

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

  target: string;

  createHeatMap(start: Date, end: Date, id: string, group?: string) {
    const result = <DataItem>{
      start: start,
      end: end,
      id: id,
      content: "",
      type: "background",
      className: "buffMap",
    };
    if (group) {
      result.group = group;
    }
    return result;
  }
}
