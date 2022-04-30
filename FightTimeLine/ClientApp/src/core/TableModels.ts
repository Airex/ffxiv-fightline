import { ExportAttack, ExportData, IExportCell, IExportColumn, IExportItem, ITableOptions } from "./ExportModels";
import { TimeOffset } from "./Models";
import { PresenterManager } from "./PresentationManager";
import { Utils } from "./Utils";

export interface IColumnTemplate<RowData> {
  buildHeader(data: ExportData): IExportColumn;
  buildCell(data: ExportData, attack: RowData, options?: ITableOptions): IExportCell;
}


export abstract class BaseColumnTemplate {
  private startDate = new Date(946677600000);

  protected offsetCompareFn(a: TimeOffset, b: TimeOffset): number {
    const d = new Date();
    return Utils.getDateFromOffset(a, d).valueOf() - Utils.getDateFromOffset(b, d).valueOf();
  }

  protected getColor(it: any) {
    return (it.type === 1 ? "red" : (it.type === 2 ? "blue" : ""));
  }

  protected offsetFromDuration(start: TimeOffset, duration: number): TimeOffset {
    return Utils.formatTime(new Date(Utils.getDateFromOffset(start, this.startDate).valueOf() + duration * 1000));
  }

  protected isOffsetInRange(offset: TimeOffset, start: TimeOffset, end: TimeOffset) {
    const point = Utils.getDateFromOffset(offset, this.startDate);
    return Utils.getDateFromOffset(start, this.startDate) <= point &&
      Utils.getDateFromOffset(end, this.startDate) >= point;
  }

  protected isOffsetNear(offset: TimeOffset, start: TimeOffset, distance: [number, number]) {
    const [min, max] = distance;
    const point = Utils.getDateFromOffset(offset, this.startDate);
    const value = Utils.getDateFromOffset(start, this.startDate).valueOf() - point.valueOf();
    return value >= min * 1000 && value <= max * 1000;
  }

  protected text(input: Partial<IExportItem & IExportCell>): IExportCell {
    return <IExportCell>{
      items: [<IExportItem>{ ...<IExportItem>input, visible: true }],
      ...input
    };
  }

  protected items(items: Partial<IExportItem>[], cell: Partial<IExportCell>): IExportCell {
    return <IExportCell>{
      items: items.map(it => <IExportItem>{ ...it, visible: true }),
      ...cell
    };
  }
}

export class TimeColumn extends BaseColumnTemplate implements IColumnTemplate<ExportAttack> {
  buildHeader(data: ExportData): IExportColumn {
    return {
      text: "Time",
      name: "time",
      width: "50px",
      align: "center",
      listOfFilter: data.data.boss.downTimes
        .sort((a, b) => this.offsetCompareFn(a.start, b.start))
        .map(d => ({ text: d.comment, value: d, byDefault: true }))
        .concat({ text: "Other", value: { comment: "Other" } as any, byDefault: true }),
      filterFn: (d, row, col) => {
        const found = col?.listOfFilter?.find(item => item.value && Utils.inRange(item.value.start, item.value.end, row.filterData.offset));

        if (found) {
          return d.some(item => item && item.comment === found.value.comment);
        }

        return d.some(item => item && item.comment === "Other");
      },
    };
  }

  buildCell(data: ExportData, attack: ExportAttack): IExportCell {
    return this.text({
      text: attack.offset,
      align: "center",
      ignoreShowText: true,
      refId: (data.data.boss.downTimes.find(d => Utils.inRange(d.start, d.end, attack.offset)) || { id: null }).id,
      disableUnique: true,
      colorFn: (a) => {
        const dt = data.data.boss.downTimes.find(d => Utils.inRange(d.start, d.end, a.offset));
        return dt && dt.color || "";
      },
      bgRefIdFn: (a) => {
        const dt = data.data.boss.downTimes.find(d => Utils.inRange(d.start, d.end, attack.offset));
        return dt && dt.id;
      }
    });
  }

}

export class AttackNameColumn extends BaseColumnTemplate implements IColumnTemplate<ExportAttack> {
  constructor(private presenter: PresenterManager, private useAttackColor?: boolean) {
    super();
  }
  buildHeader(data: ExportData): IExportColumn {
    return {
      name: "boss",
      text: "Attack",
      width: "200px",
      listOfFilter: (this.presenter?.tags || []).concat(["Other"]).map(t => ({ text: t, value: t, byDefault: true })),
      filterFn: (a, d) => {
        const visible = !a || a.some(value => ((!d.filterData.tags || d.filterData.tags.length === 0) && value === "Other")
          || d.filterData.tags && d.filterData.tags.includes(value));
        return visible;
      }
    };
  }
  buildCell(data: ExportData, attack: ExportAttack, options?: ITableOptions): IExportCell {

    const color = this.useAttackColor ? attack.color : this.getColor(attack);

    return this.text({
      text: attack.name,
      ignoreShowText: true,
      color,
      refId: attack.id,
      tooltip: attack.desc,
      fullwidth: true,
      align: "center"
    });
  }

}

export class BossTargetColumn extends BaseColumnTemplate implements IColumnTemplate<ExportAttack> {
  constructor() {
    super();
  }
  buildHeader(data: ExportData): IExportColumn {
    return {
      name: "target",
      text: "Target",
      align: "center",
      width: "65px"
    };
  }
  buildCell(data: ExportData, attack: ExportAttack): IExportCell {
    const jobs = data.data.jobs.sort((a, b) => a.role - b.role);
    return this.items(
      data.data.bossTargets
        .filter(bt => this.isOffsetInRange(attack.offset, bt.start, bt.end))
        .map(bt => jobs.find(j => j.id === bt.target))
        .filter(p => !!p)
        .map(p => ({ text: p.name, icon: p.icon, refId: p.id, ignoreShowIcon: true })),
      {
        align: "center",
        disableUnique: true,
      }
    );
  }

}
