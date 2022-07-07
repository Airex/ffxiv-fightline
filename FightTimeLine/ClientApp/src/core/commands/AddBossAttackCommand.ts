import { Command, ICommandExecutionContext, ICommandData } from "../UndoRedo";
import { IBossAbility } from "../Models";
import { Utils } from "../Utils";
import { BossAttackMap } from "../Maps/index";


export class AddBossAttackCommand extends Command {

  constructor(private id: string, private bossAbility: IBossAbility) {
    super();
  }

  serialize(): ICommandData {
    return {
      name: "addBossAttack",
      params: {
        id: this.id,
        attack: this.bossAbility
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    context.holders.bossAttacks.remove([this.id]);
    context.update({ updateBossTargets: true, updateIntersectedWithBossAttackAtDate: Utils.getDateFromOffset(this.bossAbility.offset) });
  }

  execute(context: ICommandExecutionContext): void {
    context.holders.bossAttacks.add(new BossAttackMap(
      context.presenter,
      this.id,
      {
        attack: this.bossAbility,
        vertical: context.verticalBossAttacks()
      }
    ));
    context.addTags(this.bossAbility.tags);
    context.addSources(this.bossAbility.source);
    context.update({
      updateBossAttacks: [this.id],
      updateBossTargets: true,
      updateIntersectedWithBossAttackAtDate: Utils.getDateFromOffset(this.bossAbility.offset)
    });
  }
}
