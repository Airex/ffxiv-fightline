import * as M from "./Models";
import _ from "lodash";
import { IdGenerator } from "./Generators";
import * as Holders from "./Holders";
import { PresenterManager } from "./PresentationManager";
import { getAvailabilitiesForAbility } from "./Defensives";
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
        .map(getAvailabilitiesForAbility(this.holders, this.startDate));

      this.holders.abilityAvailability.clear();
      const items = _.flatten(maps).map(
        (a: { it: AbilityMap; data: IAbilityAvailabilityMapData }) =>
          new AbilityAvailabilityMap(
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
      const maps = this.holders.abilities
        .filter(
          (it) => it.ability && deps && deps.some((d) => d === it.ability.name)
        )
        .map(getAvailabilitiesForAbility(this.holders, this.startDate));
      const items = _.flatten(maps).map(
        (a: { it: AbilityMap; data: IAbilityAvailabilityMapData }) =>
          new AbilityAvailabilityMap(
            this.presenter,
            this.idgen.getNextId(M.EntryType.AbilityAvailability),
            a.it,
            a.data
          )
      );
      items.forEach((element) => {
        this.holders.abilityAvailability.removeForAbility(element.ability.id);
      });
      this.holders.abilityAvailability.addRange(items);
    }
  }
}
