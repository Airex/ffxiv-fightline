import { Command } from "../UndoRedo"
import * as M from "../Models"
import * as S from "../../services/SettingsService"
import { Utils } from "../Utils"
import { AddAbilityCommand, AddBossAttackCommand, AddBatchUsagesCommand, AddBatchAttacksCommand } from "../Commands"
import * as FF from "../FFLogs"
import * as Jobregistryserviceinterface from "../../services/jobregistry.service-interface";
import * as Parser from "../Parser";
import * as Generators from "../Generators";


export interface IFFLogsCollector {
  collect(data: FF.Event): void;
  process(): void;
}

export interface ICollectorContext {
  parser: Parser.Parser;
  jobRegistry: Jobregistryserviceinterface.IJobRegistryService;
  commands: Command[];
  settings: S.ISettings;
  idgen: Generators.IdGenerator
}

export abstract class BaseCollector implements IFFLogsCollector {

  constructor(protected context: ICollectorContext) {

  }

  abstract collect(data: FF.AbilityEvent): void;
  abstract process(): void;
}

export class AbilityUsagesCollector extends BaseCollector {

  private commands: AddAbilityCommand[] = [];
  jobs: { [name: string]: M.IJob } = {};

  detectAbility(job: M.IJob, event: any): { offset: number, name: string } {
    const data = job.abilities.map(a => a.detectStrategy.process(event)).filter(a => !!a);
    if (data.length > 1)
      throw Error("More then 1 ability");
    return data[0];
  }

  public getSettingOfType(ability: M.IAbility, type: string): M.IAbilitySetting {
    return ability.settings && ability.settings.find(it => it.type === type);
  }

  collect(data: FF.AbilityEvent): void {

    const foundJob = this.context.parser.players.find(it1 => it1.petids.some(((it2: any) => it2 === data.sourceID)) || it1.id === data.sourceID);
    if (!foundJob) return;

    const job = this.jobs[foundJob.job] || (this.jobs[foundJob.job] = this.context.jobRegistry.getJob(foundJob.job));

    const detectedAbility = this.detectAbility(job, data);
    if (!detectedAbility) return;

    const ability = this.context.jobRegistry.getAbilityForJob(job.name, detectedAbility.name);
    if (!ability) return;

    const settingsData: M.ISettingData[] = [];

    if (ability.settings) {
      ability.settings.forEach((setting) => {
        const value = setting.process && setting.process(this.context, data);
        if (value) {
          settingsData.push({
            name: setting.name,
            value: value
          })
        }
      });
    }

    this.commands.push(new AddAbilityCommand(
      this.context.idgen.getNextId(M.EntryType.AbilityUsage),
      foundJob.actorName,
      null,
      ability.name,
      Utils.getDateFromOffset((detectedAbility.offset - this.context.parser.fight.start_time) / 1000),
      true,
      settingsData
    ));
  }

  process(): void {
    this.context.commands.push(new AddBatchUsagesCommand(this.commands));
  }
}

//export class JobPetCollector extends BaseCollector {
//  
//  collect(data: FF.AbilityEvent): void {
//    if (data.sourceIsFriendly) {
//      const foundJob = jobs.find(it1 => it1.id.some(((it2: any) => it2 === data.sourceID) as any));
//      if (foundJob) {
//        const jobMap = this.jobsMapHolder.getByName(foundJob.job, foundJob.actorName);
//        if (!jobMap.pet && jobMap.job.pets && jobMap.job.pets.length > 0) {
//          const peta = jobMap.job.abilities.find(
//            am => (am.abilityType & M.AbilityType.Pet) === M.AbilityType.Pet && am.name === data.ability.name);
//          if (peta) {
//            jobMap.pet = peta.pet;
//          }
//        }
//      }
//    }
//  }
//
//  process(): void { }
//}

