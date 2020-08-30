import { DataItem } from "vis-timeline"
import { BaseMap } from "./BaseMap";
import { IMoveable, IForSidePanel } from "../Holders/BaseHolder";
import * as AbilityMap from "./AbilityMap";
import { Utils } from "../Utils";
import * as Models from "../Models";

export interface IAbilityUsageMapData {
  start?: Date;
  ogcdAsPoints?: boolean;
  loaded?: boolean;
  showLoaded?: boolean;
}

export class AbilityUsageMap extends BaseMap<string, DataItem, IAbilityUsageMapData> implements IMoveable, IForSidePanel {
  sidePanelComponentName: string = "ability";

  onDataUpdate(data: IAbilityUsageMapData): void {
    this.setItem(this.createAbilityUsage(this.id, this.ability, data));
  }

  constructor(id: string, ability: AbilityMap.AbilityMap, settings: Models.IAbilitySettingData[], data: IAbilityUsageMapData) {
    super(id);
    this.ability = ability;
    this.calculatedDuration = ability.ability.duration;
    this.settings = settings;

    this.applyData(Object.assign({ ogcdAsPoints: false, loaded: false, showLoaded: false }, data));
  }

  ability: AbilityMap.AbilityMap;
  calculatedDuration: number;
  settings: Models.IAbilitySettingData[];


  get start(): Date {
    return this.item.start as Date;
  }

  get end(): Date {
    return this.item.end as Date;
  }

  get startAsNumber(): number {
    return this.item.start.valueOf() as number;
  }

  get endAsNumber(): number {
    return this.item.end.valueOf() as number;
  }

  getSettingData(name: string): Models.IAbilitySettingData {
    return this.settings && this.settings.find && this.settings.find(it => it.name === name);
  }

  getSetting(name: string): Models.IAbilitySetting {
    return this.ability.ability.settings && this.ability.ability.settings.find(it => it.name === name);
  }

  createAbilityUsage(id: string, ability: AbilityMap.AbilityMap, data: IAbilityUsageMapData): DataItem {
    const start = data.start;
    const end = new Date(start.valueOf() as number + ability.ability.cooldown * 1000);

    return <DataItem>{
      id: id,
      start: start,
      end: end,
      group: ability.id,
      className: this.buildClass({ ability: true, compact: ability.isCompact, loaded: data.showLoaded && data.loaded }),
      content: "",
      subgroup: "sg" + ability.id,
      type: data.ogcdAsPoints || !!ability.ability.charges ? "point" : "range",
      title: `<img class='tooltipAbilityIcon' src='${ability.ability.icon}'/><span>${Utils.formatTime(start)} - ${Utils.formatTime(end)}</span>`
    };
  }

  get loaded(): boolean {
    return this.data.loaded;
  }

  move(delta: number): boolean {
    const newDate = new Date(this.startAsNumber + delta * 1000);
    this.applyData({ start: newDate });
    return true;
  }
}
