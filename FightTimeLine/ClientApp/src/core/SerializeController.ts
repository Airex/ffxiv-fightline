import { IFightData, IFilter, IView, IFight, IBoss, IBossAbility, IAbilityFilter, DamageType } from "./Models";
import { Utils } from "./Utils";
import * as Holders from "./Holders";
import { JobMap, BossAttackMap, AbilityUsageMap } from "./Maps";
import { ExportData } from "./ExportModels";
import { valueFunctionProp } from "ng-zorro-antd/core/util";

export class SerializeController {

  serializeForDownload() {

    const attacks = this.holders.bossAttacks.getAll();
    const abs = this.holders.itemUsages.getAll();
    const jobs = this.holders.jobs.getAll();

    const getTarget = (ab: AbilityUsageMap) => {
      const value = ab.getSettingData("target")?.value;
      if (value){
        return this.holders.jobs.get(value).order;
      }
    }

    return {
      party: jobs.map(m=>({
        name: m.job.name,
        id: m.order
      })),
      events: [
        ...attacks.map(at => ({
          source: "boss",
          name: at.attack.name,
          offset: at.offset,
          tags: at.attack.tags,
          desription: at.attack.description,
          damageType: DamageType[at.attack.type]
        })),
        ...abs.map(ab => ({
          source: ab.ability.job.order,
          guid: +ab.ability.ability.xivDbId,
          name: ab.ability.ability.name,
          target: getTarget(ab),
          note: ab.getSettingData("note")?.value,
          offset: ab.offset
        }))
      ]
    }
  }

  constructor(
    private holders: Holders.Holders,
    private gameName: string,
    private fraction,
    private data: IFightData,
    private filter: IFilter,
    private view: IView) {

  }

  serializeFight(): IFight {
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
          return {
            id: value.id,
            job: a.job.id,
            ability: a.translated,
            start: Utils.formatTime(value.start),
            settings: JSON.stringify(value.settings),
          } as IAbilityUsageData;
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

    const fightData = {
      boss: this.serializeBoss(),
      initialTarget: this.holders.bossTargets.initialBossTarget,
      filter: this.filter,
      importedFrom: this.data.importedFrom,
      view: this.view,
      jobs: this.serializeJobs(),
      abilityMaps: abilitymaps,
      abilities,
      stances,
      encounter: ""
    } as IFightSerializeData;
    return {
      id: this.data.fight && this.data.fight.id || "",
      name: this.data.fight && this.data.fight.name || "",
      userName: this.data.fight && this.data.fight.userName || "",
      game: this.gameName + fractionPart,
      isPrivate: false,
      data: JSON.stringify(fightData)
    } as IFight;
  }

  serializeBoss(): IBoss {

    const attacks = this.holders.bossAttacks.getAll()
      .filter(ab => ab.visible)
      .map(ab => {
        return {
          id: ab.id,
          ability: {
            name: ab.attack.name,
            type: ab.attack.type,
            tags: ab.attack.tags,
            offset: Utils.formatTime(ab.start),
            syncSettings: ab.attack.syncSettings,
            source: ab.attack.source,
            syncDowntime: ab.attack.syncDowntime,
            syncPreDowntime: ab.attack.syncPreDowntime,
            description: ab.attack.description
          } as IBossAbility
        } as IBossAbilityUsageData;
      });

    return {
      id: this.data.boss && this.data.boss.id || "",
      name: this.data.boss && this.data.boss.name || "",
      userName: this.data.boss && this.data.boss.userName || "",
      isPrivate: this.data.boss && this.data.boss.isPrivate || false,
      ref: this.data.boss && this.data.boss.ref || "",
      data: JSON.stringify({
        attacks,
        downTimes: this.holders.bossDownTime.getAll().map((it) => ({
          id: it.id,
          start: Utils.formatTime(it.start),
          end: Utils.formatTime(it.end),
          color: it.color,
          comment: it.comment
        }))
      })
    } as IBoss;
  }


  serializeJobs(): IJobSerializeData[] {
    const map = this.holders.jobs.getAll()
      .map((value: JobMap) => ({
        id: value.id,
        name: value.translated,
        order: value.order,
        pet: value.pet,
        // filter: value.filter,
        compact: value.isCompact,
        collapsed: value.collapsed
      }) as IJobSerializeData);
    return map;
  }

  serializeForExport(): ExportData {

    const attacks = this.holders.bossAttacks.getAll()
      .filter(ab => ab.visible)
      .map((ab: BossAttackMap) => ({
        id: ab.id,
        name: ab.attack.name,
        type: ab.attack.type,
        tags: ab.attack.tags,
        offset: ab.offset,
        desc: ab.attack.description,
        color: ab.attack.color
      }));


    const downTimes = this.holders.bossDownTime.getAll()
      .map((it) => ({
        id: it.id,
        start: it.start < it.end ? Utils.formatTime(it.start) : Utils.formatTime(it.end),
        end: it.start > it.end ? Utils.formatTime(it.start) : Utils.formatTime(it.end),
        comment: it.comment,
        color: it.color
      }));

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
      .map((value: JobMap, index: number) => ({
        id: value.id,
        name: value.translated,
        role: value.job.role,
        order: index,
        pet: value.pet,
        icon: value.job.icon
      }));

    const abilities = this.holders.itemUsages.getAll()
      .map((value) => {
        const a = value.ability;
        return {
          id: value.id,
          job: a.job.id,
          ability: a.translated,
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
    };

    return {
      name: this.data.fight && this.data.fight.name || "",
      userName: this.data.fight && this.data.fight.userName || "",
      data
    } as ExportData;
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
  boss: IBoss;
  filter: IFilter;
  view: IView;
}

export interface IBossSerializeData {
  attacks: IBossAbilityUsageData[];
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
  filter: IAbilityFilter;
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
  id: string;
  ability: IBossAbility;
}
