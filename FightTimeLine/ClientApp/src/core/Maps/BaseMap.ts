import * as lod from "lodash";
import * as BaseHolder from "../Holders/BaseHolder";
import * as ClassNameBuilder from "../ClassNameBuilder";

export abstract class BaseMap<TKey, TItem extends { className?: string }, TData> implements BaseHolder.IBaseHolderItem<TKey> {
  id: TKey;
  protected item: TItem;
  protected data = <TData>({});
//  private holder: BaseHolder.BaseHolder<string, TItem, any>;

  constructor(id: TKey, item?: TItem) {
    this.id = id;
    this.item = item;
  }

  protected buildClass(cls: { [value: string]: boolean }): string {
    const b = new ClassNameBuilder.ClassNameBuilder("");
    b.set(cls);
    return b.build() || "dummy";
  }

  applyData(data?: TData): void {
    if (data)
      this.data = lod.merge(this.data, data);
    this.onDataUpdate(this.data);
  }

  abstract onDataUpdate(data: TData): void;

  setItem(item: TItem): void {
    if (!this.item)
      this.item = item;
    else {
      Object.assign(this.item, item);
    }
  }

//  update() {
//    this.holder.update([this]);
//  }
}
