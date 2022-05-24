import {DataGroup, DataSetDataGroup} from "vis-timeline";
import * as BaseHolder from "./BaseHolder";
import {JobMap} from "../Maps/JobMap";

export class JobsMapHolder extends BaseHolder.BaseHolder<string, DataGroup, JobMap> {

  constructor(private visItems: DataSetDataGroup) {
    super();
  }

  add(i: JobMap): void {
    super.add(i);
    this.visItems.add(this.itemOf(i));
    this.removeEmpty();
  }

  addRange(i: JobMap[]): void {
    super.addRange(i);
//    this.visItems.add(this.itemsOf(i));
    this.removeEmpty();
  }

  remove(ids: string[]): void {
    super.remove(ids);
    this.visItems.remove(ids);
    this.addEmpty();
  }

  clear(): void {
    this.visItems.remove(this.getIds());
    super.clear();
    this.addEmpty();
  }

  update(items: JobMap[]): void {
    // console.log("update JobMap")
    this.visItems.update(this.itemsOf(items));
  }

  getOrder(initialBossTarget: string): number {
    return this.values.findIndex(((value: JobMap) => value.id === initialBossTarget) as any);
  }

  getByName(name: string, actorName?: string): JobMap {
    return this.values.find((b: JobMap) => b.job.name === name && (!actorName || actorName === b.actorName));
  }

  getByActor(actorName: string): JobMap {
    return this.values.find((b: JobMap) => actorName === b.actorName);
  }

  private addEmpty(): void {
    if (this.values.length === 0 && !this.visItems.get(0)) {
      this.visItems.add({ id: 0, content: "" });
    }
  }

  private removeEmpty(): void {
    if (this.values.length > 0) {
      this.visItems.remove(0);
    }
  }
}
