import _ from "lodash";
import * as BaseHolder from "../Holders/BaseHolder";
import { ClassNameBuilder } from "../ClassNameBuilder";
import { IPresenterData } from "../Models";
import { Holders } from "../Holders";

export interface IOverlapCheckData {
  holders: Holders;
  id: string;
  group: string;
  start: Date;
  end: Date;
  globalStart?: Date;
  selectionRegistry?: string[];
}

export abstract class BaseMap<TKey, TItem extends { className?: string }, TData> implements BaseHolder.IBaseHolderItem<TKey> {
  id: TKey;
  protected item: TItem;
  protected data =  ({}) as TData;

  protected constructor(public presenter: IPresenterData, id: TKey, item?: TItem) {
    this.id = id;
    this.item = item;
  }

  protected buildClass(cls: { [value: string]: boolean }): string {
    // console.log(this.item && this.item.className);
    const b = new ClassNameBuilder(this.item && this.item.className || "");
    b.set(cls);
    return b.build() || "dummy";
  }

  applyData(data?: TData): void {
    if (data) {
      this.data = _.merge(this.data, data);
    }
    this.onDataUpdate(this.data, data);
  }

  abstract onDataUpdate(data: TData, originalData?: TData): void;

  canMove(overlapData: IOverlapCheckData): boolean {
    return false;
  }

  setItem(item: TItem): void {
    if (!this.item) {
      this.item = item;
    }
    else {
      Object.assign(this.item, item);
    }
  }
}
