import { DataItem, DataSetDataItem } from "vis-timeline";
import { BaseHolder } from "./BaseHolder";
import { AbilityAvailabilityMap } from "../Maps/index";

export class AbilityAvailablityHolder extends BaseHolder<
  string,
  DataItem,
  AbilityAvailabilityMap
> {
  constructor(private visItems: DataSetDataItem) {
    super();
  }

  add(i: AbilityAvailabilityMap): void {
    super.add(i);
    this.visItems.add(this.itemOf(i));
  }

  addRange(i: AbilityAvailabilityMap[]): void {
    super.addRange(i);
  }

  clear(): void {
    this.visItems.remove(this.getIds());
    super.clear();
  }

  remove(ids: string[]): void {
    super.remove(ids);
    this.visItems.remove(ids);
  }

  update(items: AbilityAvailabilityMap[]) {
    this.visItems.update(this.itemsOf(items));
  }

  removeForAbility(id: string): void {
    const ids = this.filter((it) => it.ability.id === id).map((it) => it.id);
    this.remove(ids);
  }
}
