import { Command, ICommandExecutionContext, ICommandData } from "../UndoRedo";
import { BossDownTimeMap } from "../Maps/index";


export class RemoveDownTimeCommand extends Command {
  private data: { start: Date; startId: string; end: Date; endId: string; };
  private prevColor: string;
  constructor(private id: string) {
    super();
  }

  serialize(): ICommandData {
    return {
      name: "removeDowntime",
      params: {
        id: this.id
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    context.holders.bossDownTime.add(new BossDownTimeMap(context.presenter, this.id, this.data.startId, this.data.endId,
      {
        start: this.data.start,
        end: this.data.end,
        color: this.prevColor
      }));

    context.update({ updateDowntimeMarkers: true });
  }

  execute(context: ICommandExecutionContext): void {
    const item = context.holders.bossDownTime.get(this.id);
    this.data = { start: item.start, startId: item.startId, end: item.end, endId: item.endId };
    this.prevColor = item.color;
    context.holders.bossDownTime.remove([this.id]);

    context.update({ updateDowntimeMarkers: true });
  }
}
