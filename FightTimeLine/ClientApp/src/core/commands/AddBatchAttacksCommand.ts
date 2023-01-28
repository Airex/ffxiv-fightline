import { Command, ICommandExecutionContext, ICommandData } from "../UndoRedo";
import { BossAttackMap } from "../Maps/index";
import { AddBossAttackCommand } from "./AddBossAttackCommand";
import { IAddBossAttackParams } from "./Commands";


export class AddBatchAttacksCommand extends Command {

  constructor(private commands: AddBossAttackCommand[]) {
    super();
  }

  reverse(context: ICommandExecutionContext): void {
    const items = this.commands.map(it => {
      const params = it.serialize().params as IAddBossAttackParams;
      return params.id;
    });
    context.holders.bossAttacks.remove(items);
  }

  execute(context: ICommandExecutionContext): void {
    const items = this.commands.map(it => {
      const params = it.serialize().params as IAddBossAttackParams;
      context.addTags(params.attack.tags);
      context.addSources(params.attack.source);
      return new BossAttackMap(
        context.presenter,
        params.id,
        {
          attack: params.attack,
          vertical: context.verticalBossAttacks()
        }
      );
    });

    context.holders.bossAttacks.addRange(items);
  }

  serialize(): ICommandData {
    return {
      name: "addBossAttackBatch",
      params: {
        commands: this.commands.map(it => it.serialize().params)
      }
    };
  }
}
