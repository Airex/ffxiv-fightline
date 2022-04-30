import { AttackRowExportTemplate, ExportTemplateContext } from "../BaseExportTemplate";
import {
  BooleanOptionsSetting, ExportAttack, ExportData, ITableOptions, ITableOptionSettings, LimitedNumberRangeOptionsSetting,
  TableOptionSettingType, TagsOptionsSetting
} from "../ExportModels";
import { AttackNameColumn, BossTargetColumn, IColumnTemplate, TimeColumn } from "../TableModels";
import { JobDefensivesColumn } from "./Columns/JobDefensivesColumn";
import { MitigationsCombinedColumn } from "./Columns/MitigationsCombinedColumn";

type OptionsType = [boolean, boolean, boolean, [number, number], string[], string[], boolean];

export class BossAttackDefensiveTemplateV2 extends AttackRowExportTemplate {
  public loadOptions(data: ExportData): ITableOptionSettings {
    const cover: BooleanOptionsSetting = {
      name: "c",
      defaultValue: false,
      displayName: "Cover Attacks",
      visible: true,
      kind: TableOptionSettingType.Boolean,
      description: "Renders ability shadows in for attacka ability covers when active"
    };

    const attackColor: BooleanOptionsSetting = {
      name: "atc",
      defaultValue: true,
      displayName: "Use Attack Color",
      visible: true,
      kind: TableOptionSettingType.Boolean
    };

    const healingRange: LimitedNumberRangeOptionsSetting = {
      name: "hr",
      defaultValue: [-5, 5],
      displayName: "Healing Detect Range",
      kind: TableOptionSettingType.LimitedNumberRange,
      visible: false,
      description: "Healing Detect Range",
      options: {
        min: -15,
        max: 15,
        marks: {
          0: "0"
        }
      }
    };

    const showHealing: BooleanOptionsSetting = {
      name: "h",
      defaultValue: false,
      displayName: "Show Healing",
      kind: TableOptionSettingType.Boolean,
      visible: true,
      description: "Show Healing Abilities",
      onChange: (value) => healingRange.visible = value
    };



    const actionsAsFilter: BooleanOptionsSetting = {
      name: "af",
      defaultValue: false,
      displayName: "Filter by Ability",
      visible: true,
      kind: TableOptionSettingType.Boolean,
      description: "Allows to filter by Ability Name if turned on, filter by solo/party effect instead"
    };

    const columnsFilter: TagsOptionsSetting = {
      name: "cf",
      defaultValue: ["time", "attack"],
      displayName: "Columns Filter",
      visible: true,
      kind: TableOptionSettingType.Tags,
      options: {
        items: [
          { id: "time", checked: true, text: "Time" },
          { id: "attack", checked: true, text: "Attack" },
          { id: "target", checked: false, text: "Target" },
          { id: "mitigations", checked: false, text: "Mitigations" },
        ]
      }
    };

    const jobsFilter: TagsOptionsSetting = {
      name: "jf",
      defaultValue: data.data.jobs.map(j => j.order.toString()),
      displayName: "Jobs Filter",
      kind: TableOptionSettingType.Tags,
      visible: true,
      options: {
        items: data.data.jobs.map(j => ({ checked: true, icon: j.icon, id: j.order.toString() }))
      }
    };
    return [
      cover,
      actionsAsFilter,
      showHealing,
      healingRange,
      columnsFilter,
      jobsFilter,
      attackColor
    ];
  }
  constructor() {
    super();
  }

  get name(): string {
    return "Defensive cooldowns";
  }

  getOptions(options: ITableOptions, names: string[]): OptionsType {
    const result = options && names.map(s => options[s]);
    return result as any;
  }

  getColumns(context: ExportTemplateContext): IColumnTemplate<ExportAttack>[] {

    const options = this.getOptions(context.options, ["c", "af", "h", "hr", "cf", "jf", "atc"]);
    const [coverAll, afFilter, showHealing, healingRange, columnsFilter, jobsFilter, attackColor]
      = options || this.loadOptions(context.data).map(o => o.defaultValue) as OptionsType;

    const sortedHealingRange = healingRange.sort();

    const jobs = context.data.data.jobs.sort((a, b) => a.role - b.role);
    const columnPresent = (columName: string, columnFunc) => !columnsFilter || columnsFilter.indexOf(columName) >= 0 ? columnFunc() : null;

    const colTemplates: IColumnTemplate<ExportAttack>[] = [
      columnPresent("time", () => new TimeColumn()),
      columnPresent("attack", () => new AttackNameColumn(context.presenter, attackColor)),
      columnPresent("target", () => new BossTargetColumn()),
      columnPresent("mitigations", () => new MitigationsCombinedColumn(context.holders)),
      ...jobs
        .filter(j => !jobsFilter || jobsFilter.indexOf(j.order.toString()) >= 0)
        .map(j => new JobDefensivesColumn(j, context.jobRegistry, afFilter, coverAll, showHealing, sortedHealingRange))
    ].filter(a => !!a);

    return colTemplates;
  }
}

