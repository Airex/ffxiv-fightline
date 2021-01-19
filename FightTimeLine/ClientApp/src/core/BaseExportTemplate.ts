import { Utils } from "./Utils"
import * as Models from "./Models";
import * as PresentationManager from "./PresentationManager";

export abstract class ExportTemplate {
  public startDate = new Date(946677600000);
  public name: string;
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

  protected text(input: Partial<IExportItem & IExportCell>): IExportCell {
    return <IExportCell>{ items: [<IExportItem>{ ...<IExportItem>input, visible: true }], ...<IExportCell>input };
  }

  protected items(items: Partial<IExportItem>[], cell: Partial<IExportCell>): IExportCell {
    return <IExportCell>{ items: items.map((it: IExportItem) => <IExportItem>{ ...it, visible: true }), ...cell };
  }
}

export interface IExportResultSet {
  columns: IExportColumn[];
  rows: IExportRow[];
  title: string;
  filterByFirstEntry: boolean;
}

export interface IExportColumn {
  type?: string;
  text: string;
  icon: string;
  align?: string;
  refId?: string;
  cursor?: string;
  listOfFilter?: { text: string; value: any; byDefault?: boolean }[];
  filterFn?: (a: any, data: any, c:IExportColumn) => boolean;
  name?: string;
}

export interface IExportRow {
  cells: IExportCell[]
  filterData?: any;
}

export interface IExportCell {
  items: IExportItem[];
  align?: string;
  disableUnique?: boolean;
  colorFn?: (data) => string;
  bgRefIdFn?: (data) => string;
}

export interface IExportItem {
  refId?: string;
  text: string;
  icon?: string;
  color?: string;
  visible?: boolean;
}

