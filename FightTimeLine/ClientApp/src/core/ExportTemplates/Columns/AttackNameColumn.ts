import { IExportColumn, ITableOptions, IExportCell } from "src/core/ExportModels";
import { Holders } from "src/core/Holders";
import { BossAttackMap } from "src/core/Maps";
import { PresenterManager } from "src/core/PresentationManager";
import { BaseColumnTemplate, IColumnTemplate } from "src/core/TableModels";

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
