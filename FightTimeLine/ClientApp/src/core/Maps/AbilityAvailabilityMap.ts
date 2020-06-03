import {DataItem} from "vis-timeline";
import {BaseMap} from "./BaseMap";
import { AbilityMap } from "./AbilityMap";

export interface IAbilityAvailabilityMapData {
  start?: Date;
  end?: Date;
  available?: boolean;
}

export class AbilityAvailabilityMap extends BaseMap<string, DataItem, IAbilityAvailabilityMapData> {
  onDataUpdate(data: IAbilityAvailabilityMapData): void {
    this.setItem(this.createAbilityAvailability(this.id, this.ability.id, data.start, data.end, data.available));
  }

  constructor(id: string, ability: AbilityMap, data?: IAbilityAvailabilityMapData) {
    super(id);
    this.ability = ability;
    this.applyData(data);
  }

  ability: AbilityMap;

  createAbilityAvailability(id: string, abilityId: string, start: Date, end: Date, available: boolean): DataItem {
    return {
      start: start,
      end: end,
      id: id,
      content: "",
      group: abilityId,
      editable: false,
      type: "background",
      className: "availability " + (available ? "available" : "not-available")
    }
  }
}
