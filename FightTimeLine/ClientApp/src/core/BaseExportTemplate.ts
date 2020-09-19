import { Utils } from "./Utils"
import * as Models from "./Models";
import * as PresentationManager from "./PresentationManager";

export abstract class ExportTemplate {
  public startDate = new Date(946677600000);
  name: string;
  abstract build(data: Models.ExportData, presenter: PresentationManager.PresenterManager): IExportResultSet;

  offsetCompareFn(a: string, b: string): number {
    const d = new Date();
    return Utils.getDateFromOffset(a, d).valueOf() - Utils.getDateFromOffset(b, d).valueOf();
  }



  offsetFromDuration(start: string, duration: number): string {
    return Utils.formatTime(new Date(Utils.getDateFromOffset(start, this.startDate).valueOf() + duration * 1000));
  }

  isOffsetInRange(offset: string, start: string, end: string) {
    const point = Utils.getDateFromOffset(offset, this.startDate);
    return Utils.getDateFromOffset(start, this.startDate) <= point &&
      Utils.getDateFromOffset(end, this.startDate) >= point;
  }

  protected text(input: Partial<ITextCell>): ITextCell {
    return <ITextCell>{...input, type: "text"};
  }

  protected items(input: Partial<IItemsCell>): IItemsCell {
    return <IItemsCell>{ ...input, type: "items" };
  }
}

export interface IExportResultSet {
  columns: IExportColumn[];
  rows: IExportRow[];
  title: string;
}

export interface IExportColumn {
  type?: string;
  text: string;
  icon: string;
  align?: string;
  refId?: string;
  cursor?: string;
  listOfFilter?: { text: string; value: any; byDefault ?: boolean }[];
  filterFn?: (a: any, data: any) => boolean;
}

export interface IExportRow {
  cells: IExportCell[]
  filterData?: any;
}

export interface IExportCell {
  type: string;
  align?:string;
  refId?: string;
  colorFn?: (data) => string;
  bgRefIdFn?: (data) => string;
}

export interface ITextCell extends IExportCell {
  type: 'text';
  text: string;
  icon?: string;
  color?: string;
}

export interface IItemsCell extends IExportCell {
  type: 'items',
  items: ITextCell[]
}

