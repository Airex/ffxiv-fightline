import {
  IExportCell,
  IExportColumn,
  IExportItemCheckbox,
  ITableOptions,
} from "src/core/ExportModels";
import { Holders } from "src/core/Holders";
import { BossAttackMap, JobMap } from "src/core/Maps";
import { IAbility } from "src/core/Models";
import { BaseColumnTemplate, IColumnTemplate } from "src/core/TableModels";
import { Utils } from "src/core/Utils";

export class CheckBoxColumn
  extends BaseColumnTemplate
  implements IColumnTemplate<BossAttackMap>
{
  constructor(private job: JobMap, private ability: IAbility) {
    super();
  }

  buildHeader(data: Holders): IExportColumn {
    return {
      name: this.ability.name,
      text: "",
      icon: this.ability.icon,
      width: "60px",
    };
  }
  buildCell(
    data: Holders,
    attackMap: BossAttackMap,
    options?: ITableOptions
  ): IExportCell {
    const attack = attackMap;
    const ability = data.abilities.getByParentAndAbility(
      this.job.id,
      this.ability.name
    );
    const usages = data.itemUsages.getByAbility(ability.id);
    const checked = usages.some((usage) =>
      this.isOffsetInRange(
        attack.attack.offset,
        Utils.formatTime(usage.start),
        this.offsetFromDuration(
          Utils.formatTime(usage.start),
          usage.calculatedDuration
        )
      )
    );

    const onCooldown = usages.some((usage) =>
      this.isOffsetInRange(
        attack.attack.offset,
        Utils.formatTime(usage.start),
        Utils.formatTime(usage.end)
      )
    );

    return {
      items: [
        {
          type: "checkbox",
          checked,
          id: `${attack.id}-${ability.id}`,
        } as IExportItemCheckbox,
      ],
      colorFn(data) {
        return checked ? "#13761399" : onCooldown ? "#ff1e1e78" : "";
      },
      align: "center",
    } as IExportCell;
  }

  getColumns(
    data: Holders,
    at: BossAttackMap,
    options?: ITableOptions
  ): IColumnTemplate<BossAttackMap>[] {
    return undefined;
  }
}
