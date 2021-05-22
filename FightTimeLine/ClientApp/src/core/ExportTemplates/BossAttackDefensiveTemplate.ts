import { IJobRegistryService } from "src/services/jobregistry.service-interface";
import { ExportTemplate } from "../BaseExportTemplate";
import { ExportAbility, ExportData, ExportJob, IExportColumn, IExportItem, IExportResultSet, IExportRow } from "../ExportModels";
import { SettingsEnum } from "../Jobs/FFXIV/shared";
import { AbilityType } from "../Models";
import * as PresentationManager from "../PresentationManager";
import { Utils } from "../Utils";

export class BossAttackDefensiveTemplate extends ExportTemplate {
  constructor(private coverAll: boolean = false, private filterByAbility: boolean = true) {
    super();
  }

  get name(): string {
    return this.coverAll ? "Defensive cooldowns (cover attacks)" : "Defensive cooldowns";
  }

  getColor(it: any) {
    return (it.type === 1 ? "red" : (it.type === 2 ? "blue" : ""));
  }

  build(data: ExportData, presenter: PresentationManager.PresenterManager, jobRegistry: IJobRegistryService): IExportResultSet {
    const coverAll = this.coverAll;
    const used = new Set<string>();
    const jobs = data.data.jobs.sort((a, b) => a.role - b.role);
    const rows = data.data.boss.attacks
      .sort((a, b) => this.offsetCompareFn(a.offset, b.offset))
      .map(attack => <IExportRow>{
        cells: [
          this.text({
            text: attack.offset,
            align: "center",
            refId: (data.data.boss.downTimes.find(d => Utils.inRange(d.start, d.end, attack.offset)) || { id: null }).id,
            disableUnique: true,
            colorFn: (a) => {
              const dt = data.data.boss.downTimes.find(d => Utils.inRange(d.start, d.end, a.offset));
              return dt && dt.color || "";
            },
            bgRefIdFn: (a) => {
              const dt = data.data.boss.downTimes.find(d => Utils.inRange(d.start, d.end, attack.offset))
              return dt && dt.id;
            }
          }),
          this.text({
            text: attack.name,
            color: this.getColor(attack),
            refId: attack.id,
            tooltip: attack.desc
          }),
          this.items(
            data.data.bossTargets
              .filter(bt => this.isOffsetInRange(attack.offset, bt.start, bt.end))
              .map(bt => jobs.find(j => j.id === bt.target))
              .map(p => ({ text: p.name, icon: p.icon, refId: p.id })),
            {
              align: "center",
              disableUnique: true,
            }
          ),
          ...jobs.map(job => this.items(data.data.abilities
            .reduce((acc, ability) => {
              const condition = (coverAll || !used.has(ability.id)) &&
                ability.job === job.id &&
                this.isDefenceAbility(ability.type) &&
                this.isOffsetInRange(attack.offset, ability.start, this.offsetFromDuration(ability.start, ability.duration))

              if (!condition) return acc;

              const result = <IExportItem>{
                text: ability.ability,
                icon: ability.icon,
                refId: ability.id,
                targetIcon: this.buildTargetIcon(ability, jobs),
                usageOffset: Utils.formatTime(new Date(Utils.getDateFromOffset(ability.start).getTime() - Utils.getDateFromOffset(attack.offset).getTime())),
                clone: used.has(ability.id),
                filterFn: (a) => {
                  if (!this.filterByAbility)
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

              if (!used.has(ability.id))
                used.add(ability.id);

              acc.push(result);

              return acc;
            }, []),
            {
              disableUnique: coverAll
            }))
        ],
        filterData: attack
      });

    const columns = [
      {
        text: "Time",
        name: "time",
        width: "50px",
        align: "center",
        listOfFilter: data.data.boss.downTimes
          .sort((a, b) => this.offsetCompareFn(a.start, b.start))
          .map(d => ({ text: d.comment, value: d, byDefault: true }))
          .concat({ text: "Other", value: <any>{ comment: "Other" }, byDefault: true }),
        filterFn: (data, row, col) => {
          const found = col && col.listOfFilter && col.listOfFilter.find(item => item.value && Utils.inRange(item.value.start, item.value.end, row.filterData.offset))

          if (found)
            return data.some(item => item && item.comment === found.value.comment);

          return data.some(item => item && item.comment === "Other");
        },
      },
      {
        name: "boss",
        text: "Attack",
        width: "200px",
        listOfFilter: (presenter && presenter.tags || []).concat(["Other"]).map(t => ({ text: t, value: t, byDefault: true })),
        filterFn: (a, d) => {
          let visible = !a || a.some(value => ((!d.filterData.tags || d.filterData.tags.length === 0) && value === "Other") || d.filterData.tags && d.filterData.tags.includes(value));
          return visible;
        }
      },
      {
        name: "target",
        text: "Target",
        align: "center",
        width: "65px"

      },
      ...jobs.map(it => {

        const filters = !this.filterByAbility
          ? this.createSoloPartFilter()
          : jobRegistry
            .getJob(it.name)
            .abilities
            .filter(jab => this.isDefenceAbility(jab.abilityType))
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(jab => ({
              text: jab.name,
              value: jab.name,
              byDefault: true
            }));

        return <IExportColumn>{
          text: it.name,
          name: it.id,
          icon: it.icon,
          refId: it.id,
          cursor: 'pointer',
          width: "auto",
          listOfFilter: filters
        }
      }),
    ];

    return <IExportResultSet>{
      columns: columns,
      rows: rows,
      title: this.name,
      filterByFirstEntry: true
    };
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

  private buildTargetIcon(ability: ExportAbility, jobs: ExportJob[]): string {
    const target = ability.settings?.find(s => s.name === SettingsEnum.Target)?.value;
    const job = target && jobs?.find(j => j.id === target);
    return job?.icon;
  }

  private isDefenceAbility(type: AbilityType) {
    return ((type & AbilityType.SelfDefense) === AbilityType.SelfDefense) ||
      ((type & AbilityType.PartyDefense) === AbilityType.PartyDefense) ||
      ((type & AbilityType.SelfShield) === AbilityType.SelfShield) ||
      ((type & AbilityType.TargetDefense) === AbilityType.TargetDefense) ||
      ((type & AbilityType.PartyShield) === AbilityType.PartyShield)
  }
}

