import { DataItem } from "vis-timeline";
import { BaseMap, IOverlapCheckData } from "./BaseMap";
import { IMoveable, IForSidePanel } from "../Holders/BaseHolder";
import { Utils } from "../Utils";
import * as Models from "../Models";
import { AbilityMap } from "./AbilityMap";
import { calculateDuration } from "../Durations";

export interface IAbilityUsageMapData {
  start?: Date;
  ogcdAsPoints?: boolean;
  loaded?: boolean;
  showLoaded?: boolean;
  cooldown?: number;
  warning?: boolean;
}

export class AbilityUsageMap extends BaseMap<string, DataItem, IAbilityUsageMapData> implements IMoveable, IForSidePanel {

  constructor(
    presenter: Models.IPresenterData,
    id: string,
    ability: AbilityMap,
    settings: Models.ISettingData[],
    data: IAbilityUsageMapData) {
    super(presenter, id);
    this.ability = ability;
    this.calculatedDuration = calculateDuration(ability.ability); // fix duration calculation
    this.settings = settings;

    this.applyData(Object.assign({ ogcdAsPoints: false, loaded: false, showLoaded: false }, data));
  }


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

  get loaded(): boolean {
    return this.data.loaded;
  }

  get hasNote(): boolean {
    return !!this.getSettingData("note")?.value;
  }
  sidePanelComponentName = "ability";

  ability: AbilityMap;
  calculatedDuration: number;
  settings: Models.ISettingData[];

  onDataUpdate(data: IAbilityUsageMapData): void {
    this.setItem(this.createAbilityUsage(this.id, this.ability, data));
  }

  getSettingData(name: string): Models.ISettingData {
    return this.settings && this.settings.find && this.settings.find(it => it.name === name);
  }

  getSetting(name: string): Models.IAbilitySetting {
    return this.ability.ability.settings && this.ability.ability.settings.find(it => it.name === name);
  }

  checkCoversDate(date: Date): boolean {
    return this.start <= date && new Date(this.startAsNumber + calculateDuration(this.ability.ability) * 1000) >= date;
  }

  createAbilityUsage(id: string, ability: AbilityMap, data: IAbilityUsageMapData): DataItem {
    const start = data.start;
    const cd = data.cooldown || ability.ability.cooldown;
    const end = new Date(start.valueOf() as number + cd * 1000);

    let title = `<div><img class='tooltipAbilityIcon' src='${ability.ability.icon}'/><span>${Utils.formatTime(start)} - ${Utils.formatTime(end)}</span><span></span></div>`;
    const note = this.getSettingData("note");
    if (note && note.value) {
      title += `<div>${note.value}</div>`;
    }

    const ogcdPoint = data.ogcdAsPoints && !ability.isDef;

    const item = {
      id,
      start,
      end,
      title,
      group: ability.id,
      className: this.buildClass({
        ability: true,
        compact: ability.isCompact || ability.job.isCompact || this.presenter.view.compactView,
        loaded: data.showLoaded && data.loaded
      }),
      content: "",
      subgroup: "sg" + ability.id,
      selectable: true,
      type: ogcdPoint ? "point" : "range"
    } as DataItem;

    (item as any).limitSize = false;
    return item;
  }

  move(delta: number): boolean {
    const newDate = new Date(this.startAsNumber + delta * 1000);
    this.applyData({ start: newDate });
    return true;
  }

  canMove(overlapData: IOverlapCheckData): boolean {
    const doNotAllowResize = (overlapData.end.valueOf() - overlapData.start.valueOf()) === this.ability.ability.cooldown * 1000;
    const diff = new Date(overlapData.globalStart.valueOf() - ((this.ability.ability.requiresBossTarget ? 0 : 1) * 30 * 1000));
    const windowStartCheck = overlapData.start >= diff;
    const overlapCheck = this.ability.ability.overlapStrategy.check({ ...overlapData, ability: this.ability.ability });

    return doNotAllowResize && windowStartCheck && !overlapCheck;
  }
}
