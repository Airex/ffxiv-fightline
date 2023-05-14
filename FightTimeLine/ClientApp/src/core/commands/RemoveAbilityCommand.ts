import { Command, ICommandExecutionContext, ICommandData } from "../UndoRedo";
import { IAbility } from "../Models";
import { AbilityUsageMap } from "../Maps/index";
import { calculateDuration } from "../Durations/functions";

export class RemoveAbilityCommand extends Command {

  private ability: IAbility;
  private time: Date;
  private abilityMapId: string;
  private loaded: boolean;
  private settings: any[];

  constructor(private id: string, private updateBossAttack: boolean) {
    super();
  }

  serialize(): ICommandData {
    return {
      name: "removeAbility",
      params: {
        id: this.id,
        updateBossAttack: this.updateBossAttack
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    const amap = context.holders.abilities.get(this.abilityMapId);

    context.holders.itemUsages.add(new AbilityUsageMap(context.presenter, this.id, amap, this.settings,
      {
        start: this.time,
        loaded: this.loaded,
        showLoaded: context.highlightLoaded(),
        ogcdAsPoints: context.ogcdAttacksAsPoints(this.ability)
      }));
    context.update({
      abilityChanged: amap,
      updateBossAttacks: context.holders.bossAttacks.getAffectedAttacks(
        this.time as Date,
        calculateDuration(this.ability))
    });
  }

  execute(context: ICommandExecutionContext): void {

    const item = context.holders.itemUsages.get(this.id);
    this.ability = item.ability.ability;
    this.abilityMapId = item.ability.id;
    this.time = item.start;
    this.loaded = item.loaded;
    this.settings = item.settings;
    context.holders.itemUsages.remove([this.id]);
    context.update({
      abilityChanged: item.ability,
      updateBossAttacks: context.holders.bossAttacks.getAffectedAttacks(item.start as Date, item.calculatedDuration)
    });
  }
}
