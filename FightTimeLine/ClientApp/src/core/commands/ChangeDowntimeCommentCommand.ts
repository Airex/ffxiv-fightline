import { Command, ICommandExecutionContext, ICommandData } from "../UndoRedo";


export class ChangeDowntimeCommentCommand extends Command {

  private comment: string;


  constructor(private id: string, private newComment: string) {
    super();
  }

  serialize(): ICommandData {

    return {
      name: "changeDowntimeComment",
      params: {
        id: this.id,
        newComment: this.newComment
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    const value = context.holders.bossDownTime.get(this.id);

    value.applyData({
      comment: this.comment
    });

    context.holders.bossDownTime.update([value]);


    context.update({ updateDowntimeMarkers: true });
  }

  execute(context: ICommandExecutionContext): void {
    const value = context.holders.bossDownTime.get(this.id);

    this.comment = value.comment;
    value.applyData({
      comment: this.newComment
    });

    context.holders.bossDownTime.update([value]);

    context.update({ updateDowntimeMarkers: true });
  }
}
