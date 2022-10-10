import { AttackRowExportTemplate, ExportTemplateContext } from "../BaseExportTemplate";
import {
  BooleanOptionsSetting, ITableOptions, ITableOptionSettings, LimitedNumberRangeOptionsSetting,
  TableOptionSettingType, TagsOptionsSetting
} from "../ExportModels";
import { Holders } from "../Holders";
import { BossAttackMap } from "../Maps";
import { IColumnTemplate } from "../TableModels";
import { AttackNameColumn } from "./Columns/AttackNameColumn";
import { BossTargetColumn } from "./Columns/BossTargetColumn";
import { JobDefensivesColumn } from "./Columns/JobDefensivesColumn";
import { MitigationsCombinedColumn } from "./Columns/MitigationsCombinedColumn";
import { TimeColumn } from "./Columns/TimeColumn";

type OptionsType = [boolean, boolean, boolean, [number, number], string[], string[], boolean];

export class BossAttackDefensiveTemplateV2 extends AttackRowExportTemplate {

  public loadOptions(data: Holders): ITableOptionSettings {
    const cover: BooleanOptionsSetting = {
      name: "c",
      defaultValue: false,
      displayName: "Cover Attacks",
      visible: true,
      kind: TableOptionSettingType.Boolean,
      description: "Renders ability shadows in for attack ability covers when active"
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
      defaultValue: data.jobs.getAll().map(j => j.order.toString()),
      displayName: "Jobs Filter",
      kind: TableOptionSettingType.Tags,
      visible: true,
      options: {
        items: data.jobs.getAll().map(j => ({ checked: true, icon: j.job.icon, id: j.order.toString() }))
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

  getColumns(context: ExportTemplateContext): IColumnTemplate<BossAttackMap>[] {

    const options = this.getOptions(context.options, ["c", "af", "h", "hr", "cf", "jf", "atc", "l"]);
    const [coverAll, afFilter, showHealing, healingRange, columnsFilter, jobsFilter, attackColor]
      = options || this.loadOptions(context.holders).map(o => o.defaultValue) as OptionsType;

    const sortedHealingRange = healingRange.sort();

    const jobs = context.holders.jobs.getAll().sort((a, b) => a.job.role - b.job.role);
    const columnPresent = (columName: string, columnFunc) => !columnsFilter || columnsFilter.indexOf(columName) >= 0 ? columnFunc() : null;

    const colTemplates: IColumnTemplate<BossAttackMap>[] = [
      columnPresent("time", () => new TimeColumn()),
      columnPresent("attack", () => new AttackNameColumn(context.presenter, attackColor)),
      columnPresent("target", () => new BossTargetColumn()),
      columnPresent("mitigations", () => new MitigationsCombinedColumn()),
      ...jobs
        .filter(j => !jobsFilter || jobsFilter.indexOf(j.order.toString()) >= 0)
        .map(j => new JobDefensivesColumn(
          j, context.jobRegistry, afFilter, coverAll, showHealing,
          sortedHealingRange, context.options.l || context.presenter.fightLevel))
    ].filter(a => !!a);

    return colTemplates;
  }
}

