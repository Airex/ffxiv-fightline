import { IJobRegistryService } from "src/services/jobregistry.service-interface";
import { AttackRowExportTemplate } from "../BaseExportTemplate";
import { ExportAbility, ExportAttack, ExportData, ExportJob, IExportCell, IExportColumn, IExportItem, ITableOptions, ITableOptionSettings, TableOptionSettingType } from "../ExportModels";
import { SettingsEnum } from "../Jobs/FFXIV/shared";
import { AbilityType } from "../Models";
import * as PresentationManager from "../PresentationManager";
import { AttackNameColumn, BaseColumnTemplate, BossTargetColumn, IColumnTemplate, TimeColumn } from "../TableModels";
import { Utils } from "../Utils";

export class BossAttackDefensiveTemplateV2 extends AttackRowExportTemplate {
  public get options(): ITableOptionSettings {
    return {
      settings: [
        {
          name: "cover",
          "defaultValue": false,
          displayName: "Cover Attacks",
          type: TableOptionSettingType.Boolean,
          description: "Renders ability shadows in for attacka ability covers when active"
        },
        {
          name: "afFilter",
          "defaultValue": false,
          displayName: "Filter by Ability",
          type: TableOptionSettingType.Boolean,
          description: "Allows to filter by Ability Name if turned on, filter by solo/party effect instead"
        },
        {
          name: "iconsOnly",
          "defaultValue": false,
          displayName: "Icons only",
          type: TableOptionSettingType.Boolean,
          description: "Does not render ability names when turned on"
        },
        {
          name: "showTarget",
          "defaultValue": true,
          displayName: "Show target column",
          type: TableOptionSettingType.Boolean
        }
      ]
    }
  }
  constructor() {
    super();
  }

  get name(): string {
    return "Defensive cooldowns";
  }

  getOptions(options: ITableOptions) {
    let coverAll = false;
    if (options && options["cover"] !== undefined)
      coverAll = options["cover"];

    let afFilter = false;
    if (options && options["afFilter"] !== undefined)
      afFilter = options["afFilter"];

    let iconsOnly = false;
    if (options && options["iconsOnly"] !== undefined)
      iconsOnly = options["iconsOnly"];

    let showTarget = false;
    if (options && options["showTarget"] !== undefined)
      showTarget = options["showTarget"];

    return [coverAll, afFilter, iconsOnly, showTarget];
  }

  getColumns(data: ExportData, presenter: PresentationManager.PresenterManager, jobRegistry: IJobRegistryService, options: ITableOptions): IColumnTemplate<ExportAttack>[] {

    const [coverAll, afFilter, iconsOnly, showTarget] = this.getOptions(options);

    const jobs = data.data.jobs.sort((a, b) => a.role - b.role);

    const colTemplates: IColumnTemplate<ExportAttack>[] = [
      new TimeColumn(),
      new AttackNameColumn(presenter),
      showTarget ? new BossTargetColumn(iconsOnly) : null,
      ...jobs.map(j => new JobDefensivesColumn(j, jobRegistry, afFilter, iconsOnly, coverAll))
    ].filter(a => !!a);

    return colTemplates;
  }
}

export class JobDefensivesColumn extends BaseColumnTemplate implements IColumnTemplate<ExportAttack> {
  constructor(private it: ExportJob, private jobRegistry: IJobRegistryService, private afFilter: boolean, private iconsOnly: boolean, private coverAll: boolean) {
    super()
  }
  used = new Set<string>();
  buildHeader(data: ExportData): IExportColumn {
    const filters = !this.afFilter
      ? this.createSoloPartFilter()
      : this.jobRegistry
        .getJob(this.it.name)
        .abilities
        .filter(jab => this.isDefenceAbility(jab.abilityType))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(jab => ({
          text: jab.name,
          value: jab.name,
          byDefault: true
        }));

    return <IExportColumn>{
      text: this.iconsOnly ? "" : this.it.name,
      name: this.it.id,
      icon: this.it.icon,
      refId: this.it.id,
      cursor: 'pointer',
      width: "auto",
      listOfFilter: filters
    }
  }
  buildCell(data: ExportData, attack: ExportAttack): IExportCell {
    const jobs = data.data.jobs.sort((a, b) => a.role - b.role);
    return this.items(data.data.abilities
      .reduce((acc, ability) => {
        const condition = (this.coverAll || !this.used.has(ability.id)) &&
          ability.job === this.it.id &&
          this.isDefenceAbility(ability.type) &&
          this.isOffsetInRange(attack.offset, ability.start, this.offsetFromDuration(ability.start, ability.duration))

        if (!condition) return acc;

        const result = <IExportItem>{
          text: this.iconsOnly ? "" : ability.ability,
          icon: ability.icon,
          refId: ability.id,
          targetIcon: this.buildTargetIcon(ability, jobs),
          usageOffset: Utils.formatTime(new Date(Utils.getDateFromOffset(ability.start).getTime() - Utils.getDateFromOffset(attack.offset).getTime())),
          clone: this.used.has(ability.id),
          filterFn: (a) => {
            if (!this.afFilter)
              return (
                (ability.type & AbilityType.SelfDefense) === AbilityType.SelfDefense ||
                (ability.type & AbilityType.TargetDefense) === AbilityType.TargetDefense ||
                (ability.type & AbilityType.SelfShield) === AbilityType.SelfShield
              ) && a.indexOf("solo") >= 0 ||
              (
                (ability.type & AbilityType.PartyDefense) === AbilityType.PartyDefense ||
                (ability.type & AbilityType.PartyShield) === AbilityType.PartyShield
              ) && a.indexOf("party") >= 0
            else {
              return a.indexOf(ability.ability) >= 0
            }
          }
        };

        if (!this.used.has(ability.id))
          this.used.add(ability.id);

        acc.push(result);

        return acc;
      }, []),
      {
        disableUnique: this.coverAll
      })
  }

  private isDefenceAbility(type: AbilityType) {
    return ((type & AbilityType.SelfDefense) === AbilityType.SelfDefense) ||
      ((type & AbilityType.PartyDefense) === AbilityType.PartyDefense) ||
      ((type & AbilityType.SelfShield) === AbilityType.SelfShield) ||
      ((type & AbilityType.TargetDefense) === AbilityType.TargetDefense) ||
      ((type & AbilityType.PartyShield) === AbilityType.PartyShield)
  }

  private buildTargetIcon(ability: ExportAbility, jobs: ExportJob[]): string {
    const target = ability.settings?.find(s => s.name === SettingsEnum.Target)?.value;
    const job = target && jobs?.find(j => j.id === target);
    return job?.icon;
  }

  private createSoloPartFilter() {
    return [{
      text: "solo",
      value: "solo",
      byDefault: true
    }, {
      text: "party",
      value: "party",
      byDefault: true
    }];
  }

}