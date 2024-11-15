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
import { IAbility, Role } from "src/core/Models";
import {
  abilityLevelValid,
  getAvailabilitiesForAbility,
} from "src/core/Defensives/functions";
import { Subject } from "rxjs";
import { Command } from "src/core/UndoRedo";

export class JobWithActionsColumn
  extends BaseColumnTemplate
  implements IColumnTemplate<BossAttackMap>
{
  constructor(
    private onExecuted: Subject<Command>,
    private presenter: PresenterManager,
    private jobId: string,
    private level: number | undefined,
    private abilitySelector: (a: IAbility) => boolean
  ) {
    super();
  }
  buildHeader(data: Holders): IExportColumn {
    const jobMap = data.jobs.get(this.jobId);

    return {
      name: "job" + this.jobId,
      text: "",
      icon: jobMap.job.icon,
      refId: this.jobId,
      iconSize: 24,
      cursor: "pointer",
      backgroundColor: this.colorForRole(jobMap.job.role),
    };
  }

  getColumns(
    data: Holders,
    _options?: ITableOptions
  ): IColumnTemplate<BossAttackMap>[] {
    const jobMap = data.jobs.get(this.jobId);

    return Object.values(jobMap.job.abilities)
      .filter(
        (x) =>
          abilityLevelValid(
            [x.levelAcquired, x.levelRemoved],
            this.level || this.presenter.fightLevel
          ) && this.abilitySelector(x)
      )
      .map((ability) => {
        const ab = data.abilities.getByParentAndAbility(
          jobMap.id,
          ability.name
        );
        const avails = getAvailabilitiesForAbility(data)(ab);

        return new CheckBoxColumn(this.onExecuted, jobMap, ability, avails);
      });
  }

  colorForRole(role: Role) {
    return role === Role.Tank
      ? "#0000ff54"
      : role === Role.Healer
      ? "#00ff0054"
      : role === Role.Melee
      ? "#ff000054"
      : role === Role.Range
      ? "#ff00ff54"
      : role === Role.Caster
      ? "#ffff0054"
      : undefined;
  }

  buildCell(
    _data: Holders,
    _attackMap: BossAttackMap,
    _options?: ITableOptions
  ): IExportCell {
    return undefined;
  }
}
