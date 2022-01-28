import { AttackRowExportTemplate, ExportTemplateContext } from "../BaseExportTemplate";
import { BooleanOptionsSetting, ExportAttack, ExportData, ITableOptions, ITableOptionSettings, TableOptionSettingType, TagsOptionsSetting } from "../ExportModels";
import { AttackNameColumn, BossTargetColumn, IColumnTemplate, TimeColumn } from "../TableModels";
import { JobDefensivesColumn } from "./Columns/JobDefensivesColumn";
import { MitigationsCombinedColumn } from "./Columns/MitigationsCombinedColumn";

export class BossAttackDefensiveTemplateV2 extends AttackRowExportTemplate {
  public loadOptions(data: ExportData): ITableOptionSettings {
    const cover: BooleanOptionsSetting = {
      name: "c",
      "defaultValue": false,
      displayName: "Cover Attacks",
      type: TableOptionSettingType.Boolean,
      description: "Renders ability shadows in for attacka ability covers when active"
    };
    const showHealing: BooleanOptionsSetting = {
      name: "h",
      "defaultValue": false,
      displayName: "Show Healing",
      type: TableOptionSettingType.Boolean,
      description: "Show Healing Abilities"
    };
    const actionsAsFilter: BooleanOptionsSetting = {
      name: "af",
      "defaultValue": false,
      displayName: "Filter by Ability",
      type: TableOptionSettingType.Boolean,
      description: "Allows to filter by Ability Name if turned on, filter by solo/party effect instead"
    };
    const columnsFilter: TagsOptionsSetting = {
      name: "cf",
      "defaultValue": ["time", "attack"],
      displayName: "Columns Filter",
      type: TableOptionSettingType.Tags,
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
      type: TableOptionSettingType.Tags,
      options: {
        items: data.data.jobs.map(j => ({ checked: true, icon: j.icon, id: j.order.toString() }))
      }
    };
    return [
      cover,
      actionsAsFilter,
      showHealing,
      columnsFilter,
      jobsFilter
    ]
  }
  constructor() {
    super();
  }

  get name(): string {
    return "Defensive cooldowns";
  }

  getOptions(options: ITableOptions, names: string[]): [boolean, boolean, boolean, string[], string[], boolean] {
    var result = options && names.map(s => options[s]);
    return result as any;
  }

  getColumns(context: ExportTemplateContext): IColumnTemplate<ExportAttack>[] {

    const options = this.getOptions(context.options, ["c", "af", "h", "cf", "jf"]);
    const [coverAll, afFilter, showHealing, columnsFilter, jobsFilter] = options || this.loadOptions(context.data).map(o => o.defaultValue);

    const jobs = context.data.data.jobs.sort((a, b) => a.role - b.role);
    const columnPresent = (columName: string, columnFunc) => !columnsFilter || columnsFilter.indexOf(columName) >= 0 ? columnFunc() : null;

    const colTemplates: IColumnTemplate<ExportAttack>[] = [
      columnPresent("time", () => new TimeColumn()),
      columnPresent("attack", () => new AttackNameColumn(context.presenter)),
      columnPresent("target", () => new BossTargetColumn()),
      columnPresent("mitigations", () => new MitigationsCombinedColumn(context.holders)),
      ...jobs
        .filter(j => !jobsFilter || jobsFilter.indexOf(j.order.toString()) >= 0)
        .map(j => new JobDefensivesColumn(j, context.jobRegistry, afFilter, coverAll, showHealing))
    ].filter(a => !!a);

    return colTemplates;
  }
}

