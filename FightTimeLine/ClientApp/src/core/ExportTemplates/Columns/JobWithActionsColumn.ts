import {
  IExportCell,
  IExportColumn,
  ITableOptions,
} from "src/core/ExportModels";
import { Holders } from "src/core/Holders";
import { BossAttackMap } from "src/core/Maps";
import { PresenterManager } from "src/core/PresentationManager";
import { BaseColumnTemplate, IColumnTemplate } from "src/core/TableModels";
import { CheckBoxColumn } from "./CheckBoxColumn";
import { IAbility } from "src/core/Models";

export class JobWithActionsColumn
  extends BaseColumnTemplate
  implements IColumnTemplate<BossAttackMap>
{
  constructor(
    private presenter: PresenterManager,
    private jobId: string,
    private abilitySelector: (a: IAbility) => boolean
  ) {
    super();
  }
  buildHeader(data: Holders): IExportColumn {
    const jobMap = data.jobs.get(this.jobId);

    return {
      name: "job" + this.jobId,
      text: jobMap.translated,
      icon: jobMap.job.icon,
      iconSize: 24,
    };
  }

  getColumns(
    data: Holders,
    _options?: ITableOptions
  ): IColumnTemplate<BossAttackMap>[] {
    const jobMap = data.jobs.get(this.jobId);
    return Object.values(jobMap.job.abilities)
      .filter(this.abilitySelector)
      .map((a) => {
        return new CheckBoxColumn(jobMap, a);
      });
  }

  buildCell(
    _data: Holders,
    _attackMap: BossAttackMap,
    _options?: ITableOptions
  ): IExportCell {
    return undefined;
  }
}
