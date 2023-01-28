import { Command, ICommandExecutionContext, ICommandData } from "../UndoRedo";
import { IJobStats } from "../Models";


export class ChangeJobStats extends Command {
  private prevData: string;

  constructor(private id: string, private newData: IJobStats) {
    super();
  }

  reverse(context: ICommandExecutionContext): void {
    const job = context.holders.jobs.get(this.id);
    job.applyData({ stats: JSON.parse(this.prevData) });
  }
  execute(context: ICommandExecutionContext): void {
    const job = context.holders.jobs.get(this.id);
    this.prevData = JSON.stringify(job.stats || {});
    job.applyData({ stats: this.newData });
  }

  serialize(): ICommandData {
    return {
      name: "changeJobStats",
      params: {
        id: this.id,
        newData: JSON.stringify(this.newData)
      }
    };
  }

}
