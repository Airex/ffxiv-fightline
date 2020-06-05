import { DataItem, DataSetDataItem } from "vis-timeline"
import { BaseHolder } from "./BaseHolder";
import { BossAttackMap }from "../Maps/BossAttackMap";
import * as Models from "../Models";

export class BossAttacksHolder extends BaseHolder<string, DataItem, BossAttackMap> {
  private prefix = "bossAttack_";

  constructor(private visBossItems: DataSetDataItem, private visMainItems: DataSetDataItem) {
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
      let visible = (filter.isTankBuster && it.attack.isTankBuster);
      visible = visible || (filter.isAoe && it.attack.isAoe);
      visible = visible || (filter.isShareDamage && it.attack.isShareDamage);

      if (!visible) {
        visible = filter.isOther && !(it.attack.isTankBuster || it.attack.isAoe || it.attack.isShareDamage);
      }

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
