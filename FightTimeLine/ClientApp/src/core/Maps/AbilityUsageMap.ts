import { DataItem } from "vis-timeline"
import { BaseMap, IOverlapCheckData } from "./BaseMap";
import { IMoveable, IForSidePanel } from "../Holders/BaseHolder";
import { Utils } from "../Utils";
import * as Models from "../Models";
import { AbilityMap } from "./AbilityMap";

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

  constructor(presenter: Models.IPresenterData, id: string, ability: AbilityMap, settings: Models.ISettingData[], data: IAbilityUsageMapData) {
    super(presenter, id);
    this.ability = ability;
    this.calculatedDuration = ability.ability.duration;
    this.settings = settings;

    this.applyData(Object.assign({ ogcdAsPoints: false, loaded: false, showLoaded: false }, data));
  }

  ability: AbilityMap;
  calculatedDuration: number;
  settings: Models.ISettingData[];


  get start(): Date {
    return this.item.start as Date;
  }

  get offset(): string {
    return Utils.formatTime(this.item.start as Date);
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

  getSettingData(name: string): Models.ISettingData {
    return this.settings && this.settings.find && this.settings.find(it => it.name === name);
  }

  getSetting(name: string): Models.IAbilitySetting {
    return this.ability.ability.settings && this.ability.ability.settings.find(it => it.name === name);
  }

  checkCoversDate(date: Date) : boolean {
    return this.start <= date && new Date(this.startAsNumber + this.ability.ability.duration * 1000)>= date;
  }

  createAbilityUsage(id: string, ability: AbilityMap, data: IAbilityUsageMapData): DataItem {
    const start = data.start;
    const end = new Date(start.valueOf() as number + ability.ability.cooldown * 1000);

    let item = <DataItem>{
      id: id,
      start: start,
      end: end,
      group: ability.id,
      className: this.buildClass({
        ability: true,
        compact: ability.isCompact || ability.job.isCompact || this.presenter.view.compactView,
        loaded: data.showLoaded && data.loaded
      }),
      content: "",      
      subgroup: "sg" + ability.id,
      selectable: true,
      type: data.ogcdAsPoints || !!ability.ability.charges ? "point" : "range",
      title: `<img class='tooltipAbilityIcon' src='${ability.ability.icon}'/><span>${Utils.formatTime(start)} - ${Utils.formatTime(end)}</span>`
    };

    (item as any).limitSize=false;
    return item;
  }

  get loaded(): boolean {
    return this.data.loaded;
  }

  move(delta: number): boolean {
    const newDate = new Date(this.startAsNumber + delta * 1000);
    this.applyData({ start: newDate });
    return true;
  }

  get hasNote(): boolean{
    return !!this.getSettingData("note")?.value;
  }

  canMove(overlapData: IOverlapCheckData): boolean {
    return overlapData.end.valueOf() - overlapData.start.valueOf() === this.ability.ability.cooldown * 1000 &&
      overlapData.start >= new Date(overlapData.globalStart.valueOf() - ((this.ability.ability.requiresBossTarget ? 0 : 1) * 30 * 1000)) &&
      !this.ability.ability.overlapStrategy.check({ ...overlapData, ability: this.ability.ability });
  }
}
