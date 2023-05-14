import { Command, ICommandExecutionContext, ICommandData } from "../UndoRedo";
import { ISettingData, EntryType } from "../Models";
import { Utils } from "../Utils";
import { AbilityUsageMap, JobMap } from "../Maps/index";
import { calculateDuration } from "../Durations/functions";


export class AddAbilityCommand extends Command {

  constructor(
    private id: string,
    private jobActor: string,
    private jobGroup: string,
    private abilityName: string,
    private time: Date,
    private loaded: boolean,
    private settings: ISettingData[]) {
    super();
  }

  serialize(): ICommandData {
    return {
      name: "useAbility",
      params: {
        id: this.id,
        jobGroup: this.jobGroup,
        abilityName: this.abilityName,
        time: Utils.formatTime(this.time),
        loaded: this.loaded,
        jobActor: this.jobActor,
        settings: this.settings
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    const item = context.holders.itemUsages.get(this.id);
    context.holders.itemUsages.remove([this.id]);

    if (item) {
      context.update({
        abilityChanged: item.ability,
        updateBossAttacks: context.holders.bossAttacks.getAffectedAttacks(
          this.time,
          calculateDuration(item.ability.ability))
      });
    }
  }

  execute(context: ICommandExecutionContext): void {
    if (!this.id) {
      this.id = context.idGen.getNextId(EntryType.AbilityUsage);
    }
    let jobMap: JobMap;
    if (this.jobActor) {
      jobMap = context.holders.jobs.getByActor(this.jobActor);
    }
    else {
      jobMap = context.holders.jobs.get(this.jobGroup);
    }

    const abilityMap = context.holders.abilities.getByParentAndAbility(jobMap.id, this.abilityName);

    const item = new AbilityUsageMap(context.presenter, this.id,
      abilityMap,
      this.settings,
      {
        start: this.time,
        loaded: this.loaded,
        showLoaded: context.highlightLoaded(),
        ogcdAsPoints: context.ogcdAttacksAsPoints(abilityMap.ability)
      });

    if (abilityMap.ability.overlapStrategy.check({
      ability: abilityMap.ability,
      holders: context.holders,
      itemUsageId: this.id,
      jobAbilityId: abilityMap.id,
      start: item.start,
      end: item.end,
      selectionRegistry: null
    })) {
      return;
    }

    context.holders.itemUsages.add(item);

    context.update({
      abilityChanged: item.ability,
      updateBossAttacks: context.holders.bossAttacks.getAffectedAttacks(
        this.time,
        calculateDuration(abilityMap.ability))
    });
  }
}
