import { IExportCell, IExportColumn, IExportItem, ITableOptions } from "./ExportModels";
import { Holders } from "./Holders";
import { IBossAbility, TimeOffset } from "./Models";
import { Utils } from "./Utils";

export interface IColumnTemplate<RowData> {
  buildHeader(data: Holders): IExportColumn;
  buildCell(data: Holders, at: RowData, options?: ITableOptions): IExportCell;
}

export abstract class BaseColumnTemplate {
  protected offsetCompareFn(a: TimeOffset, b: TimeOffset): number {
    const d = new Date();
    return Utils.getDateFromOffset(a).valueOf() - Utils.getDateFromOffset(b).valueOf();
  }

  protected getColor(it: IBossAbility) {
    return (it.type === 1 ? "red" : (it.type === 2 ? "blue" : ""));
  }

  protected offsetFromDuration(start: TimeOffset, duration: number): TimeOffset {
    return Utils.formatTime(new Date(Utils.getDateFromOffset(start).valueOf() + duration * 1000));
  }

  protected isOffsetInRange(offset: TimeOffset, start: TimeOffset, end: TimeOffset) {
    const point = Utils.getDateFromOffset(offset);
    return Utils.getDateFromOffset(start) <= point &&
      Utils.getDateFromOffset(end) >= point;
  }

  protected isOffsetNear(offset: TimeOffset, start: TimeOffset, distance: [number, number]) {
    const [min, max] = distance;
    const point = Utils.getDateFromOffset(offset);
    const value = Utils.getDateFromOffset(start).valueOf() - point.valueOf();
    return value >= min * 1000 && value <= max * 1000;
  }

  protected text(input: Partial<IExportItem & IExportCell>): IExportCell {
    return {
      items: [{ ...input, visible: true }],
      ...input
    } as IExportCell;
  }

  protected items(items: Partial<IExportItem>[], cell: Partial<IExportCell>): IExportCell {
    return {
      items: items.map(it => ({ ...it, visible: true }) as IExportItem),
      ...cell
    } as IExportCell;
  }
}


