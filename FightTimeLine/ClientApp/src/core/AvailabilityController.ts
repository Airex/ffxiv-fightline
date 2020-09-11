import * as M from "./Models"
import * as _ from "lodash"
import { IdGenerator } from "./Generators"
import * as Holders from "./Holders";
import { PresenterManager } from "./PresentationManager";
import { JobMap, AbilityMap, AbilityAvailabilityMap, AbilityUsageMap, IAbilityAvailabilityMapData } from "./Maps/index";


type Range = { start: Date, end: Date };

export class AvailabilityController {
  constructor(private presenter: PresenterManager, private holders: Holders.Holders, private startDate: Date, private idgen: IdGenerator) {

  }

  private getDependencies(deps: string[], job: JobMap): any[] {
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
    return [];
    const usages = [
      //...this.getDependencies(deps, it.job),
      ...this.holders.itemUsages.getByAbility(it.id)
    ].sort((a, b) => (a.startAsNumber) - (b.startAsNumber));

    this.holders.abilityAvailability.removeForAbility(it.id);
    const maxCharges = it.ability.charges.count;
    let chargesCount = it.ability.charges.initialCount || maxCharges;

    const cooldown = it.ability.charges.cooldown;
    let nextIncreaseDate: Date = null;
    const endDate = new Date(this.startDate.valueOf() + 30 * 60 * 1000);

    let ranges: Range[] = [];
    let restorePoints: { date: Date }[] = [];

    ranges.push({ start: this.startDate, end: endDate })

    usages.forEach((u) => {
      chargesCount--;
      nextIncreaseDate = new Date(u.start.valueOf() + cooldown * 1000);
      restorePoints.push({ date: nextIncreaseDate });
      if (chargesCount === 0) {
        while (restorePoints.length > 0) {
          const rst = restorePoints.splice(0, 1);
          if (chargesCount === 0) {
            ranges = this.splitRange(ranges, ranges.length - 1, { start: u.start, end: rst[0].date });
          }
          chargesCount++;
          if (chargesCount > maxCharges) chargesCount = maxCharges;
        }

      }
    });

    this.holders.abilityAvailability.addRange(ranges.map((value) => {
      const id = this.idgen.getNextId(M.EntryType.AbilityAvailability);
      const iAbilityAvailabilityMapData = <IAbilityAvailabilityMapData>(({
        start: value.start,
        end: value.end,
        available: true
      }) as any);
      return new AbilityAvailabilityMap(id, it, iAbilityAvailabilityMapData);
    }));

  }

  private processStandardAbility(it: AbilityMap, deps: string[]): AbilityAvailabilityMap[] {
    const usages = [
      ...this.getDependencies(deps, it.job),
      ...this.holders.itemUsages.getByAbility(it.id),
      {
        startAsNumber: this.startDate.valueOf() + 30 * 60 * 1000 + it.ability.cooldown * 1000 + it.ability.duration * 1000
      }
    ].sort((a, b) => (a.startAsNumber) - (b.startAsNumber));

    this.holders.abilityAvailability.removeForAbility(it.id);
    let prev: AbilityUsageMap = null;
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
        return new AbilityAvailabilityMap(
          this.idgen.getNextId(M.EntryType.AbilityAvailability),
          it,
          {
            start: start,
            end: new Date(c.startAsNumber - it.ability.cooldown * 1000),
            available: true
          });
      }
      return null;
    }).filter(i => i != null);
    return maps;
  }
}
