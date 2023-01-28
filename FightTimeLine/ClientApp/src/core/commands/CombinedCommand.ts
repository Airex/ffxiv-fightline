import { Command, ICommandExecutionContext, ICommandData } from "../UndoRedo";


export class CombinedCommand extends Command {
  serialize(): ICommandData {
    return {
      name: "combined",
      params: {
        commands: this.actions.map((it) => it.serialize())
      }
    };
  }

  constructor(private actions: Command[]) {
    super();
  }

  reverse(context: ICommandExecutionContext): void {
    [...this.actions].reverse().forEach((it: Command) => it.reverse(context));
  }

  execute(context: ICommandExecutionContext): void {
    this.actions.forEach((it: Command) => it.execute(context));
  }

}
