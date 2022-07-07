import { Command, ICommandExecutionContext, ICommandData } from "../UndoRedo";
import { IAbility } from "../Models";
import { Utils } from "../Utils";
import { calculateDuration } from "../Durations";


export class MoveCommand extends Command {
  private moveFrom: Date;
  private ability: IAbility;

  constructor(private id: string, private moveTo: Date) {
    super();
  }

  serialize(): ICommandData {
    return {
      name: "moveAbility",
      params: {
        id: this.id,
        moveTo: Utils.formatTime(this.moveTo)
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    const item = context.holders.itemUsages.get(this.id);
    if (item === undefined || item === null) { return; }

    const duration = calculateDuration(this.ability);
    const affectedAttacks = [
      ...context.holders.bossAttacks.getAffectedAttacks(item.start as Date, duration),
      ...context.holders.bossAttacks.getAffectedAttacks(this.moveTo as Date, duration)
    ];

    if (item.start !== this.moveFrom) {
      item.applyData({
        start: this.moveFrom,
      });

      context.holders.itemUsages.update([item]);
    }

    context.update({
      abilityChanged: context.holders.itemUsages.get(this.id).ability,
      updateBossAttacks: affectedAttacks
    });
  }

  execute(context: ICommandExecutionContext): void {
    const item = context.holders.itemUsages.get(this.id);
    if (item === undefined || item === null) { return; }

    this.moveFrom = item.start;
    this.ability = context.holders.itemUsages.get(this.id).ability.ability;
    //    console.log(`Moving to ${this.moveTo.toString()} from ${this.moveFrom.toString()}`);
    const duration = calculateDuration(this.ability);
    const affectedAttacks = [
      ...context.holders.bossAttacks.getAffectedAttacks(item.start as Date, duration),
      ...context.holders.bossAttacks.getAffectedAttacks(this.moveTo as Date, duration)
    ];
    if (item.start !== this.moveTo) {
      item.applyData({
        start: this.moveTo
      });
      context.holders.itemUsages.update([item]);
    }

    context.update({
      abilityChanged: item.ability,
      updateBossAttacks: affectedAttacks
    });
  }
}
