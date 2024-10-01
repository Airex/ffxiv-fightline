import {
  AvailabilityForAbilityResult,
  getAvailabilitiesForAbility,
  getTimeGoodAbilityToUse,
} from "./Defensives/functions";
import { calculateDuration } from "./Durations/functions";
import {
  IExportCell,
  IExportColumn,
  IExportItem,
  IExportItemCheckbox,
  ITableOptions,
} from "./ExportModels";
import { Holders } from "./Holders";
import { AbilityUsageMap, BossAttackMap } from "./Maps";
import { IAbility, IBossAbility, TimeOffset } from "./Models";
import { Utils } from "./Utils";

export interface IColumnTemplate<RowData> {
  buildHeader(data: Holders): IExportColumn;
  buildCell(data: Holders, at: RowData, options?: ITableOptions): IExportCell;
  getColumns(
    data: Holders,
    options?: ITableOptions
  ): IColumnTemplate<RowData>[];
}

export abstract class BaseColumnTemplate {
  protected offsetCompareFn(a: TimeOffset, b: TimeOffset): number {
    const d = new Date();
    return (
      Utils.getDateFromOffset(a).valueOf() -
      Utils.getDateFromOffset(b).valueOf()
    );
  }

  getColumns(
    data: Holders,
    at: BossAttackMap,
    options?: ITableOptions
  ): IColumnTemplate<BossAttackMap>[] {
    return undefined;
  }

  protected getColor(it: IBossAbility) {
    return it.type === 1 ? "red" : it.type === 2 ? "blue" : "";
  }

  protected offsetFromDuration(
    start: TimeOffset,
    duration: number
  ): TimeOffset {
    return Utils.formatTime(
      new Date(Utils.getDateFromOffset(start).valueOf() + duration * 1000)
    );
  }

  protected isOffsetInRange(
    offset: TimeOffset,
    start: TimeOffset,
    end: TimeOffset
  ) {
    const point = Utils.getDateFromOffset(offset);
    return (
      Utils.getDateFromOffset(start) <= point &&
      Utils.getDateFromOffset(end) >= point
    );
  }

  protected isOffsetNear(
    offset: TimeOffset,
    start: TimeOffset,
    distance: [number, number]
  ) {
    const [min, max] = distance;
    const point = Utils.getDateFromOffset(offset);
    const value = Utils.getDateFromOffset(start).valueOf() - point.valueOf();
    return value >= min * 1000 && value <= max * 1000;
  }

  protected covered(attack: IBossAbility, usage: AbilityUsageMap) {
    return this.isOffsetInRange(
      attack.offset,
      Utils.formatTime(usage.start),
      this.offsetFromDuration(
        Utils.formatTime(usage.start),
        usage.calculatedDuration
      )
    );
  }

  protected onCooldown(attack: IBossAbility, usage: AbilityUsageMap) {
    return this.isOffsetInRange(
      attack.offset,
      Utils.formatTime(usage.start),
      Utils.formatTime(usage.end)
    );
  }

  protected safeToUse(
    avails: AvailabilityForAbilityResult,
    attack: BossAttackMap,
    ability: IAbility
  ) {
    const duration = calculateDuration(ability);
    return (
      !avails ||
      avails?.some((it) => {
        return (
          it.data.available &&
          this.isOffsetInRange(
            attack.offset as TimeOffset,
            Utils.formatTime(it.data.start),
            Utils.formatTime(new Date(it.data.end.valueOf() + duration * 1000))
          )
        );
      })
    );
  }

  protected text(input: Partial<IExportItem & IExportCell>): IExportCell {
    return {
      ...input,
      items: [{ ...input, type: "common", visible: true }],
    } as IExportCell;
  }

  protected checkbox(
    input: Partial<IExportItemCheckbox & IExportCell>
  ): IExportCell {
    return {
      ...input,
      items: [{ ...input, type: "checkbox", visible: true }],
    } as IExportCell;
  }

  protected items(
    items: Partial<IExportItem>[],
    cell: Partial<IExportCell>
  ): IExportCell {
    return {
      items: items.map((it) => ({ ...it, visible: true } as IExportItem)),
      ...cell,
    } as IExportCell;
  }
}
