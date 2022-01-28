import { DataItem, DataSetDataItem } from "vis-timeline";
import { BaseHolder } from "./BaseHolder";
import { BossTargetMap } from "../Maps/BossTargetMap";

export class BossTargetHolder extends BaseHolder<string, DataItem, BossTargetMap> {

  constructor(private visItems: DataSetDataItem, private initial: string) {
    super();
  }

  add(i: BossTargetMap): void {
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

  update(items: BossTargetMap[]) {
    // console.log("update BossTargetMap")   
    this.visItems.update(this.itemsOf(items));
  }

  get initialBossTarget(): string { return this.initial; }

  set initialBossTarget(v: string) { this.initial = v; }
}
