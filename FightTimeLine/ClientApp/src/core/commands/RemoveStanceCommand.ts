import { Command, ICommandExecutionContext, ICommandData } from "../UndoRedo";
import { IAbility } from "../Models";
import { JobStanceMap } from "../Maps/index";


export class RemoveStanceCommand extends Command {

  private ability: IAbility;
  private start: Date;
  private end: Date;
  private abilityMapId: string;
  private loaded: boolean;

  constructor(private id: string, private updateBossAttack: boolean) {
    super();
  }

  serialize(): ICommandData {
    return {
      name: "removeStance",
      params: {
        id: this.id,
        updateBossAttack: this.updateBossAttack,
        loaded: this.loaded
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    const abMap = context.holders.abilities.get(this.abilityMapId);
    context.holders.stances.add(new JobStanceMap(context.presenter, this.id, abMap, this.ability,
      {
        start: this.start,
        end: this.end,
        loaded: this.loaded,
        showLoaded: context.highlightLoaded()
      }));
  }

  execute(context: ICommandExecutionContext): void {
    const itemMap = context.holders.stances.get(this.id);

    this.ability = itemMap.stanceAbility;
    this.start = itemMap.start;
    this.end = itemMap.end;
    this.abilityMapId = itemMap.ability.id;
    this.loaded = itemMap.loaded;

    context.holders.stances.remove([this.id]);
  }
}
