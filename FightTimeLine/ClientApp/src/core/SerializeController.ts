import * as Models from "./Models";
import { Utils } from "./Utils";
import * as Holders from "./Holders";
import { JobMap, BossAttackMap } from "./Maps";
import { ExportData } from "./ExportModels";

export class SerializeController {

  constructor(private holders: Holders.Holders, private gameName: string, private fraction, private data: Models.IFightData, private filter: Models.IFilter, private view: Models.IView) {

  }

  serializeFight(): Models.IFight {
    const abilitymaps = this.holders.abilities
      .getNonStancesAbilities()
      .map((it) => {
        return {
          name: it.ability.name,
          job: it.job.id,
          compact: it.isCompact,
          hidden: it.hidden
        };
      });
    const abilities = this.holders.itemUsages
      .getAll()
      .map((value) => {
        const a = value.ability;
        if (a) {
          return <IAbilityUsageData>{
            id: value.id,
            job: a.job.id,
            ability: a.ability.name,
            start: Utils.formatTime(value.start),
            settings: JSON.stringify(value.settings),
          };
        }
        return null;
      });
    const stances = this.holders.stances
      .getAll()
      .map((value) => {
        const a = value.ability;
        if (a) {
          return {
            id: value.id,
            job: a.job.id,
            ability: value.ability.ability.name,
            start: Utils.formatTime(value.start),
            end: Utils.formatTime(value.end),
          };
        }
        return null;
      });

    const fractionPart = this.fraction ? ":" + this.fraction.name : "";

    const fightData = <IFightSerializeData>{
      boss: this.serializeBoss(),
      initialTarget: this.holders.bossTargets.initialBossTarget,
      filter: this.filter,
      importedFrom: this.data.importedFrom,
      view: this.view,
      jobs: this.serializeJobs(),
      abilityMaps: abilitymaps,
      abilities: abilities,
      stances: stances,
      encounter: ""
    };
    return <Models.IFight>{
      id: this.data.fight && this.data.fight.id || "",
      name: this.data.fight && this.data.fight.name || "",
      userName: this.data.fight && this.data.fight.userName || "",
      game: this.gameName + fractionPart,
      isPrivate: false,
      data: JSON.stringify(fightData)
    };
  }

  serializeBoss(): Models.IBoss {

    var attacks = this.holders.bossAttacks.getAll()
      .filter(ab => ab.visible)
      .map(ab => {
        return <IBossAbilityUsageData>{
          id: ab.id,
          ability: <Models.IBossAbility>{
            name: ab.attack.name,
            type: ab.attack.type,
            tags: ab.attack.tags,
            offset: Utils.formatTime(ab.start),
            syncSettings: ab.attack.syncSettings,
            source: ab.attack.source,
            syncDowntime: ab.attack.syncDowntime,
            syncPreDowntime: ab.attack.syncPreDowntime,
            description: ab.attack.description
          }
        };
      })

    return <Models.IBoss>{
      id: this.data.boss && this.data.boss.id || "",
      name: this.data.boss && this.data.boss.name || "",
      userName: this.data.boss && this.data.boss.userName || "",
      isPrivate: this.data.boss && this.data.boss.isPrivate || false,
      ref: this.data.boss && this.data.boss.ref || "",
      data: JSON.stringify(<IBossSerializeData>{
        attacks,
        downTimes: this.holders.bossDownTime.getAll().map((it) => <IDowntimeSerializeData>{
          id: it.id,
          start: Utils.formatTime(it.start),
          end: Utils.formatTime(it.end),
          color: it.color,
          comment: it.comment
        })
      })
    };
  }


  serializeJobs(): IJobSerializeData[] {
    const map = this.holders.jobs.getAll()
      .map((value: JobMap) => <any>{
        id: value.id,
        name: value.job.name,
        order: value.order,
        pet: value.pet,
        // filter: value.filter,
        compact: value.isCompact,
        collapsed: value.collapsed
      });
    return map;
  }

  serializeForExport(): ExportData {

    const attacks = this.holders.bossAttacks.getAll()
      .filter(ab=>ab.visible)
      .map((ab: BossAttackMap) => ({
        id: ab.id,
        name: ab.attack.name,
        type: ab.attack.type,
        tags: ab.attack.tags,
        offset: ab.offset,
        desc: ab.attack.description
      }));


    const downTimes = this.holders.bossDownTime.getAll()
      .map((it) => <any>{
        id: it.id,
        start: it.start < it.end ? Utils.formatTime(it.start) : Utils.formatTime(it.end),
        end: it.start > it.end ? Utils.formatTime(it.start) : Utils.formatTime(it.end),
        comment: it.comment,
        color: it.color
      });

    const boss = {
      attacks,
      downTimes
    };


    const bossTargets = this.holders.bossTargets.getAll()
      .map((t) => ({
        target: t.target,
        start: Utils.formatTime(t.start as Date),
        end: Utils.formatTime(t.end as Date)
      }));

    const jobs = this.holders.jobs.getAll()
      .map((value: JobMap, index: number) => <any>{
        id: value.id,
        name: value.job.name,
        role: value.job.role,
        order: index,
        pet: value.pet,
        icon: value.job.icon
      });

    const abilities = this.holders.itemUsages.getAll()
      .map((value) => {
        const a = value.ability;
        return {
          id: value.id,
          job: a.job.id,
          ability: a.ability.name,
          type: a.ability.abilityType,
          duration: value.calculatedDuration,
          start: Utils.formatTime(value.start),
          settings: value.settings,
          icon: value.ability.ability.icon
        };
      });

    const data = {
      boss,
      bossTargets,
      initialTarget: this.holders.bossTargets.initialBossTarget,
      jobs,
      abilities
    }

    return <ExportData>{
      name: this.data.fight && this.data.fight.name || "",
      userName: this.data.fight && this.data.fight.userName || "",
      data: data
    };
  }
}

export interface IFightSerializeData {
  initialTarget: string;
  encounter: string;
  importedFrom: string;
  jobs: IJobSerializeData[];
  abilities: IAbilityUsageData[];
  stances: IStanceUsageData[];
  abilityMaps: IAbilityMapData[];
  boss: Models.IBoss;
  filter: Models.IFilter;
  view: Models.IView;
}

export interface IBossSerializeData {
  attacks: IBossAbilityUsageData[],
  downTimes: IDowntimeSerializeData[];
}

export interface IDowntimeSerializeData {
  id: string;
  start: string;
  end: string;
  color: string;
  comment: string;
}

export interface IJobSerializeData {
  id: string;
  name: string;
  order: number;
  pet: string;
  filter: Models.IAbilityFilter;
  compact: boolean;
  collapsed: boolean;
}

export interface IAbilityUsageData {
  id: string;
  job: string;
  ability: string;
  start: string;
  settings: string;
}

export interface IStanceUsageData {
  id: string;
  job: string;
  ability: string;
  start: string;
  end: string;
}

export interface IAbilityMapData {
  name: string;
  job: string;
  compact: boolean;
  hidden: boolean;
}

export interface IBossAbilityUsageData {
  id: string,
  ability: Models.IBossAbility;
}
