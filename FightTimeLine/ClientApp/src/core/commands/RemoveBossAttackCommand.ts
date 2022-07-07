import { Command, ICommandExecutionContext, ICommandData } from "../UndoRedo";
import { IBossAbility } from "../Models";
import { Utils } from "../Utils";
import { BossAttackMap } from "../Maps/index";


export class RemoveBossAttackCommand extends Command {
  private bossAbility: IBossAbility;
  constructor(private id: string, private updateAttacks: boolean) {
    super();
  }

  serialize(): ICommandData {
    return {
      name: "removeBossAttack",
      params: {
        id: this.id,
        updateAttacks: this.updateAttacks
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    context.holders.bossAttacks.add(new BossAttackMap(
      context.presenter,
      this.id,
      {
        attack: this.bossAbility,
        vertical: context.verticalBossAttacks()
      }));

    context.update({
      updateBossAttacks: [this.id],
      updateIntersectedWithBossAttackAtDate: Utils.getDateFromOffset(this.bossAbility.offset)
    });
  }

  execute(context: ICommandExecutionContext): void {
    const map = context.holders.bossAttacks.get(this.id);
    this.bossAbility = map.attack;
    context.holders.bossAttacks.remove([this.id]);
    context.update({ updateIntersectedWithBossAttackAtDate: Utils.getDateFromOffset(this.bossAbility.offset), updateBossTargets: true });
  }
}
