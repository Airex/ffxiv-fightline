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
  AttackTagsColumn,
} from "./Columns/AttackNameColumn";
import { BossTargetColumn } from "./Columns/BossTargetColumn";
import { JobWithActionsColumn } from "./Columns/JobWithActionsColumn";
import { MitigationsCombinedColumn } from "./Columns/MitigationsCombinedColumn";
import { TimeColumn } from "./Columns/TimeColumn";

type OptionsType = [string[], string[], boolean, boolean, number | undefined];

const OptionNames = {
  ColumnsFilter: "cf",
  JobsFilter: "jf",
  AttackColor: "atc",
  SoloMitigations: "asm",
  Level: "l",
};


export class BossAttackAndMitigationAbilities extends AttackRowExportTemplate {
  public override loadOptions(data: Holders): ITableOptionSettings {
    const addSoloMitigations: BooleanOptionsSetting = {
      name: OptionNames.SoloMitigations,
      defaultValue: false,
      displayName: "Add Solo Mitigations",
      visible: true,
      kind: TableOptionSettingType.Boolean,
    };

    const attackColor: BooleanOptionsSetting = {
      name: OptionNames.AttackColor,
      defaultValue: true,
      displayName: "Use Attack Color",
      visible: true,
      kind: TableOptionSettingType.Boolean,
    };

    const columnsFilter: TagsOptionsSetting = {
      name: OptionNames.ColumnsFilter,
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
      name: OptionNames.JobsFilter,
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

    return [
      ...super.loadOptions(data),
      columnsFilter,
      jobsFilter,
      attackColor,
      addSoloMitigations,
    ];
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
    const options = this.getOptions(context.options, [
      OptionNames.ColumnsFilter,
      OptionNames.JobsFilter,
      OptionNames.AttackColor,
      OptionNames.SoloMitigations,
      OptionNames.Level,
    ]);
    const [columnsFilter, jobsFilter, attackColor, addSoloMitigations, level] =
      options ||
      (this.loadOptions(context.holders).map(
        (o) => o.defaultValue
      ) as OptionsType);

    const jobs = context.holders.jobs
      .getAll()
      .sort((a, b) => a.job.role - b.job.role);

    const soloMitigationsFilter = addSoloMitigations
      ? (ab: { abilityType: AbilityType }) =>
          (ab.abilityType & AbilityType.SelfDefense) === AbilityType.SelfDefense
      : () => false;

    const columnPresent = createColumnPresentFunction(columnsFilter);

    const colTemplates: IColumnTemplate<BossAttackMap>[] = [
      columnPresent("time", () => new TimeColumn()),
      columnPresent(
        "attack",
        () => new AttackNameColumn(context.presenter, attackColor)
      ),
      columnPresent("damage", () => new AttackDamageColumn()),
      columnPresent("mitigations", () => new MitigationsCombinedColumn()),
      columnPresent("target", () => new BossTargetColumn()),
      columnPresent("tags", () => new AttackTagsColumn()),
      ...jobs
        .filter(
          (j) => !jobsFilter || jobsFilter.indexOf(j.order.toString()) >= 0
        )
        .map(
          (j) =>
            new JobWithActionsColumn(
              this.onExecuted,
              context.presenter,
              j.id,
              level,
              (ab) =>
                (ab.abilityType & AbilityType.PartyDefense) ===
                  AbilityType.PartyDefense ||
                (ab.abilityType & AbilityType.PartyShield) ===
                  AbilityType.PartyShield ||
                soloMitigationsFilter(ab)
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
