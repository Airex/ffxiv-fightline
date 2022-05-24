import { DataItem } from "vis-timeline";
import { BaseMap } from "./BaseMap";
import { AbilityMap } from "./AbilityMap";
import { IPresenterData } from "../Models";

export interface IAbilityAvailabilityMapData {
  start?: Date;
  end?: Date;
  available?: boolean;
}

export class AbilityAvailabilityMap extends BaseMap<string, DataItem, IAbilityAvailabilityMapData> {

  constructor(presenter: IPresenterData, id: string, ability: AbilityMap, data?: IAbilityAvailabilityMapData) {
    super(presenter, id);
    this.ability = ability;
    this.applyData(data);
  }

  ability: AbilityMap;
  onDataUpdate(data: IAbilityAvailabilityMapData): void {
    this.setItem(this.createAbilityAvailability(this.id, this.ability.id, data));
  }

  createAbilityAvailability(id: string, abilityId: string, data: IAbilityAvailabilityMapData): DataItem {
    return {
      start: data.start,
      end: data.end,
      id,
      content: "",
      group: abilityId,
      editable: false,
      type: "background",
      className: "availability " + (data.available ? "available" : "not-available")
    };
  }
}
