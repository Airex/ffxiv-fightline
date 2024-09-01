import { Subject } from "rxjs";
import { AddAbilityCommand } from "src/core/commands/AddAbilityCommand";
import { RemoveAbilityCommand } from "src/core/commands/RemoveAbilityCommand";
import {
  AvailabilityForAbilityResult,
  getTimeGoodAbilityToUse,
} from "src/core/Defensives/functions";
import {
  IExportCell,
  IExportColumn,
  ITableOptions,
} from "src/core/ExportModels";
import { Holders } from "src/core/Holders";
import { AbilityUsageMap, BossAttackMap, JobMap } from "src/core/Maps";
import { IAbility, Role } from "src/core/Models";
import { BaseColumnTemplate, IColumnTemplate } from "src/core/TableModels";
import { Command } from "src/core/UndoRedo";

export class CheckBoxColumn
  extends BaseColumnTemplate
  implements IColumnTemplate<BossAttackMap>
{
  constructor(
    private onExecuted: Subject<Command>,
    private job: JobMap,
    private ability: IAbility,
    private avails: AvailabilityForAbilityResult
  ) {
    super();
  }

  buildHeader(data: Holders): IExportColumn {
    const abilityMap = data.abilities.getByParentAndAbility(
      this.job.id,
      this.ability.name
    );

    const jobMap = this.job;
    const backgroundColor =
      jobMap.job.role === Role.Tank
        ? "#0000ff54"
        : jobMap.job.role === Role.Healer
        ? "#00ff0054"
        : jobMap.job.role === Role.Melee
        ? "#ff000054"
        : jobMap.job.role === Role.Range
        ? "#ff00ff54"
        : jobMap.job.role === Role.Caster
        ? "#ffff0054"
        : undefined;

    return {
      name: this.ability.name,
      text: "",
      icon: this.ability.icon,
      width: "60px",
      refId: abilityMap.id,
      cursor: "pointer",
      backgroundColor,
    };
  }
  buildCell(
    data: Holders,
    attackMap: BossAttackMap,
    _options?: ITableOptions
  ): IExportCell {
    const attack = attackMap.attack;
    const ability = data.abilities.getByParentAndAbility(
      this.job.id,
      this.ability.name
    );

    const usages = data.itemUsages.getByAbility(ability.id);

    const [attackCovered, onCooldown] = aggregateMany(usages, [
      or((usage: AbilityUsageMap) => this.covered(attack, usage)),
      or((usage: AbilityUsageMap) => this.onCooldown(attack, usage)),
    ]);

    // optimization to avoid calculating this every time
    const safeToUse =
      !attackCovered &&
      !onCooldown &&
      this.safeToUse(this.avails, attackMap, this.ability);

    const color = attackCovered
      ? "#13761354" // green
      : onCooldown
      ? "#ff1e1e54" // red
      : safeToUse
      ? "#ffff0054" // yellow
      : "";

    const enabled = attackCovered || safeToUse;

    return this.checkbox({
      checked: attackCovered,
      id: `${attackMap.id}/${ability.id}`,
      disabled: !enabled,
      onChanged: (id, checked) => {
        const [, abilityId] = id.split("/");
        if (!checked) {
          const usage = data.itemUsages.getUsageThatCoversAttack(
            attackMap.start,
            abilityId
          );
          if (usage) {
            this.onExecuted.next(new RemoveAbilityCommand(usage.id, true));
          }
        } else {
          const date = getTimeGoodAbilityToUse(data, ability, attackMap);
          if (date) {
            this.onExecuted.next(
              new AddAbilityCommand(
                undefined,
                undefined,
                this.job.id,
                ability.ability.name,
                date,
                false,
                []
              )
            );
          }
        }
      },
      colorFn() {
        return color;
      },
      align: "center",
    });
  }

  getColumns(
    _data: Holders,
    _at: BossAttackMap,
    _options?: ITableOptions
  ): IColumnTemplate<BossAttackMap>[] {
    return undefined;
  }
}

function aggregateMany<
  T,
  TO extends any = any,
  TA extends ((arg0: TO, arg1: T) => TO)[] = any
>(inputArray: T[], functionsArray: TA): TO[] {
  return inputArray.reduce((acc, item) => {
    return functionsArray.map((fn, i) => fn(acc[i], item));
  }, []);
}

function or<T, U>(fn: (a: U) => T) {
  return (acc: T, v: U) => acc || fn(v);
}
