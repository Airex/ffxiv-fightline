import { DataItem, DataSetDataItem } from "vis-timeline"
import { BaseHolder } from "./BaseHolder";
import { BossAttackMap } from "../Maps/BossAttackMap";
import * as Models from "../Models";
import * as _ from "lodash";

export class BossAttacksHolder extends BaseHolder<string, DataItem, BossAttackMap> {
  private prefix = "bossAttack_";
// ReSharper disable once InconsistentNaming
  private _uniqueTags = Models.DefaultTags.reduce((acc, v) => {
    acc[v] = "";
    return acc;

  }, {});

  constructor(private visBossItems: DataSetDataItem, private visMainItems: DataSetDataItem) {
    super();
  }


  public get uniqueTags() : string[] {
    return Object.keys(this._uniqueTags);
  }

  private tryAddToTags(tags: string[]) {
    if (tags) {
      tags.forEach(t => {
        this._uniqueTags[t] = null;
      });
    }
  }

  add(i: BossAttackMap): void {
    super.add(i);
    this.addToBoard(i);
    this.tryAddToTags(i.attack.tags);
  }

  addRange(i: BossAttackMap[]): void {
    super.addRange(i);
    i.forEach(t => {
      this.tryAddToTags(t.attack.tags);
    });
    //    this.addRangeToBoard(i);
  }

  private addToBoard(i: BossAttackMap) {
    this.visBossItems.add(this.itemOf(i));
    this.visMainItems.add({
      id: this.prefix + i.id,
      start: i.start,
      end: new Date(i.startAsNumber + 10),
      type: 'background',
      content: "",
      className: "bossAttack",
      title: i.attack.name
    });
  }

  private addRangeToBoard(i: BossAttackMap[]) {
    this.visBossItems.add(this.itemsOf(i));
    this.visMainItems.add(i.map(it => {
      return {
        id: this.prefix + it.id,
        start: it.start,
        end: new Date(it.startAsNumber + 10),
        type: 'background',
        content: "",
        className: "bossAttack",
        title: it.attack.name
      }
    }));
  }

  private removeFromBoard(i: BossAttackMap) {
    this.visBossItems.remove(i.id);
    this.visMainItems.remove(this.prefix + i.id);
  }

  remove(ids: string[]): void {
    super.remove(ids);
    this.visBossItems.remove(ids);
    this.visMainItems.remove(ids.map(it => this.prefix + it));
  }

  clear(): void {
    const ids = this.getIds();
    this.visBossItems.remove(ids);
    this.visMainItems.remove(ids.map(it => this.prefix + it));
    super.clear();

  }

  getByName(name: string): BossAttackMap[] {
    return this.filter((b: BossAttackMap) => b.attack.name === name);
  }

  update(itemsToUpdate: BossAttackMap[]): void {

    itemsToUpdate.forEach(t => {
      this.tryAddToTags(t.attack.tags);
    });

    this.visBossItems.update(this.itemsOf(itemsToUpdate.filter(x => !!this.visBossItems.get(x.id))));
    this.visMainItems.update(itemsToUpdate.map(it => {
      const item = this.visMainItems.get(this.prefix + it.id);
      if (!item) return null;
      item.start = it.start;
      item.end = new Date(item.start.valueOf() + 10);
      return item;
    }).filter(x => !!x));
  }

  applyFilter(filter: Models.IBossAttackFilter): void {
    if (!filter) return;
    this.values.forEach(it => {
      let visible = !filter.tags || filter.tags.some(value => (!it.attack.tags && value === "Other") || it.attack.tags && it.attack.tags.includes(value));
      visible = visible && !filter.sources || filter.sources.some(value => (!it.attack.source && value === "Other") || it.attack.source && it.attack.source === value);
      visible = visible && (filter.isMagical && it.attack.type === Models.DamageType.Magical || filter.isPhysical && it.attack.type === Models.DamageType.Physical || filter.isUnaspected && it.attack.type === Models.DamageType.None);

      const item = this.visBossItems.get(it.id);

      if (visible) {
        if (!item) {
          this.addToBoard(it);
        }
      } else {
        if (!!item) {
          this.removeFromBoard(it);
        }
      }

    });
  }

  setVertical(verticalBossAttacks: boolean): void {
    this.values.forEach(it => {
      it.applyData({ vertical: verticalBossAttacks });
    });
    this.update(this.values);
  }

  getAffectedAttacks(start: Date, calculatedDuration: number): string[] {
    return this.filter(it => it.start >= start &&
      new Date(start.valueOf() + calculatedDuration * 1000) >= it.start).map(it => it.id);
  }

  sync(id: string, date: Date) {
    const item = this.visMainItems.get(this.prefix + id);
    item.start = date;
    item.end = new Date(item.start.valueOf() + 10);
    this.visMainItems.update([item]);
  }
}
