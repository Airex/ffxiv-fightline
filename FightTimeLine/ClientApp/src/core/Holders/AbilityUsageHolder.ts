import { DataItem, DataSetDataItem } from "vis-timeline";
import * as BaseHolder from "./BaseHolder";
import { AbilityUsageMap } from "../Maps/AbilityUsageMap";
import { IAbilityStatus, IStatusSnapshot } from "../Models";
import { AbilityMap } from "../Maps";

export class AbilityUsageHolder extends BaseHolder.BaseHolder<
  string,
  DataItem,
  AbilityUsageMap
> {
  setHighlightLoaded(highlightLoaded: boolean) {
    const toUpdate: AbilityUsageMap[] = [];
    this.values.forEach((it) => {
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
    // console.log("update AbilityUsageMap");
    this.visItems.update(this.itemsOf(items));
  }

  getByAbility(id: string): AbilityUsageMap[] {
    return this.filter((it) => it.ability.id === id);
  }

  getSetting(id: string, name: string): any {
    return this.get(id).getSettingData(name)?.value;
  }

  getActiveStatusesAt(
    start: Date,
    predicate?: (ab: AbilityMap, st: IAbilityStatus) => boolean
  ): IStatusSnapshot[] {
    return this.values.reduce((acc, it) => {
      const statuses = it.getActiveStatusesAtTime(start, predicate);
      if (statuses) {
        acc.push(...statuses);
      }
      return acc;
    }, [] as IStatusSnapshot[]);
  }

  getUsageThatCoversAttack(date: Date, abilityId: string): AbilityUsageMap {
    return this.getByAbility(abilityId).find((usage) => {
      return usage.checkCoversDate(date);
    });
  }
}
