import { Command, ICommandExecutionContext, ICommandData } from "../UndoRedo";
import { AbilityUsageMap, JobMap } from "../Maps/index";
import { IAbilityWithUsages } from "./Commands";


export class RemoveJobCommand extends Command {
  private storedData: { abilityMaps?: IAbilityWithUsages[]; jobMap?: JobMap; wasBossTarget?: boolean; } = {};

  constructor(private id: string) {
    super();
  }

  serialize(): ICommandData {
    return {
      name: "removeJob",
      params: {
        id: this.id
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {

    const abilityMaps = this.storedData.abilityMaps;
    const jobMap = this.storedData.jobMap as JobMap;
    context.holders.jobs.add(jobMap);

    abilityMaps.forEach((it: IAbilityWithUsages) => {
      it.map.applyData({});
      context.holders.abilities.add(it.map);
      it.usages.forEach((x) => {
        context.holders.itemUsages.add(new AbilityUsageMap(context.presenter, x.id, it.map, x.settings,
          {
            start: x.start,
            loaded: x.loaded,
            showLoaded: context.highlightLoaded(),
            ogcdAsPoints: context.ogcdAttacksAsPoints(it.map.ability),
          }));
      });
    });

    if (this.storedData.wasBossTarget) {
      context.holders.bossTargets.initialBossTarget = jobMap.id;
    }

    context.update({ updateBossAttacks: true, updateBossTargets: true });
  }

  execute(context: ICommandExecutionContext): void {
    const abilitiesToStore: Array<IAbilityWithUsages> = [];
    const abilities = context.holders.abilities.getByParentId(this.id);
    const job = context.holders.jobs.get(this.id);

    for (const ab of abilities) {

      const abs = context.holders.itemUsages.getByAbility(ab.id);
      abilitiesToStore.push({
        map: ab,
        usages: abs
      } as IAbilityWithUsages);

      context.holders.itemUsages.remove(abs.map(value => value.id));
      context.holders.abilities.remove([ab.id]);
    }

    this.storedData.abilityMaps = abilitiesToStore;
    this.storedData.jobMap = job;

    context.holders.jobs.remove([this.id]);

    if (context.holders.bossTargets.initialBossTarget === this.id) {
      this.storedData.wasBossTarget = true;
      context.holders.bossTargets.initialBossTarget = "boss";
    }

    context.update({ updateBossAttacks: true, updateBossTargets: true });

  }
}
