import { Command, ICommandExecutionContext, ICommandData } from "../UndoRedo";
import { Utils } from "../Utils";


export class ChangeDowntimeCommand extends Command {

  private prevStartDate: Date;
  private prevEndDate: Date;

  constructor(private id: string, private start: Date, private end: Date) {
    super();
  }

  serialize(): ICommandData {

    return {
      name: "changeDowntime",
      params: {
        id: this.id,
        start: Utils.formatTime(this.start),
        end: Utils.formatTime(this.end)
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    const value = context.holders.bossDownTime.get(this.id);

    value.applyData({ start: this.prevStartDate, end: this.prevEndDate });

    context.holders.bossDownTime.update([value]);

    context.update({ updateDowntimeMarkers: true });
  }

  execute(context: ICommandExecutionContext): void {
    const value = context.holders.bossDownTime.get(this.id);

    this.prevStartDate = value.start;
    this.prevEndDate = value.end;

    value.applyData({ start: this.start, end: this.end });

    context.holders.bossDownTime.update([value]);

    context.update({ updateDowntimeMarkers: true });
  }
}
