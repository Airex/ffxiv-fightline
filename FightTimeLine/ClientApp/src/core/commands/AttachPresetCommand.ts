import { Command, ICommandExecutionContext, ICommandData } from "../UndoRedo";
import { IPresetTemplate } from "../Models";


export class AttachPresetCommand extends Command {
  constructor(private id: string, private preset: IPresetTemplate) {
    super();
  }

  serialize(): ICommandData {
    return {
      name: "attachPreset",
      params: {
        id: this.id,
        preset: this.preset
      }
    };
  }

  get undoredo(): boolean {
    return false;
  }

  reverse(context: ICommandExecutionContext): void {
  }

  execute(context: ICommandExecutionContext): void {
    context.presenter.addPreset(this.id, this.preset);
  }
}
