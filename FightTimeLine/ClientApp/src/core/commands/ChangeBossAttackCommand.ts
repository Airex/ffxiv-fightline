import { Command, ICommandExecutionContext, ICommandData } from "../UndoRedo";
import { IBossAbility } from "../Models";
import { BossAttackMap } from "../Maps/index";


export class ChangeBossAttackCommand extends Command {
  private prevDatas: string;

  constructor(private id: string, private bossAbility: IBossAbility, private updateAllWithSameName: boolean) {
    super();
  }

  serialize(): ICommandData {
    return {
      name: "changeBossAttack",
      params: {
        id: this.id,
        attack: this.bossAbility,
        updateAllWithSameName: this.updateAllWithSameName
      }
    };
  }

  reverse(context: ICommandExecutionContext): void {
    const pbossAttackMaps = JSON.parse(this.prevDatas) as BossAttackMap[];

    const prevData = context.holders.bossAttacks.get(this.id);
    const bossAttackMaps = this.updateAllWithSameName
      ? context.holders.bossAttacks.getByName(prevData.attack.name)
      : [prevData];

    bossAttackMaps.forEach((it) => {
      const data = { attack: pbossAttackMaps.find(v => v.id === it.id).attack };
      it.applyData(data);
    });

    context.holders.bossAttacks.update(bossAttackMaps);
    context.update({ updateBossAttacks: [this.id], updateBossTargets: true });
  }

  execute(context: ICommandExecutionContext): void {
    const prevData = context.holders.bossAttacks.get(this.id);
    const bossAttackMaps = this.updateAllWithSameName ? context.holders.bossAttacks.getByName(prevData.attack.name) : [prevData];
    this.prevDatas = JSON.stringify(bossAttackMaps.filter(v => !!v).map(v => {
      return { id: v.id, attack: v.attack };
    }));

    bossAttackMaps.forEach((it) => {
      if (it) {
        if (it.id === this.id) {
          it.applyData({ attack: this.bossAbility });
        }
        else {
          it.applyData({
            attack: {
              ...this.bossAbility,
              fflogsAttackSource: it.attack.fflogsAttackSource,
              fflogsData: it.attack.fflogsData,
              offset: it.attack.offset
            }
          });
        }

        context.addTags(this.bossAbility.tags);
        context.addSources(this.bossAbility.source);
      }
    });

    context.holders.bossAttacks.update(bossAttackMaps);
    context.update({ updateBossAttacks: [this.id], updateBossTargets: true });
  }
}
