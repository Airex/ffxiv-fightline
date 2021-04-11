import { DataItem } from "vis-timeline";
import {BaseMap} from "./BaseMap";
import {IMoveable} from "../Holders/BaseHolder";
import {AbilityMap} from "./index";
import {Utils} from "../Utils";
import * as Models from "../Models";

export interface IJobStanceMapData {
  start?: Date;
  end?: Date;
  loaded?: boolean;
  showLoaded?: boolean;
}

export class JobStanceMap extends BaseMap<string, DataItem, IJobStanceMapData> implements IMoveable {
  move(delta: number): boolean {
    const newDateStart = new Date(this.start.valueOf() as number + delta * 1000);
    const newDateEnd = new Date(this.end.valueOf() as number + delta * 1000);
    this.applyData({
      start: newDateStart,
      end: newDateEnd
    });
    return true;
  }

  onDataUpdate(data: IJobStanceMapData): void {
    this.setItem(this.createStanceUsage(this.stanceAbility, this.id, this.ability.id, data.start, data.end, data.loaded, data.showLoaded));
  }

  constructor(presenter: Models.IPresenterData, id: string, ability: AbilityMap, stanceAbility: Models.IAbility, data: IJobStanceMapData) {
    super(presenter, id);
    this.ability = ability;
    this.stanceAbility = stanceAbility;
    this.applyData(Object.assign({ loaded: false, showLoaded: false }, data));
  }

  ability: AbilityMap;
  stanceAbility: Models.IAbility;
  loaded: boolean;

  get start(): Date {
    return this.item.start as Date;
  }

  get end(): Date {
    return this.item.end as Date;
  }

  set start(v: Date) {
    this.item.start = v;
  }

  set end(v: Date) {
    this.item.end = v;
  }
  createStanceUsage(ability: Models.IAbility, id: string, parentId: string, start: Date, end: Date, loaded: boolean, showLoaded: boolean): DataItem {

    return <DataItem>{
      id: id,
      start: start,
      end: end,
      group: parentId,
      className: this.buildClass({ stance: true, loaded: loaded && showLoaded }),
      content: "<img class='abilityIcon' src='" + ability.icon + "'/>",
      subgroup: "sg" + parentId,
      type: "range",
      title: `<img class='tooltipAbilityIcon' src='${ability.icon}'/>${ability.name}  ${Utils.formatTime(start)} - ${Utils.formatTime(end)}`,
    };
  }  

  // case M.EntryType.StanceUsage:
      //   const sability = this.holders.abilities.get(item.group).ability;
      //   return (item.end as number) - (item.start as number) > 0 &&
      //     new Date(item.start) >= new Date(this.startDate.valueOf() as number - 30 * 1000) &&
      //     !sability.overlapStrategy.check({ ...overlapCheckData, ability });
}
