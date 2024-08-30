import { IExportColumn, IExportCell, ITableOptions } from "src/core/ExportModels";
import { Holders } from "src/core/Holders";
import { BossAttackMap } from "src/core/Maps";
import { BaseColumnTemplate, IColumnTemplate } from "src/core/TableModels";
import { Utils } from "src/core/Utils";

export class BossTargetColumn
  extends BaseColumnTemplate
  implements IColumnTemplate<BossAttackMap>
{
  constructor() {
    super();
  }
  buildHeader(data: Holders): IExportColumn {
    return {
      name: "target",
      text: "Target",
      align: "center",
      width: "65px",
    };
  }
  buildCell(data: Holders, attack: BossAttackMap): IExportCell {
    const jobs = data.jobs.getAll().sort((a, b) => a.job.role - b.job.role);
    return this.items(
      data.bossTargets
        .filter((bt) =>
          this.isOffsetInRange(
            Utils.formatTime(attack.start),
            Utils.formatTime(bt.start),
            Utils.formatTime(bt.end)
          )
        )
        .map((bt) => jobs.find((j) => j.id === bt.target))
        .filter((p) => !!p)
        .map((p) => ({
          type: "common",
          text: p.translated,
          icon: p.job.icon,
          refId: p.id,
          ignoreShowIcon: true,
        })),
      {
        align: "center",
        disableUnique: true,
      }
    );
  }

  getColumns(
    data: Holders,
    at: BossAttackMap,
    options?: ITableOptions
  ): IColumnTemplate<BossAttackMap>[] {
    return undefined;
  }
}
