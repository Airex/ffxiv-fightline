import { Command, ICommandExecutionContext, ICommandData } from "../UndoRedo";


export class ChangeDowntimeColorCommand extends Command {

  private prevColor: string;


  constructor(private id: string, private newColor: string) {
    super();
  }

  serialize(): ICommandData {

    return {
      name: "changeDowntimeColor",
      params: {
        id: this.id,
        newColor: this.newColor
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    const value = context.holders.bossDownTime.get(this.id);

    value.applyData({
      color: this.prevColor
    });

    context.holders.bossDownTime.update([value]);


    context.update({ updateDowntimeMarkers: true });
  }

  execute(context: ICommandExecutionContext): void {
    const value = context.holders.bossDownTime.get(this.id);

    this.prevColor = value.color;
    value.applyData({
      color: this.newColor
    });

    context.holders.bossDownTime.update([value]);

    context.update({ updateDowntimeMarkers: true });
  }
}
