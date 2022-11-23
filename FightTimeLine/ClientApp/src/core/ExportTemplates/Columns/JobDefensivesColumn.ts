import { IExportCell, IExportColumn, IExportItem } from "src/core/ExportModels";
import { Holders } from "src/core/Holders";
import { JobsMapHolder } from "src/core/Holders/JobsMapHolder";
import { AbilityUsageMap, BossAttackMap, JobMap } from "src/core/Maps";
import { AbilityType, SettingsEnum } from "src/core/Models";
import { BaseColumnTemplate, IColumnTemplate } from "src/core/TableModels";
import { Utils } from "src/core/Utils";
import { IJobRegistryService } from "src/services/jobregistry.service-interface";

export class JobDefensivesColumn extends BaseColumnTemplate implements IColumnTemplate<BossAttackMap> {
  constructor(
    private job: JobMap,
    private jobRegistry: IJobRegistryService,
    private afFilter: boolean,
    private coverAll: boolean,
    private showHealing: boolean,
    private healingRange: [number, number],
    private level: number) {
    super();
  }
  used = new Set<string>();
  private jobAbilities: AbilityUsageMap[];

  buildHeader(data: Holders): IExportColumn {
    const filters = !this.afFilter
      ? this.createSoloPartFilter()
      : Object.values(this.jobRegistry.getJob(this.job.job.name).abilities)
        .filter(jab => this.isValidForColumn(jab.abilityType))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(jab => ({
          text: jab.name,
          value: jab.name,
          byDefault: true
        }));

    return {
      text: this.job.translated,
      name: this.job.id,
      icon: this.job.job.icon,
      refId: this.job.id,
      cursor: 'pointer',
      width: "auto",
      listOfFilter: filters
    };
  }

  buildCell(data: Holders, attack: BossAttackMap): IExportCell {
    const jobs = data.jobs;

    if (!this.jobAbilities) {
      this.jobAbilities = data.itemUsages.filter(i => i.ability.job.id === this.job.id);
    }


    const items = this.jobAbilities.reduce((acc, usage) => {

      const isDefence = this.isDefence(usage.ability.ability.abilityType);
      const isHealing = this.isHealing(usage.ability.ability.abilityType);

      const condition =
        this.isLevelInRange([usage.ability.ability.levelAcquired, usage.ability.ability.levelRemoved], this.level) &&
        (this.coverAll || !this.used.has(usage.id)) &&
        usage.ability.job.id === this.job.id &&
        this.isValidForColumn(usage.ability.ability.abilityType) &&
        (
          isDefence && this.isOffsetInRange(attack.attack.offset, Utils.formatTime(usage.start),
            this.offsetFromDuration(Utils.formatTime(usage.start), usage.calculatedDuration)) ||
          this.showHealing && isHealing &&
          this.isOffsetNear(attack.attack.offset, Utils.formatTime(usage.start), this.healingRange || [-5, 5])
        );

      if (!condition || acc.some(a => a.text === usage.ability.translated)) {
        return acc;
      }

      const result = {
        text: usage.ability.translated,
        icon: usage.ability.ability.icon,
        refId: usage.id,
        tooltip: usage.ability.translated,
        color: isHealing ? "green" : undefined,
        targetIcon: this.buildTargetIcon(usage, jobs),
        usageOffset: Utils.offsetDiff(Utils.formatTime(usage.start), Utils.formatTime(attack.start)),
        clone: this.used.has(usage.id),
        filterFn: (a) => {
          if (!this.afFilter) {
            const solo = (
              usage.ability.hasValue(AbilityType.SelfDefense) ||
              usage.ability.hasValue(AbilityType.TargetDefense) ||
              usage.ability.hasValue(AbilityType.SelfShield)
            ) && a.indexOf("solo") >= 0;
            const party = (
              (usage.ability.ability.abilityType & AbilityType.PartyDefense) === AbilityType.PartyDefense ||
              (usage.ability.ability.abilityType & AbilityType.PartyShield) === AbilityType.PartyShield
            ) && a.indexOf("party") >= 0;

            return solo || party;

          }
          else {
            return a.indexOf(usage.ability.ability.name) >= 0;
          }
        }
      } as IExportItem;

      if (!this.used.has(usage.id)) {
        this.used.add(usage.id);
      }

      acc.push(result);

      return acc;
    }, [] as IExportItem[]);
    return this.items(items, { disableUnique: this.coverAll });
  }
  isLevelInRange(abilityLevel: [number, number?], level: number): boolean {
    if (!abilityLevel) { return true; }
    const [from, to] = abilityLevel;
    if (from <= level) { return true; }
    if (to && to >= level) { return true; }
    return false;
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

  private buildTargetIcon(ability: AbilityUsageMap, jobs: JobsMapHolder): string {
    const target = ability.getSettingData(SettingsEnum.Target)?.value;
    const job = target && jobs.get(target);
    return job?.job?.icon;
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
