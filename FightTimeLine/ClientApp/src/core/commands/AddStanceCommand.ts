import { Command, ICommandExecutionContext, ICommandData } from "../UndoRedo";
import { Utils } from "../Utils";
import { JobStanceMap } from "../Maps/index";


export class AddStanceCommand extends Command {

  constructor(
    private id: string,
    private jobGroup: string,
    private abilityName: string,
    private start: Date,
    private end: Date,
    private loaded: boolean) {
    super();
  }

  reverse(context: ICommandExecutionContext): void {
    context.holders.stances.remove([this.id]);
  }

  execute(context: ICommandExecutionContext): void {
    const jobmap = context.holders.jobs.get(this.jobGroup);
    const stancesAbility = context.holders.abilities.getStancesAbility(this.jobGroup);
    const ability = jobmap.job.stances.find((it) => it.ability.name === this.abilityName).ability;

    context.holders.stances.add(new JobStanceMap(context.presenter, this.id, stancesAbility, ability,
      {
        start: this.start,
        end: this.end,
        loaded: this.loaded,
        showLoaded: context.highlightLoaded()
      }));
  }

  serialize(): ICommandData {
    return {
      name: "addStance",
      params: {
        id: this.id,
        jobGroup: this.jobGroup,
        abilityName: this.abilityName,
        start: Utils.formatTime(this.start),
        end: Utils.formatTime(this.end),
      }
    };
  }
}
