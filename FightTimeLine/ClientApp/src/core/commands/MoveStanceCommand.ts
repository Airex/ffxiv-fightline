import { Command, ICommandExecutionContext, ICommandData } from "../UndoRedo";
import { Utils } from "../Utils";


export class MoveStanceCommand extends Command {
  private moveStartFrom: Date;
  private moveEndFrom: Date;

  constructor(private id: string, private moveStartTo: Date, private moveEndTo: Date) {
    super();
  }

  serialize(): ICommandData {
    return {
      name: "moveStance",
      params: {
        id: this.id,
        moveStartTo: Utils.formatTime(this.moveStartTo),
        moveEndTo: Utils.formatTime(this.moveEndTo),
      }
    };
  }


  reverse(context: ICommandExecutionContext): void {
    const item = context.holders.stances.get(this.id);
    if (item === undefined || item === null) { return; }

    if (item.start !== this.moveStartFrom || item.end !== this.moveEndFrom) {
      item.applyData({
        start: this.moveStartFrom,
        end: this.moveEndFrom
      });

      context.holders.stances.update([item]);
    }
  }

  execute(context: ICommandExecutionContext): void {
    const item = context.holders.stances.get(this.id);
    if (item === undefined || item === null) { return; }

    this.moveStartFrom = item.start;
    this.moveEndFrom = item.end;

    if (item.start !== this.moveStartTo || item.end !== this.moveEndTo) {
      item.applyData({
        start: this.moveStartTo,
        end: this.moveEndTo
      });

      context.holders.stances.update([item]);
    }
  }
}
