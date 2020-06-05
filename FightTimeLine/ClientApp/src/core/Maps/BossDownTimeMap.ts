import { DataItem } from "vis-timeline"
import { BaseMap } from "./BaseMap";
import * as BaseHolder from "../Holders/BaseHolder";

export interface IBossDownTimeMapData {
  start?: Date;
  end?: Date;
  color?: string;
  comment?: string;
}

export class BossDownTimeMap extends BaseMap<string, DataItem, IBossDownTimeMapData> implements BaseHolder.IForSidePanel {
  sidePanelComponentName: string = "downtime";

  onDataUpdate(data: IBossDownTimeMapData): void {
    this.setItem(this.createDownTime(this.id, data.start, data.end, data.color));
  }

  startId: string;
  endId: string;

  get start(): Date {
    return this.data.start as Date;
  }

  get end(): Date {
    return this.data.end as Date;
  }

  set start(v: Date) {
    this.data.start = v;
  }

  set end(v: Date) {
    this.data.end = v;
  }

  constructor(id: string, startId: string, endId: string, data: IBossDownTimeMapData) {
    super(id);
    this.startId = startId;
    this.endId = endId;
    this.applyData(data);
  }

  createDownTime(id: string, start: Date, end: Date, color: string): DataItem {
    return {
      start: start,
      end: end,
      id: id,
      content: "",
      type: "background",
      style: "background-color:" + color,
      className: "downtime"
    }
  }

  get color(): string {
    return this.data.color;
  }

  get comment() {
    return this.data.comment;
  }
}
