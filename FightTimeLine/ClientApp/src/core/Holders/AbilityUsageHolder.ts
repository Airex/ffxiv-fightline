import {DataItem,DataSetDataItem} from "vis-timeline"
import * as BaseHolder from "./BaseHolder";
import { AbilityUsageMap } from "../Maps/AbilityUsageMap";

export class AbilityUsageHolder extends BaseHolder.BaseHolder<string, DataItem, AbilityUsageMap> {

  setHighlightLoaded(highlightLoaded: boolean) {
    const toUpdate: AbilityUsageMap[] = [];
    this.values.forEach(it => {
      if (it.loaded) {
        it.applyData({ showLoaded: highlightLoaded });
        toUpdate.push(it);
      }
    });
    this.update(toUpdate);
  }

  constructor(private visItems: DataSetDataItem) {
    super();
  }

  add(i: AbilityUsageMap): void {    
    super.add(i);
    this.visItems.add(this.itemOf(i));
  }

  addRange(i: AbilityUsageMap[]): void {
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

  update(items: AbilityUsageMap[]) {
    // console.log("update AbilityUsageMap")   
    this.visItems.update(this.itemsOf(items));
  }

  getByAbility(id: string): AbilityUsageMap[] {
    return this.filter(it => it.ability.id === id);
  }

  getSetting(id: string, name: string): any {
    const settings = this.get(id).settings;
    if (settings) {
      const v = settings.find((it) => it.name === name);
      return v;

    }
    return null;
  }


}