//export class StancesCollector extends BaseCollector {
//
//  private stances: { [id: string]: Array<any> } = {};
//  constructor(private jobsMapHolder: JobsMapHolder, private commandStorage: Command[], private idgen: IdGenerator, private startDate: Date) {
//
//  }
//
//  collect(data: FF.AbilityEvent, jobs: FF.IJobInfo[], startTime: number): void {
//    if (data.sourceIsFriendly) {
//      const foundJob = jobs.find(it1 => it1.id.some(((it2: any) => it2 === data.sourceID) as any));
//      if (foundJob) {
//        const jobMap = this.jobsMapHolder.getByName(foundJob.job, foundJob.actorName);
//        if ((data.type === "applybuff" || data.type === "removebuff") && jobMap.job.stances && jobMap.job.stances.length > 0) {
//          const stance = jobMap.job.stances.find((x) => x.ability.name === data.ability.name);
//          if (stance) {
//            let g = this.stances[jobMap.id];
//            if (!g) {
//              this.stances[jobMap.id] = new Array<any>();
//              g = this.stances[jobMap.id];
//            }
//            g.push(data);
//          }
//        }
//      }
//    }
//  }
//
//  process(startTime: number): void {
//    Object.keys(this.stances).forEach((k: string) => {
//      const cmp = (a: any, b: any) =>  a - b; ;
//      const eventToNmber = (a: string) => {
//        if (a === "removebuff") return -1;
//        return 1;
//      };
//
//      const arr = this.stances[k].sort((a, b) => cmp(a.timestamp, b.timestamp) || cmp(eventToNmber(a.type), eventToNmber(b.type)));
//      let start: Date = this.startDate;
//      let ability: string = null;
//      for (var v of arr) {
//        if (v.type === "applybuff") {
//          start = Utils.getDateFromOffset((v.timestamp - startTime) / 1000, this.startDate);
//          ability = v.ability.name;
//        } else {
//          this.commandStorage.push(new AddStanceCommand(this.idgen.getNextId(M.EntryType.StanceUsage), k, ability || v.ability.name, start, Utils.getDateFromOffset((v.timestamp - startTime) / 1000, this.startDate), true));
//          start = this.startDate;
//        }
//      }
//      if (start !== this.startDate) {
//        this.commandStorage.push(new AddStanceCommand(this.idgen.getNextId(M.EntryType.StanceUsage), k, ability, start, new Date(this.startDate.valueOf() + 30 * 60 * 1000), true));
//      }
//    });
//  }
//}

export class BossAttacksCollector extends BaseCollector {

  private bossAttacks: { [id: string]: Array<FF.AbilityEvent> } = {};

  collect(data: FF.AbilityEvent): void {
    if (data.type !== this.context.settings.fflogsImport.bossAttacksSource) return;
    if (data.sourceIsFriendly) return;

    const key = data.ability.name + "_" + Math.trunc(data.timestamp / 1000);
    let g = this.bossAttacks[key];
    if (!g) {
      this.bossAttacks[key] = []
      g = this.bossAttacks[key];
    }
    g.push(data);
  }

  process(): void {
    const tbs = Object.keys(this.bossAttacks).map(it => this.bossAttacks[it]).filter((arr) => {
      return arr.find(it => {
        if (FF.isDamageEvent(it)) {
          return (it.amount + it.blocked > 0.6 * it.targetResources.maxHitPoints) &&
            arr.length <= 2;
        }
        return false;
      });
    }).filter(a => !!a).map(it => it[0].ability.name);

    const commands: AddBossAttackCommand[] = [];

    Object.keys(this.bossAttacks).forEach((k: string) => {
      const arr = this.bossAttacks[k];
      const ability = arr.find((it) => it.ability &&
        it.ability.name.toLowerCase() !== "attack" &&
        it.ability.name.trim() !== "" &&
        it.ability.name.indexOf("Unknown_") < 0);
      if (ability) {
        const date = Utils.getDateFromOffset((ability.timestamp - this.context.parser.fight.start_time) / 1000);
        const tags: string[] = [];
        if (arr.length > 0) tags.push(M.DefaultTags[1])
        if (tbs.indexOf(ability.ability.name) >= 0) tags.push(M.DefaultTags[0])

        commands.push(new AddBossAttackCommand(
          this.context.idgen.getNextId(M.EntryType.BossAttack),
          {
            name: ability.ability.name,
            type: this.getAbilityType(ability),
            offset: Utils.formatTime(date),
            tags: tags,
            source: ability.source && ability.source.name
          }));
      }
    });

    this.context.commands.push(new AddBatchAttacksCommand(commands));
  }

  private getAbilityType(ability: FF.AbilityEvent): M.DamageType {
    return ability.ability.type === FF.AbilityType.PHYSICAL_DIRECT
      ? M.DamageType.Physical
      : (ability.ability.type === FF.AbilityType.MAGICAL_DIRECT 
        ? M.DamageType.Magical 
        : M.DamageType.None);
  }
}
