import { ExportAbility, ExportAttack, ExportData, ExportJob, IExportCell, IExportColumn, IExportItem } from "src/core/ExportModels";
import { AbilityType, SettingsEnum } from "src/core/Models";
import { BaseColumnTemplate, IColumnTemplate } from "src/core/TableModels";
import { Utils } from "src/core/Utils";
import { IJobRegistryService } from "src/services/jobregistry.service-interface";

export class JobDefensivesColumn extends BaseColumnTemplate implements IColumnTemplate<ExportAttack> {
  constructor(
    private it: ExportJob,
    private jobRegistry: IJobRegistryService,
    private afFilter: boolean,
    private coverAll: boolean,
    private showHealing: boolean,
    private healingRange: [number, number]) {
    super();
  }
  used = new Set<string>();
  buildHeader(data: ExportData): IExportColumn {
    const filters = !this.afFilter
      ? this.createSoloPartFilter()
      : Object.values(this.jobRegistry.getJob(this.it.name).abilities)
        .filter(jab => this.isValidForColumn(jab.abilityType))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(jab => ({
          text: jab.name,
          value: jab.name,
          byDefault: true
        }));

    return {
      text: this.it.name,
      name: this.it.id,
      icon: this.it.icon,
      refId: this.it.id,
      cursor: 'pointer',
      width: "auto",
      listOfFilter: filters
    };
  }
  buildCell(data: ExportData, attack: ExportAttack): IExportCell {
    const jobs = data.data.jobs.sort((a, b) => a.role - b.role);
    const items = data.data.abilities.reduce((acc, ability) => {

      const isDefence = this.isDefence(ability.type);
      const isHealing = this.isHealing(ability.type);

      const condition = (this.coverAll || !this.used.has(ability.id)) &&
        ability.job === this.it.id &&
        this.isValidForColumn(ability.type) &&
        (
          isDefence && this.isOffsetInRange(attack.offset, ability.start, this.offsetFromDuration(ability.start, ability.duration)) ||
          this.showHealing && isHealing && this.isOffsetNear(attack.offset, ability.start, this.healingRange || [-5, 5])
        );

      if (!condition) {
        return acc;
      }

      const result = {
        text: ability.ability,
        icon: ability.icon,
        refId: ability.id,
        tooltip: ability.ability,
        color: isHealing ? "green" : undefined,
        targetIcon: this.buildTargetIcon(ability, jobs),
        usageOffset: Utils.offsetDiff(ability.start, attack.offset),
        clone: this.used.has(ability.id),
        filterFn: (a) => {
          if (!this.afFilter) {
            const solo = (
              (ability.type & AbilityType.SelfDefense) === AbilityType.SelfDefense ||
              (ability.type & AbilityType.TargetDefense) === AbilityType.TargetDefense ||
              (ability.type & AbilityType.SelfShield) === AbilityType.SelfShield
            ) && a.indexOf("solo") >= 0;
            const party = (
              (ability.type & AbilityType.PartyDefense) === AbilityType.PartyDefense ||
              (ability.type & AbilityType.PartyShield) === AbilityType.PartyShield
            ) && a.indexOf("party") >= 0;

            return solo || party;

          }
          else {
            return a.indexOf(ability.ability) >= 0;
          }
        }
      } as IExportItem;

      if (!this.used.has(ability.id)) {
        this.used.add(ability.id);
      }

      acc.push(result);

      return acc;
    }, []);
    return this.items(items, { disableUnique: this.coverAll });
  }

  private isValidForColumn(type: AbilityType) {
    return this.isDefence(type) || this.isHealing(type);
  }

  private isDefence(type: AbilityType) {
    return ((type & AbilityType.SelfDefense) === AbilityType.SelfDefense) ||
      ((type & AbilityType.PartyDefense) === AbilityType.PartyDefense) ||
      ((type & AbilityType.SelfShield) === AbilityType.SelfShield) ||
      ((type & AbilityType.TargetDefense) === AbilityType.TargetDefense) ||
      ((type & AbilityType.PartyShield) === AbilityType.PartyShield);
  }

  private isHealing(type: AbilityType) {
    return ((type & AbilityType.HealingBuff) === AbilityType.HealingBuff) ||
      ((type & AbilityType.Healing) === AbilityType.Healing);
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
