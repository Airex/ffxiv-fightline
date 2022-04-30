import * as _ from "lodash";

import * as FFLogs from "./FFLogs";
import * as Jobregistryserviceinterface from "../services/jobregistry.service-interface";
import * as FFLogsCollectors from "./FflogsCollectors/FFLogsCollectors";
import { IJobInfo } from "./Models";

export class Parser {
  public players: IJobInfo[];
  public fight: FFLogs.Fight;
  public events: FFLogs.BaseEventFields[];

  constructor(private instance: number, private rawFight: FFLogs.ReportFightsResponse) {
    this.fight = this.rawFight.fights.find((it) => it.id === instance);
    this.players = this.parseJobs(this.rawFight);
  }

  private parseJobs(fight) {
    return fight.friendlies
      .filter((it) => it.fights.some(((it1) => it1.id === this.instance) as any))
      .map((it) => {
        const ji = this.mapJob(it.type);
        return {
          id: it.id,
          petids: fight.friendlyPets.filter((it1) => it1.petOwner === it.id).map((it1) => it1.id),
          job: ji?.jobName,
          actorName: it.name.substring(0, 16),
          role: ji?.order,
          guid: it.guid,
          petguids: fight.friendlyPets.filter((it1) => it1.petOwner === it.id).map((it1) => it1.guid)
        } as IJobInfo;
      })
      .filter((it) => it.job != null);
  }

  private mapJob(input: string): { jobName: string, order: number } {
    switch (input) {
      case "Bard":
        return { jobName: "BRD", order: 2 };
      case "WhiteMage":
        return { jobName: "WHM", order: 1 };
      case "Summoner":
        return { jobName: "SMN", order: 2 };
      case "Ninja":
        return { jobName: "NIN", order: 2 };
      case "Dragoon":
        return { jobName: "DRG", order: 2 };
      case "Scholar":
        return { jobName: "SCH", order: 1 };
      case "Sage":
        return { jobName: "SGE", order: 1 };
      case "Warrior":
        return { jobName: "WAR", order: 0 };
      case "DarkKnight":
        return { jobName: "DRK", order: 0 };
      case "Machinist":
        return { jobName: "MCH", order: 2 };
      case "Paladin":
        return { jobName: "PLD", order: 0 };
      case "Astrologian":
        return { jobName: "AST", order: 1 };
      case "Samurai":
        return { jobName: "SAM", order: 2 };
      case "Monk":
        return { jobName: "MNK", order: 2 };
      case "Reaper":
        return { jobName: "RPR", order: 2 };
      case "BlackMage":
        return { jobName: "BLM", order: 2 };
      case "RedMage":
        return { jobName: "RDM", order: 2 };
      case "Gunbreaker":
        return { jobName: "GNB", order: 0 };
      case "Dancer":
        return { jobName: "DNC", order: 2 };
    }
    return null;
  }

  public createFilter(jobRegistry: Jobregistryserviceinterface.IJobRegistryService, bossOnly: boolean): string {

    const enemyIds = this.rawFight.enemies.map(e => e.guid).join();

    const js = jobRegistry.getJobs().filter(j => this.players.some(j1 => j1.job === j.name));

    const abilityIds = _.uniq(_.flattenDeep(_.concat([], js.map(j => j.abilities.map(a => a.detectStrategy.deps.abilities)))))
      .filter(a => !!a)
      .join();
    const abilityByBuffIds = _.concat([], js.map(j => j.abilities.map(a => a.detectStrategy.deps.buffs)));
    const stances = _.concat([], js.map(j => j.stances && j.stances.map(a => a.ability.detectStrategy.deps.buffs)));
    const buffs = _.uniq(_.flattenDeep(_.concat(stances, abilityByBuffIds))).filter(a => !!a).join();
    const partyIds = _.concat(this.players.map(j => j.guid), _.flattenDeep(this.players.map(p => p.petguids))).join();

    const bossAutoAttacks =
      "1478,1479,1480,1481,6631,6882,6910,7319,7351,8535,8645,8938,9202,9375,9441,9442,9448,9654,9895,9908,9936,9989,10236,10237,10238,10239,10433,11070";

    if (bossOnly) {
      const result = `
    (
        type in ('cast', 'damage') and source.id in (${enemyIds})
    ) and ability.id not in (${bossAutoAttacks})`;

      return result;
    }

    const filter = `
    (
      (
        type in ('cast', 'damage') and ability.id in (${abilityIds}) and source.id in (${partyIds})
      )or(
        type in ('cast', 'damage') and source.id in (${enemyIds})
	    )or(
		    type in ('applybuff','removebuff') and ability.id in (${buffs})
	    )
    ) and ability.id not in (${bossAutoAttacks})`;

    return filter;
  }


  processCollectors(collectors: FFLogsCollectors.IFFLogsCollector[]) {
    for (const event of this.events) {
      collectors.forEach(c => {
        c.collect(event);
      });
    }
    collectors.forEach(c => {
      c.process();
    });
  }

  *iterateEvents(): IterableIterator<FFLogs.BaseEventFields> {
    const iterator = this.events[Symbol.iterator]();

    let obj;
    // eslint-disable-next-line no-cond-assign
    while (!(obj = iterator.next()).done) {
      // Iterate over the actual event first
      yield obj.value;

      // Iterate over any fabrications arising from the event and clear the queue
    }
  }

  setEvents(events: FFLogs.BaseEventFields[]) {
    this.events = events;
  }


}
