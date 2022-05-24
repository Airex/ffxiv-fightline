import { IExportCell, IExportColumn, IExportItem, ITableOptions } from "./ExportModels";
import { Holders } from "./Holders";
import { BossAttackMap } from "./Maps";
import { TimeOffset } from "./Models";
import { PresenterManager } from "./PresentationManager";
import { Utils } from "./Utils";

export interface IColumnTemplate<RowData> {
  buildHeader(data: Holders): IExportColumn;
  buildCell(data: Holders, attack: RowData, options?: ITableOptions): IExportCell;
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

export class TimeColumn extends BaseColumnTemplate implements IColumnTemplate<BossAttackMap> {
  buildHeader(data: Holders): IExportColumn {
    return {
      text: "Time",
      name: "time",
      width: "50px",
      align: "center",
      listOfFilter: data.bossDownTime.getAll()
        .sort((a, b) => this.offsetCompareFn(Utils.formatTime(a.start), Utils.formatTime(b.start)))
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

  buildCell(data: Holders, attack: BossAttackMap): IExportCell {
    return this.text({
      text: attack.offset,
      align: "center",
      ignoreShowText: true,
      refId: (data.bossDownTime.first(d =>
        Utils.inRange(Utils.formatTime(d.start), Utils.formatTime(d.end), attack.offset)) || { id: null }).id,
      disableUnique: true,
      colorFn: (a) => {
        const dt = data.bossDownTime.first(d => Utils.inRange(Utils.formatTime(d.start), Utils.formatTime(d.end), a.offset));
        return dt && dt.color || "";
      },
      bgRefIdFn: (a) => {
        const dt = data.bossDownTime.first(d => Utils.inRange(Utils.formatTime(d.start), Utils.formatTime(d.end), attack.offset));
        return dt && dt.id;
      }
    });
  }

}

export class AttackNameColumn extends BaseColumnTemplate implements IColumnTemplate<BossAttackMap> {
  constructor(private presenter: PresenterManager, private useAttackColor?: boolean) {
    super();
  }
  buildHeader(data: Holders): IExportColumn {
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
  buildCell(data: Holders, attack: BossAttackMap, options?: ITableOptions): IExportCell {

    const color = this.useAttackColor ? attack.attack.color : this.getColor(attack);

    return this.text({
      text: attack.attack.name,
      ignoreShowText: true,
      color,
      refId: attack.id,
      tooltip: attack.attack.description,
      fullwidth: true,
      align: "center"
    });
  }

}

export class BossTargetColumn extends BaseColumnTemplate implements IColumnTemplate<BossAttackMap> {
  constructor() {
    super();
  }
  buildHeader(data: Holders): IExportColumn {
    return {
      name: "target",
      text: "Target",
      align: "center",
      width: "65px"
    };
  }
  buildCell(data: Holders, attack: BossAttackMap): IExportCell {
    const jobs = data.jobs.getAll().sort((a, b) => a.job.role - b.job.role);
    return this.items(
      data.bossTargets
        .filter(bt => this.isOffsetInRange(Utils.formatTime(attack.start), Utils.formatTime(bt.start), Utils.formatTime(bt.end)))
        .map(bt => jobs.find(j => j.id === bt.target))
        .filter(p => !!p)
        .map(p => ({ text: p.translated, icon: p.job.icon, refId: p.id, ignoreShowIcon: true })),
      {
        align: "center",
        disableUnique: true,
      }
    );
  }

}
