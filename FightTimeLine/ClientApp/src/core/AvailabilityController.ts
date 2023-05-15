import * as M from "./Models";
import _ from "lodash";
import { IdGenerator } from "./Generators";
import * as Holders from "./Holders";
import { PresenterManager } from "./PresentationManager";
import { getAvailabilitiesForAbility } from "./Defensives/functions";
import {
  AbilityAvailabilityMap,
  AbilityMap,
  IAbilityAvailabilityMapData,
} from "./Maps";

export class AvailabilityController {
  constructor(
    private presenter: PresenterManager,
    private holders: Holders.Holders,
    private startDate: Date,
    private idgen: IdGenerator
  ) {}

  public setAbilityAvailabilityView(showAbilityAvailablity: boolean): void {
    this.holders.abilityAvailability.clear();
    if (showAbilityAvailablity) {
      const maps = this.holders.abilities
        .getAll()
        .map(getAvailabilitiesForAbility(this.holders));

      this.holders.abilityAvailability.clear();
      const items = _.flatten(maps).map(
        (a) =>
          a && new AbilityAvailabilityMap(
            this.presenter,
            this.idgen.getNextId(M.EntryType.AbilityAvailability),
            a.it,
            a.data
          )
      );
      this.holders.abilityAvailability.addRange(items);
    }
  }

  public updateAvailability(changedAbility: M.IAbility): void {
    if (this.presenter.view.showAbilityAvailablity) {
      const deps = [
        ...(changedAbility.overlapStrategy?.getDependencies() || []),
        changedAbility.name,
      ];
      const maps = this.holders.abilities.filter(
        (it) => it.ability && deps && deps.some((d) => d === it.ability.name)
      );
      maps.forEach((element) => {
        this.holders.abilityAvailability.removeForAbility(element.id);
      });
      const abis = maps.map(
        getAvailabilitiesForAbility(this.holders)
      );
      const items = _.flatten(abis).map(
        (a: { it: AbilityMap; data: IAbilityAvailabilityMapData }) =>
          a && new AbilityAvailabilityMap(
            this.presenter,
            this.idgen.getNextId(M.EntryType.AbilityAvailability),
            a.it,
            a.data
          )
      );

      this.holders.abilityAvailability.addRange(items);
    }
  }
}
