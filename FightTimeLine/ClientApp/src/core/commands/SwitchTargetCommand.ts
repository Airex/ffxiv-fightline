import { Command, ICommandExecutionContext, ICommandData } from "../UndoRedo";


export class SwitchTargetCommand extends Command {
  constructor(private prevTarget: string, private newTarget: string) {
    super();
  }

  serialize(): ICommandData {
    return {
      name: "switchTarget",
      params: {
        prevTarget: this.prevTarget,
        newTarget: this.newTarget
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    context.holders.bossTargets.initialBossTarget = this.prevTarget;
    context.update({ updateBossTargets: true });
  }

  execute(context: ICommandExecutionContext): void {
    context.holders.bossTargets.initialBossTarget = this.newTarget;
    context.update({ updateBossTargets: true });
  }
}
