import { Command } from "../UndoRedo";
import * as M from "../Models";
import * as S from "../../services/SettingsService";
import { Utils } from "../Utils";
import { AddAbilityCommand } from "../commands/AddAbilityCommand";
import { AddBatchUsagesCommand } from "../commands/AddBatchUsagesCommand";
import { AddBatchAttacksCommand } from "../commands/AddBatchAttacksCommand";
import { AddBossAttackCommand } from "../commands/AddBossAttackCommand";
import * as FF from "../FFLogs";
import * as Parser from "../Parser";
import * as Generators from "../Generators";
import { BossAttackFFlogs } from "../Models";
import { IJobRegistryService } from "src/services/jobregistry.service-interface";

export interface IFFLogsCollector {
  collect(data: FF.BaseEventFields): void;
  process(): void;
}

export interface ICollectorContext {
  parser: Parser.Parser;
  jobRegistry: IJobRegistryService;
  commands: Command[];
  settings: S.ISettings;
  idgen: Generators.IdGenerator;
}

export abstract class BaseCollector implements IFFLogsCollector {
  constructor(protected context: ICollectorContext) {}

  abstract collect(data: FF.AbilityEvent): void;
  abstract process(): void;
}

export class AbilityUsagesCollector extends BaseCollector {
  private commands: AddAbilityCommand[] = [];
  jobs: { [name: string]: M.IJob } = {};

  detectAbility(job: M.IJob, event: any): { offset: number; name: string } {
    const data = Object.values(job.abilities)
      .map((a) => a.detectStrategy?.process(event))
      .filter((a) => !!a);
    if (data.length > 1) {
      throw Error("More then 1 ability");
    }
    return data[0];
  }

  public getSettingOfType(
    ability: M.IAbility,
    type: string
  ): M.IAbilitySetting {
    return ability.settings?.find((it) => it.type === type);
  }

  collect(data: FF.AbilityEvent): void {
    if (!data.sourceIsFriendly) {
      return;
    }

    const foundJob = this.context.parser.players.find(
      (it1) =>
        it1.petids.some((it2: any) => it2 === data.sourceID) ||
        it1.id === data.sourceID
    );
    if (!foundJob) {
      return;
    }

    const job =
      this.jobs[foundJob.job] ||
      (this.jobs[foundJob.job] = this.context.jobRegistry.getJob(foundJob.job));

    const detectedAbility = this.detectAbility(job, data);
    if (!detectedAbility) {
      return;
    }

    const ability = this.context.jobRegistry.getAbilityForJob(
      job.name,
      detectedAbility.name
    );
    if (!ability) {
      return;
    }

    const settingsData: M.ISettingData[] = [];

    if (ability.settings) {
      ability.settings.forEach((setting) => {
        const value = setting.process && setting.process(this.context, data);
        if (value) {
          settingsData.push({
            name: setting.name,
            value,
          });
        }
      });
    }

    this.commands.push(
      new AddAbilityCommand(
        this.context.idgen.getNextId(M.EntryType.AbilityUsage),
        foundJob.actorName,
        null,
        ability.name,
        Utils.getDateFromOffset(
          (detectedAbility.offset - this.context.parser.fight.start_time) / 1000
        ),
        true,
        settingsData
      )
    );
  }

  process(): void {
    this.context.commands.push(new AddBatchUsagesCommand(this.commands));
  }
}

export class BossAttacksCollector extends BaseCollector {
  private bossAttacks: { [id: string]: Array<FF.AbilityEvent> } = {};

  collect(data: FF.AbilityEvent): void {
    // if (data.type !== this.context.settings.fflogsImport.bossAttacksSource) return;
    if (data.sourceIsFriendly) {
      return;
    }

    const ability = data.ability;
    const valid =
      ability &&
      ability.name.toLowerCase() !== "attack" &&
      ability.name.trim() !== "" &&
      ability.name.indexOf("Unknown_") < 0 &&
      ability.name.indexOf("unknown_") < 0 &&
      ability.name.indexOf("Combined DoTs") < 0;

    if (!valid) return;

    const time = Math.trunc(data.timestamp / 1000);
    const key = `${data.ability.name}_${data.type}_${time}`;

    let g = this.bossAttacks[key];
    if (!g) {
      this.bossAttacks[key] = [];
      g = this.bossAttacks[key];
    }
    g.push(data);
  }

  process(): void {
    const tbs = Object.keys(this.bossAttacks)
      .map((it) => this.bossAttacks[it])
      .filter((arr) => {
        return arr.find((it) => {
          if (FF.isDamageEvent(it)) {
            return (
              it.amount + it.blocked > 0.6 * it.targetResources.maxHitPoints &&
              arr.length <= 2
            );
          }
          return false;
        });
      })
      .filter((a) => !!a)
      .map((it) => it[0].ability.name);

    const commands: AddBossAttackCommand[] = [];

    Object.keys(this.bossAttacks).forEach((k: string) => {
      const attack = this.bossAttacks[k];
      const ability = attack[0];

      if (!ability) return;
      const date = Utils.getDateFromOffset(
        (ability.timestamp - this.context.parser.fight.start_time) / 1000
      );
      const tags: string[] = [];

      if (attack.length > 2) {
        tags.push(M.DefaultTags[1]);
      }
      if (tbs.indexOf(ability.ability.name) >= 0) {
        tags.push(M.DefaultTags[0]);
      }

      const fflogsData: BossAttackFFlogs = {};
      attack.forEach((at) => {
        if (FF.isDamageEvent(at)) {
          const foundJob = this.context.parser.players.find(
            (it1) => it1.id === at.targetID
          );
          if (!foundJob) {
            return;
          }

          fflogsData[foundJob.rid] = {
            amount: at.amount,
            unmitigated: at.unmitigatedAmount,
            mitigated: at.mitigated,
            absorbed: at.absorbed,
            multiplier: at.multiplier,
          };
        }
      });

      commands.push(
        new AddBossAttackCommand(
          this.context.idgen.getNextId(M.EntryType.BossAttack),
          {
            name: ability.ability.name,
            type: this.getAbilityType(ability),
            offset: Utils.formatTime(date),
            tags,
            source: ability.source?.name,
            fflogsAttackSource: ability.type === "cast" ? "cast" : "damage",
            fflogsData,
          }
        )
      );
    });

    this.context.commands.push(new AddBatchAttacksCommand(commands));
  }

  private getAbilityType(event: FF.AbilityEvent): M.DamageType {
    switch (event.ability.type) {
      case FF.AbilityType.PHYSICAL_DIRECT:
        return M.DamageType.Physical;
      case FF.AbilityType.MAGICAL_DIRECT:
        return M.DamageType.Magical;
      default:
        return M.DamageType.None;
    }
  }
}
