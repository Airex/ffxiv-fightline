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
import { IJobRegistryService } from "../../services/jobregistry.service-interface";

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
        it1.petids.some((it2) => it2 === data.sourceID) ||
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
  private attackTimestamps: { [id: string]: number } = {};

  getAttackGroup(data: FF.AbilityEvent): string {
    const key = `${data.ability.name}_${data.type}`;

    let tk = this.attackTimestamps[key] || data.timestamp;

    if (data.timestamp - tk > 1000) {
      tk = data.timestamp;
    }

    this.attackTimestamps[key] = tk;

    const keyWithTime = `${key}_${tk}`;
    return keyWithTime;
  }
  getAttackValid(data: FF.AbilityEvent): boolean {
    const ability = data.ability;
    const valid =
      ability &&
      ability.name.toLowerCase() !== "attack" &&
      ability.name.trim() !== "" &&
      ability.name.indexOf("Unknown_") < 0 &&
      ability.name.indexOf("unknown_") < 0 &&
      ability.name.indexOf("Combined DoTs") < 0 &&
      // exclude dots
      ability.type !== 1 &&
      ability.type !== 64;

    return valid;
  }

  collect(data: FF.AbilityEvent): void {
    // if (data.type !== this.context.settings.fflogsImport.bossAttacksSource) return;
    if (data.sourceIsFriendly) {
      return;
    }

    if (!this.getAttackValid(data)) return;

    // const attackGroup = data.packetID || Math.trunc(data.timestamp / 1000);

    const keyWithTime = this.getAttackGroup(data);

    this.bossAttacks[keyWithTime] = this.bossAttacks[keyWithTime] || [];
    this.bossAttacks[keyWithTime].push(data);
  }

  process(): void {
    const tbs = Object.values(this.bossAttacks)
      .filter((attacks) => {
        return attacks.some((it) => {
          if (FF.isDamageEvent(it)) {
            return (
              it.unmitigatedAmount > 0.8 * it.targetResources.maxHitPoints &&
              attacks.length <= 2
            );
          }
          return false;
        });
      })
      .map((it) => it[0].ability.name);

    const commands: AddBossAttackCommand[] = [];

    Object.values(this.bossAttacks).forEach((attacks) => {
      const attack = attacks[0];

      if (!attack) return;
      const date = Utils.getDateFromOffset(
        (attack.timestamp - this.context.parser.fight.start_time) / 1000
      );
      const tags: string[] = [];

      if (attacks.length > 2) {
        tags.push(M.DefaultTags[1]); // aoe tag
      }
      if (tbs.indexOf(attack.ability.name) >= 0) {
        tags.push(M.DefaultTags[0]); // tb tag
      }

      const fflogsData = attacks.reduce((jobs, at) => {
        if (FF.isDamageEvent(at)) {
          const foundJob = this.context.parser.players.find(
            (it1) => it1.id === at.targetID
          );
          if (foundJob) {
            jobs[foundJob.rid] = {
              amount: at.amount,
              unmitigated: at.unmitigatedAmount,
              mitigated: at.mitigated,
              absorbed: at.absorbed,
              multiplier: at.multiplier,
            };
          }
        }
        return jobs;
      }, {} as BossAttackFFlogs);

      const maxUnmitigated = attacks.reduce((max, at) => {
        if (FF.isDamageEvent(at)) {
          return Math.max(max, at.unmitigatedAmount);
        }
        return max;
      }, 0);

      commands.push(
        new AddBossAttackCommand(
          this.context.idgen.getNextId(M.EntryType.BossAttack),
          {
            name: attack.ability.name,
            type: this.getAbilityType(attack),
            offset: Utils.formatTime(date),
            tags,
            source: attack.source?.name,
            rawDamage: maxUnmitigated,
            fflogsAttackSource: attack.type === "cast" ? "cast" : "damage",
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
