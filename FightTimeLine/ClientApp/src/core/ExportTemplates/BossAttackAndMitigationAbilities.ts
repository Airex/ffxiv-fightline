import {
  AttackRowExportTemplate,
  ExportTemplateContext,
} from "../BaseExportTemplate";
import {
  BooleanOptionsSetting,
  ITableOptions,
  ITableOptionSettings,
  TableOptionSettingType,
  TagsOptionsSetting,
} from "../ExportModels";
import { Holders } from "../Holders";
import { BossAttackMap } from "../Maps";
import { AbilityType } from "../Models";
import { IColumnTemplate } from "../TableModels";
import {
  AttackDamageColumn,
  AttackNameColumn,
} from "./Columns/AttackNameColumn";
import { BossTargetColumn } from "./Columns/BossTargetColumn";
import { JobWithActionsColumn } from "./Columns/JobWithActionsColumn";
import { TimeColumn } from "./Columns/TimeColumn";

type OptionsType = [string[], string[], boolean];

export class BossAttackAndMitigationAbilities extends AttackRowExportTemplate {
  public override loadOptions(data: Holders): ITableOptionSettings {
    const attackColor: BooleanOptionsSetting = {
      name: "atc",
      defaultValue: true,
      displayName: "Use Attack Color",
      visible: true,
      kind: TableOptionSettingType.Boolean,
    };

    const columnsFilter: TagsOptionsSetting = {
      name: "cf",
      defaultValue: ["time", "attack", "damage"],
      displayName: "Columns Filter",
      visible: true,
      kind: TableOptionSettingType.Tags,
      options: {
        items: [
          { id: "time", checked: true, text: "Time" },
          { id: "attack", checked: true, text: "Attack" },
          { id: "damage", checked: true, text: "Damage" },
          { id: "target", checked: false, text: "Target" },
          { id: "mitigations", checked: false, text: "Mitigations" },
          { id: "tags", checked: false, text: "Tags" },
        ],
      },
    };

    const jobsFilter: TagsOptionsSetting = {
      name: "jf",
      defaultValue: data.jobs.getAll().map((j) => j.order.toString()),
      displayName: "Jobs Filter",
      kind: TableOptionSettingType.Tags,
      visible: true,
      options: {
        items: data.jobs.getAll().map((j) => ({
          checked: true,
          icon: j.job.icon,
          id: j.order.toString(),
        })),
      },
    };

    return [...super.loadOptions(data), columnsFilter, jobsFilter, attackColor];
  }

  constructor() {
    super();
  }

  get name(): string {
    return "Defensive abilities";
  }

  getOptions(options: ITableOptions, names: string[]): OptionsType {
    const result = options && names.map((s) => options[s]);
    return result as OptionsType;
  }

  public override getColumns(
    context: ExportTemplateContext
  ): IColumnTemplate<BossAttackMap>[] {
    const options = this.getOptions(context.options, ["cf", "jf", "atc"]);
    const [columnsFilter, jobsFilter, attackColor] =
      options ||
      (this.loadOptions(context.holders).map(
        (o) => o.defaultValue
      ) as OptionsType);

    const jobs = context.holders.jobs
      .getAll()
      .sort((a, b) => a.job.role - b.job.role);

    const columnPresent = createColumnPresentFunction(columnsFilter);

    const colTemplates: IColumnTemplate<BossAttackMap>[] = [
      columnPresent("time", () => new TimeColumn()),
      columnPresent(
        "attack",
        () => new AttackNameColumn(context.presenter, attackColor)
      ),
      columnPresent("damage", () => new AttackDamageColumn()),
      columnPresent("target", () => new BossTargetColumn()),
      ...jobs
        .filter(
          (j) => !jobsFilter || jobsFilter.indexOf(j.order.toString()) >= 0
        )
        .map(
          (j) =>
            new JobWithActionsColumn(
              context.presenter,
              j.id,
              (ab) =>
                (ab.abilityType & AbilityType.PartyDefense) ===
                  AbilityType.PartyDefense ||
                (ab.abilityType & AbilityType.PartyShield) ===
                  AbilityType.PartyShield
            )
        ),
    ].filter(Boolean);

    return colTemplates;
  }
}

function createColumnPresentFunction(columnsFilter: string[]) {
  return (
    columName: string,
    columnFunc: () => IColumnTemplate<BossAttackMap>
  ) =>
    !columnsFilter || columnsFilter.indexOf(columName) >= 0
      ? columnFunc()
      : null;
}
