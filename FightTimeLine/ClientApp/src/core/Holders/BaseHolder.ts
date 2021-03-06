import { DataItem, DataGroup, DataSet } from "ngx-vis";
import { IPresenterData } from "../Models";

export interface IBaseHolderItem<TKey> {
  id: TKey;
  presenter: IPresenterData;
}

export interface IItemHolder<TI> {
  item: TI;
}

export interface IForSidePanel {
  sidePanelComponentName: string;
  id: string;
}

export interface IMoveable {
  move(delta):boolean;
}

export interface ITimelineContainer {
  items: DataSet<DataItem>;
  groups: DataSet<DataGroup>;
}


export class BaseHolder<TK, TI, T extends IBaseHolderItem<TK>> {  
  protected items: { [id: string]: T } = {};
  add(i: T): void {     
    this.items[i.id as any] = i;
  }

  addRange(i: T[]): void {
    i.forEach(it => this.add(it));
  }

  get(id: TK): T {
    return this.items[id as any];
  }

  protected get values(): T[] {
    return Object.values(this.items) as T[];
  }

  protected itemsOf(items: T[]): TI[] {
    return items.map((it) => (<IItemHolder<TI>><any>it).item);
  }

  protected itemOf(item: T): TI {
    return (<IItemHolder<TI>><any>item).item;
  }

  filter(predicate: (it: T) => boolean): T[] {
    return this.values.filter(predicate);
  }
  remove(ids: TK[]): void {
    ids.forEach(x => {
      const index = this.items[x as any];
      if (index) {
        delete this.items[x as any];
      }
    });

  }

  getAll(): T[] {
    return this.values;
  }

  getIds(): TK[] {
    return Object.keys(this.items) as any[];
  }

  getByIds(ids: (string | number)[]): T[] {
    if (!ids) return [];
    return ids.map(it => this.items[it]).filter(it => !!it);
  }

  clear(): void {
    delete this.items;
    this.items = {};
  }

  update(items: T[]) {

  }
}
