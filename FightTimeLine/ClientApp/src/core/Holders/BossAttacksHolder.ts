import { DataItem, DataSetDataItem } from "vis-timeline";
import { BaseHolder } from "./BaseHolder";
import { BossAttackMap } from "../Maps/BossAttackMap";
import * as Models from "../Models";
import * as _ from "lodash";

export class BossAttacksHolder extends BaseHolder<
  string,
  DataItem,
  BossAttackMap
> {
  private prefix = "bossAttack_";
  // ReSharper disable once InconsistentNaming

  constructor(
    private visBossItems: DataSetDataItem,
    private visMainItems: DataSetDataItem
  ) {
    super();
  }

  add(i: BossAttackMap): void {
    super.add(i);
    this.addToBoard(i);
  }

  addRange(i: BossAttackMap[]): void {
    super.addRange(i);
    //    this.addRangeToBoard(i);
  }

  private addToBoard(i: BossAttackMap) {
    this.visBossItems.add(this.itemOf(i));
    this.visMainItems.add({
      id: this.prefix + i.id,
      start: i.start,
      end: new Date(i.startAsNumber + 10),
      type: "background",
      content: "",
      className: "bossAttack " + i.attack.color,
      title: i.attack.name,
    });
  }

  private addRangeToBoard(i: BossAttackMap[]) {
    this.visBossItems.add(this.itemsOf(i));
    this.visMainItems.add(
      i.map((it) => {
        return {
          id: this.prefix + it.id,
          start: it.start,
          end: new Date(it.startAsNumber + 10),
          type: "background",
          content: "",
          className: "bossAttack " + it.attack.color,
          title: it.attack.name,
        };
      })
    );
  }

  private removeFromBoard(i: BossAttackMap) {
    this.visBossItems.remove(i.id);
    this.visMainItems.remove(this.prefix + i.id);
  }

  private removeRangeFromBoard(i: BossAttackMap[]) {
    this.visBossItems.remove(i.map((p) => p.id));
    this.visMainItems.remove(i.map((p) => this.prefix + p.id));
  }

  remove(ids: string[]): void {
    super.remove(ids);
    this.visBossItems.remove(ids);
    this.visMainItems.remove(ids.map((it) => this.prefix + it));
  }

  clear(): void {
    const ids = this.getIds();
    this.visBossItems.remove(ids);
    this.visMainItems.remove(ids.map((it) => this.prefix + it));
    super.clear();
  }

  getByName(name: string): BossAttackMap[] {
    return this.filter((b: BossAttackMap) => b.attack.name === name);
  }

  update(itemsToUpdate: BossAttackMap[]): void {
    this.visBossItems.update(
      this.itemsOf(
        itemsToUpdate.filter((x) => x && !!this.visBossItems.get(x.id))
      )
    );
    this.visMainItems.update(
      itemsToUpdate
        .map((it) => {
          const item = it && this.visMainItems.get(this.prefix + it.id);
          if (!item) {
            return null;
          }
          item.start = it.start;
          item.className = "bossAttack " + it.attack.color;
          item.end = new Date(item.start.valueOf() + 10);
          return item;
        })
        .filter((x) => !!x)
    );
  }

  prevAttack(start: Date): BossAttackMap | undefined {
    return this.filter((x) => x.start < start).sort(
      (a, b) => b.startAsNumber - a.startAsNumber
    )[0];
  }

  applyFilter(filter: Models.IBossAttackFilter, attack?: BossAttackMap): void {
    if (!filter) {
      return;
    }
    const values = attack ? [attack] : this.values;
    values.forEach((it) => {
      let visible =
        !filter.tags ||
        filter.tags.some(
          (value) =>
            ((!it.attack.tags || it.attack.tags.length === 0) &&
              value === "Other") ||
            (it.attack.tags && it.attack.tags.includes(value))
        );
      if (visible) {
        visible =
          visible &&
          (!filter.sources ||
            filter.sources.some(
              (value) =>
                (!it.attack.source && value === "Other") ||
                (it.attack.source && it.attack.source === value)
            ));
      }
      if (visible) {
        visible =
          visible &&
          ((filter.isMagical && it.attack.type === Models.DamageType.Magical) ||
            (filter.isPhysical &&
              it.attack.type === Models.DamageType.Physical) ||
            (filter.isUnaspected && it.attack.type === Models.DamageType.None));
      }
      if (visible) {
        visible = visible && it.isForFfLogs(filter.fflogsSource);
      }

      const item = this.visBossItems.get(it.id);

      it.visible = visible;

      const toAdd: BossAttackMap[] = [];
      const toRemove: BossAttackMap[] = [];

      if (visible) {
        if (!item) {
          toAdd.push(it);
        }
      } else {
        if (item) {
          toRemove.push(it);
        }
      }

      this.addRangeToBoard(toAdd);
      this.removeRangeFromBoard(toRemove);
    });
  }

  setVertical(verticalBossAttacks: boolean): void {
    this.values.forEach((it) => {
      it.applyData({ vertical: verticalBossAttacks });
    });
    this.update(this.values);
  }

  getAffectedAttacks(start: Date, calculatedDuration: number): string[] {
    return this.filter(
      (it) =>
        it.start >= start &&
        new Date(start.valueOf() + calculatedDuration * 1000) >= it.start
    ).map((it) => it.id);
  }

  sync(id: string, date: Date) {
    const item = this.visMainItems.get(this.prefix + id);
    item.start = date;
    item.end = new Date(item.start.valueOf() + 10);
    this.visMainItems.update([item]);
  }
}
