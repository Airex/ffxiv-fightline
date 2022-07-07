import { Command, ICommandExecutionContext, ICommandData } from "../UndoRedo";
import { Utils } from "../Utils";
import { AbilityUsageMap, JobMap } from "../Maps/index";
import { IAddAbilityParams } from "./Commands";
import { AddAbilityCommand } from "./AddAbilityCommand";


export class AddBatchUsagesCommand extends Command {

  constructor(private commands: AddAbilityCommand[]) {
    super();
  }

  reverse(context: ICommandExecutionContext): void {
    const items = this.commands.map(it => {
      const params = it.serialize().params as IAddAbilityParams;
      return params.id;
    });

    context.holders.itemUsages.remove(items);
  }

  execute(context: ICommandExecutionContext): void {
    const items = this.commands.map(it => {
      const params = it.serialize().params as IAddAbilityParams;
      let jobMap: JobMap;
      if (params.jobActor) {
        jobMap = context.holders.jobs.getByActor(params.jobActor);
      }
      else {
        jobMap = context.holders.jobs.get(params.jobGroup);
      }

      const abilityMap = context.holders.abilities.getByParentAndAbility(jobMap.id, params.abilityName);

      const item = new AbilityUsageMap(context.presenter, params.id,
        abilityMap,
        params.settings,
        {
          start: Utils.getDateFromOffset(params.time),
          loaded: params.loaded,
          showLoaded: context.highlightLoaded(),
          ogcdAsPoints: context.ogcdAttacksAsPoints(abilityMap.ability)
        });
      return item;
    });

    context.holders.itemUsages.addRange(items);
  }

  serialize(): ICommandData {
    return {
      name: "useAbilityBatch",
      params: {
        commands: this.commands.map(it => it.serialize().params)
      }
    };
  }
}
