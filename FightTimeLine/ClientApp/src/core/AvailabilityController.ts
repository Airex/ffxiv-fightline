import * as M from "./Models"
import * as H from "./DataHolders"
import * as _ from "lodash"
import { IdGenerator } from "./Generators"

type Range = {start: Date, end: Date};

export class AvailabilityController {
  constructor(private view: M.IView, private holders: H.Holders, private startDate: Date, private idgen: IdGenerator) {

  }

  private getDependencies(deps: string[], job: H.JobMap): any[] {
    let depUsages = [];
    if (deps) {
      depUsages =
        _.flatten(deps.map(
          ab => this.holders.itemUsages.getByAbility(
            this.holders.abilities.getByParentAndAbility(job.id, ab).id)));
    }
    return depUsages;
  }

  setAbilityAvailabilityView(showAbilityAvailablity: boolean): void {
    this.holders.abilityAvailability.clear();
    if (showAbilityAvailablity) {
      this.holders.abilities.getAll().forEach(it => {
        if (it.isStance) return;
        const deps = it.ability.overlapStrategy.getDependencies();
        if (!it.ability.charges) {
          this.processStandardAbility(it, deps);
        } else {
          this.processChargesAbility(it);
        }
      });
    }
  }

  updateAvailability(abilityChanged: M.IAbility): void {
    if (this.view.showAbilityAvailablity) {
      const deps = abilityChanged.overlapStrategy.getDependencies();
      this.holders.abilities
        .filter(it =>
          (it.ability && it.ability.name === abilityChanged.name) ||
          (deps && deps.some((d => d === abilityChanged.name))))
        .forEach(it => {
          if (!it.ability.charges) {
            this.processStandardAbility(it, deps);
          } else {
            this.processChargesAbility(it);
          }
        });
    }
  }

  private splitRange(ranges: Range[], atIndex: number, splitter: Range):Range[] {
    return ranges;
  }

  processChargesAbility(it: H.AbilityMap) {
    const usages = [
      //...this.getDependencies(deps, it.job),
      ...this.holders.itemUsages.getByAbility(it.id)
    ].sort((a, b) => (a.startAsNumber) - (b.startAsNumber));

    this.holders.abilityAvailability.removeForAbility(it.id);
    let chargesCount = it.ability.charges.initialCount;
    const maxCharges = it.ability.charges.count;
    const cooldown = it.ability.charges.cooldown;
    let nextIncreaseDate: Date = null;
    let currentDate: Date = this.startDate;

    let ranges: Range[] = [];
    ranges.push({ start: this.startDate, end: new Date(this.startDate.valueOf() + 30 * 60 * 1000) })
   

    usages.forEach((u) => {
      if (chargesCount === 0) {
        nextIncreaseDate = new Date(currentDate.valueOf() + cooldown * 1000);
        ranges = this.splitRange(ranges, ranges.length - 1, { start: currentDate, end: nextIncreaseDate });
      }
      chargesCount--;
      
    });

//    const maps = usages.map(c => {
//      chargesCount--;
//
//      const start = prev
//        ? (prev.end)
//        : (it.ability.requiresBossTarget
//          ? this.startDate
//          : new Date(this.startDate.valueOf() as number - 30 * 1000));
//      const diff = ((c.startAsNumber) - (start.valueOf() as number)) / 1000;
//      const av = diff > it.ability.cooldown;
//      prev = c;
//      if (av) {

//        return new H.AbilityAvailabilityMap(id,
//          it,
//          {
//            start: start,
//            end: new Date(c.startAsNumber - it.ability.cooldown * 1000),
//            available: true
//          });
//      }
//      return null;
//    }).filter(it => it != null);
    this.holders.abilityAvailability.addRange(ranges.map((value, index, array) => {
      const id = this.idgen.getNextId(M.EntryType.AbilityAvailability);
      return new H.AbilityAvailabilityMap(id,
          it,
          {
            start: value.start,
            end: value.end,
            available: true
          });
    }));

  }

  private processStandardAbility(it: H.AbilityMap, deps: string[]) {
    const usages = [
      ...this.getDependencies(deps, it.job),
      ...this.holders.itemUsages.getByAbility(it.id)
    ].sort((a, b) => (a.startAsNumber) - (b.startAsNumber));

    this.holders.abilityAvailability.removeForAbility(it.id);
    let prev: H.AbilityUsageMap = null;
    const maps = usages.map(c => {
      const start = prev
        ? (prev.end)
        : (it.ability.requiresBossTarget
          ? this.startDate
          : new Date(this.startDate.valueOf() as number - 30 * 1000));
      const diff = ((c.startAsNumber) - (start.valueOf() as number)) / 1000;
      const av = diff > it.ability.cooldown;
      prev = c;
      if (av) {
        const id = this.idgen.getNextId(M.EntryType.AbilityAvailability);
        return new H.AbilityAvailabilityMap(id,
          it,
          {
            start: start,
            end: new Date(c.startAsNumber - it.ability.cooldown * 1000),
            available: true
          });
      }
      return null;
    }).filter(it => it != null);
    this.holders.abilityAvailability.addRange(maps);
  }
}
