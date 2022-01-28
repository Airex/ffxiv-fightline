import * as M from "./Models"
import * as _ from "lodash"
import { IdGenerator } from "./Generators"
import * as Holders from "./Holders";
import { PresenterManager } from "./PresentationManager";
import { JobMap, AbilityMap, AbilityAvailabilityMap, AbilityUsageMap, IAbilityAvailabilityMapData } from "./Maps/index";
import { calculateDuration } from "./Durations";

type Range = { start: Date, end: Date };

export class AvailabilityController {
  constructor(private presenter: PresenterManager, private holders: Holders.Holders, private startDate: Date, private idgen: IdGenerator) {

  }

  private getDependencies(deps: string[], job: JobMap): any[] {
    let depUsages = [];
    if (deps) {
      depUsages =
        _.flatten(deps.map(
          ab => {
            const ability = this.holders.abilities.getByParentAndAbility(job.id, ab);
            if (!ability) {
              console.debug(ab)
              console.debug(job)
              return [];
            }
            const abilityId = ability.id;
            return this.holders.itemUsages.getByAbility(abilityId)
          }));
    }
    return depUsages;
  }

  setAbilityAvailabilityView(showAbilityAvailablity: boolean): void {
    this.holders.abilityAvailability.clear();
    if (showAbilityAvailablity) {
      const maps = this.holders.abilities.getAll().map(it => {
        if (it.isStance) return [];
        if (!it.ability.charges) {
          const deps = it.ability.overlapStrategy.getDependencies();
          return this.processStandardAbility(it, deps);
        } else {
          return this.processChargesAbility(it);
        }
      })
        .reduce((acc: AbilityAvailabilityMap[], v: AbilityAvailabilityMap[]) => {
          acc.push(...v);
          return acc;
        }, []);

      this.holders.abilityAvailability.addRange(maps);
    }
  }

  updateAvailability(abilityChanged: M.IAbility): void {
    if (this.presenter.view.showAbilityAvailablity) {
      const deps = [...(abilityChanged.overlapStrategy.getDependencies() || []), abilityChanged.name];
      const maps = this.holders.abilities
        .filter(it => it.ability && deps && deps.some((d => d === it.ability.name)))
        .map(it => {
          if (!it.ability.charges) {
            return this.processStandardAbility(it, deps);
          } else {
            return this.processChargesAbility(it);
          }
        })
        .reduce((acc: AbilityAvailabilityMap[], v: AbilityAvailabilityMap[]) => [...acc, ...v], []);
      this.holders.abilityAvailability.addRange(maps);
    }
  }

  private splitRange(ranges: Range[], atIndex: number, splitter: Range): Range[] {
    const newItem = <Range>{ start: splitter.end, end: ranges[atIndex].end }
    ranges[atIndex].end = splitter.start;
    ranges.push(newItem);
    return ranges;
  }

  private processChargesAbility(it: AbilityMap): AbilityAvailabilityMap[] {    
    this.holders.abilityAvailability.removeForAbility(it.id);

    const usages = [
      //...this.getDependencies(deps, it.job),
      ...this.holders.itemUsages.getByAbility(it.id)
    ].sort((a, b) => (a.startAsNumber) - (b.startAsNumber));

    const maxCharges = it.ability.charges.count;
    let chargesCount = it.ability.charges.initialCount || maxCharges;
    const cooldown = it.ability.charges.cooldown;

    let nextIncreaseDate: Date = null;   

    let ranges: Range[] = [];   

    usages.forEach((u) => {
      
      if (chargesCount == 0 && u.start < nextIncreaseDate) {
        u.applyData({warning: true});        
        return;
      };

      while (nextIncreaseDate && nextIncreaseDate < u.start) {
        chargesCount++
        if (chargesCount < maxCharges) {
          nextIncreaseDate = new Date(nextIncreaseDate.valueOf() + cooldown * 1000);
        }
        else {
          nextIncreaseDate = null;
        }
      }
      
      chargesCount--;
      if (!nextIncreaseDate )
        nextIncreaseDate = new Date(u.start.valueOf() + cooldown * 1000);

      if (chargesCount === 0) {        
          ranges.push({start: u.start, end: nextIncreaseDate});
        
      }
    });

    var result = ranges.map((value) => {
      const id = this.idgen.getNextId(M.EntryType.AbilityAvailability);
      const iAbilityAvailabilityMapData = <IAbilityAvailabilityMapData>(({
        start: value.start,
        end: value.end,
        available: false
      }) as any);
      return new AbilityAvailabilityMap(this.presenter, id, it, iAbilityAvailabilityMapData);
    });

    return result;

  }

  private processStandardAbility(it: AbilityMap, deps: string[]): AbilityAvailabilityMap[] {
    const usages = [
      ...this.getDependencies(deps, it.job),
      ...this.holders.itemUsages.getByAbility(it.id),
      {
        startAsNumber: this.startDate.valueOf() + 30 * 60 * 1000 + it.ability.cooldown * 1000 + calculateDuration(it.ability) * 1000
      }
    ].sort((a, b) => (a.startAsNumber) - (b.startAsNumber));
    this.holders.abilityAvailability.removeForAbility(it.id);

    if (usages.length - 1 === 0) return [];

    const minus30 = new Date(this.startDate.valueOf() as number - 30 * 1000);

    let prev: AbilityUsageMap = null;
    const maps = usages.map(c => {

      if (prev && !prev.end) {
        console.debug(prev);
      }

      const start = prev && prev.end
        ? (prev.end)
        : (it.ability.requiresBossTarget
          ? this.startDate
          : minus30);
      const diff = ((c.startAsNumber) - (start.valueOf() as number)) / 1000;
      const av = diff > it.ability.cooldown;
      prev = c;
      if (av) {
        return new AbilityAvailabilityMap(this.presenter,
          this.idgen.getNextId(M.EntryType.AbilityAvailability),
          it,
          {
            start: start,
            end: new Date(c.startAsNumber - it.ability.cooldown * 1000),
            available: true
          });
      }
      return null;
    }).filter(i => !!i);
    return maps;
  }
}
