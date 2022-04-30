import { DataItem } from "vis-timeline";
import { IPresenterData } from "../Models";
import { BaseMap } from "./BaseMap";

export interface IBossTargetMapData {
  start?: Date;
  end?: Date;
}

export class BossTargetMap extends BaseMap<string, DataItem, IBossTargetMapData> {

  target: string;

  onDataUpdate(data: IBossTargetMapData): void {
    this.setItem(this.createBossTarget(this.id, data.start, data.end, this.target));
  }

  constructor(presenter: IPresenterData, id: string, target: string, data: IBossTargetMapData) {
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

  createBossTarget(id: string, start: Date, end: Date, target: string): DataItem {
    return {
      id,
      start,
      end,
      group: target,
      className: "targets",
      type: "background",
      content: "",
    };
  }
}
