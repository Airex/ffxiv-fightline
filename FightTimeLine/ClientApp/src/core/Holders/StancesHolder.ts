import { DataItem, DataSetDataItem } from "vis-timeline";
import { BaseHolder } from "./BaseHolder";
import { JobStanceMap } from "../Maps/index";


export class StancesHolder extends BaseHolder<string, DataItem, JobStanceMap> {
  constructor(private visItems: DataSetDataItem) {
    super();
  }
  add(i: JobStanceMap): void {
    super.add(i);
    this.visItems.add(this.itemOf(i));
  }

  clear(): void {
    this.visItems.remove(this.getIds());
    super.clear();
  }

  remove(ids: string[]): void {
    super.remove(ids);
    this.visItems.remove(ids);
  }

  update(items: JobStanceMap[]) {
    // console.log("update JobStanceMap")
    this.visItems.update(this.itemsOf(items));
  }

  setHighlightLoaded(highlightLoaded: boolean) {
    const toUpdate: JobStanceMap[] = [];
    this.values.forEach(it => {
      if (it.loaded) {
        it.applyData({ showLoaded: highlightLoaded });
        toUpdate.push(it);
      }
    });
    this.update(toUpdate);
  }

  getNext(time: Date): Date {
    let minV: JobStanceMap = null;
    this.values.forEach(v => {
      if (v.start > time) {
        if (minV) {
          if (minV.start > v.start) {
            minV = v;
          }
        }
        else {
          minV = v;
        }
      }
    });
    if (minV) {
      return new Date((minV.start.valueOf() as number) - 1000);
    }
    return new Date(Date.UTC(2000,1,1,0,0,0) + 30 * 60 * 1000);

  }

  getPrev(time: Date): Date {
    let maxV: JobStanceMap = null;
    this.values.forEach(v => {
      if (v.end < time) {
        if (maxV) {
          if (maxV.end < v.end) {
            maxV = v;
          }
        }
        else {
          maxV = v;
        }
      }
    });
    if (maxV) {
      return new Date((maxV.end.valueOf() as number) + 1000);
    }
    return new Date(Date.UTC(2000,1,1,0,0,0));
  }
}
