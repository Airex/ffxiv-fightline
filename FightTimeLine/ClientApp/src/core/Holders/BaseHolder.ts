import {DataSetDataGroup, DataSetDataItem } from "vis-timeline";
import { IPresenterData } from "../Models";

export interface IBaseHolderItem<TKey> {
  id: TKey;
  presenter: IPresenterData;
  refresh(): void;
}

export interface IItemHolder<TI> {
  item: TI;
}

export interface IForSidePanel {
  sidePanelComponentName: string;
  id: string;
}

export interface IMoveable {
  move(delta: number): boolean;
}

export interface ITimelineContainer {
  items: DataSetDataItem;
  groups: DataSetDataGroup;
}


export class BaseHolder<TK, TI, T extends IBaseHolderItem<TK>> {
  protected items: { [id: string]: T } = {};
  add(i: T): void {
    this.items[i.id as any] = i;
  }

  addRange(i: T[]): void {
    i.forEach(it => it && this.add(it));
  }

  get(id: TK): T {
    return this.items[id as any];
  }

  protected get values(): T[] {
    return Object.values(this.items) as T[];
  }

  protected itemsOf(items: T[]): TI[] {
    return items.map((it) => (it as any as IItemHolder<TI>).item);
  }

  protected itemOf(item: T): TI {
    return (item as any as IItemHolder<TI>).item;
  }

  filter(predicate: (it: T) => boolean): T[] {
    return this.values.filter(predicate);
  }

  first(predicate: (it: T) => boolean): T | undefined {
    return this.filter(predicate)[0];
  }

  remove(ids: TK[]): void {
    ids.forEach(x => {
      const index = this.items[x as any];
      if (index) {
        delete this.items[x as any];
      }
    });

  }

  refresh() {
    const all = this.getAll();
    all.forEach(a => a.refresh());
    this.update(all);
  }

  getAll(): T[] {
    return this.values;
  }

  getIds(): TK[] {
    return Object.keys(this.items) as any[];
  }

  getByIds(ids: (string | number)[]): T[] {
    if (!ids || ids.length === 0) { return []; }
    return ids.map(it => this.items[it]).filter(it => !!it);
  }

  clear(): void {
    delete this.items;
    this.items = {};
  }

  update(items: T[]) {

  }
}
