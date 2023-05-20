import { Injectable } from "@angular/core";
import { Observable, of, EMPTY } from "rxjs";
import { expand, take, concat, toArray, map, delay } from "rxjs/operators";
import {
  IBoss,
  IFight,
  IBossSearchEntry,
  ISyncData,
  SyncOperation,
  ICommandEntry,
} from "../../core/Models";
import { IFightService } from "./fight.service-interface";

@Injectable()
export class FightsMockService implements IFightService {
  newFight(fraction: string = ""): Observable<IFight> {
    return of({
      id: "dummy", // +Guid.create().toString().toLowerCase().replace(/-/,""),
      name: "dummy",
      userName: "dummy",
      data: null,
      isDraft: true,
      dateModified: new Date(),
      dateCreated: new Date(),
      game: "ffxiv",
    });
  }

  addCommand(fight: string, data): Observable<any> {
    const ms = localStorage.getItem("fight_mock");
    const d = !!ms ? JSON.parse(ms) : [];
    d.push({ data });
    localStorage.setItem("fight_mock", JSON.stringify(d));
    return EMPTY;
  }

  getCommands(fight: string, timestamp: number): Observable<ICommandEntry[]> {
    const ms = localStorage.getItem("fight_mock");
    // const d = !!ms? JSON.parse(ms): []
    // return of([]);
    const d = [
      {
        userName: "anonymous",
        fight: "3eff65a9fabc4db1a47e250dfb6ed4e9",
        data: '{"name":"combined","params":{"commands":[{"name":"addJob","params":{"id":"j6df19054-60cc-9920-e9bf-47d913373536|1","jobName":"WAR","prevBossTarget":"boss","doUpdates":true,"pet":null}},{"name":"changeJobStats","params":{"id":"j6df19054-60cc-9920-e9bf-47d913373536|1","newData":"{\\"attackMagicPotency\\":2900,\\"weaponDamage\\":126,\\"criticalHit\\":0,\\"determination\\":1806,\\"tenacity\\":615,\\"directHit\\":0,\\"hp\\":102637}"}}]}}',
        timestamp: "2023-05-02T22:32:47.266165+00:00",
      },
      {
        userName: "anonymous",
        fight: "3eff65a9fabc4db1a47e250dfb6ed4e9",
        data: '{"name":"addBossAttack","params":{"id":"b6df19054-60cc-9920-e9bf-47d913373536|3","attack":{"offset":"02:58","name":"sdfsdfsdf","type":0,"source":null,"description":null,"tags":null,"rawDamage":null,"color":null,"syncSettings":null}}}',
        timestamp: "2023-05-02T22:32:49.874985+00:00",
      },
      {
        userName: "anonymous",
        fight: "3eff65a9fabc4db1a47e250dfb6ed4e9",
        data: '{"name":"changeBossAttack","params":{"id":"b6df19054-60cc-9920-e9bf-47d913373536|3","attack":{"offset":"02:58","name":"sdfsdfsdf","type":0,"source":null,"description":null,"tags":null,"rawDamage":105000,"color":null,"syncSettings":null},"updateAllWithSameName":false}}',
        timestamp: "2023-05-02T22:33:04.848574+00:00",
      },
      {
        userName: "anonymous",
        fight: "3eff65a9fabc4db1a47e250dfb6ed4e9",
        data: '{"name":"useAbility","params":{"id":"u6df19054-60cc-9920-e9bf-47d913373536|6","jobGroup":"j6df19054-60cc-9920-e9bf-47d913373536|1","abilityName":"Reprisal","time":"02:50","loaded":false,"jobActor":null,"settings":null}}',
        timestamp: "2023-05-02T22:33:22.992551+00:00",
      },
      {
        userName: "anonymous",
        fight: "3eff65a9fabc4db1a47e250dfb6ed4e9",
        data: '{"name":"combined","params":{"commands":[{"name":"moveAbility","params":{"id":"u6df19054-60cc-9920-e9bf-47d913373536|6","moveTo":"02:55"}}]}}',
        timestamp: "2023-05-02T22:33:27.701555+00:00",
      },
      {
        userName: "anonymous",
        fight: "3eff65a9fabc4db1a47e250dfb6ed4e9",
        data: '{"name":"useAbility","params":{"id":"u6df19054-60cc-9920-e9bf-47d913373536|11","jobGroup":"j6df19054-60cc-9920-e9bf-47d913373536|1","abilityName":"Bloodwhetting","time":"02:53","loaded":false,"jobActor":null,"settings":null}}',
        timestamp: "2023-05-02T22:33:35.275995+00:00",
      },
      {
        userName: "anonymous",
        fight: "3eff65a9fabc4db1a47e250dfb6ed4e9",
        data: '{"name":"combined","params":{"commands":[{"name":"moveAbility","params":{"id":"u6df19054-60cc-9920-e9bf-47d913373536|11","moveTo":"02:56"}}]}}',
        timestamp: "2023-05-02T22:33:42.237225+00:00",
      },
      {
        userName: "anonymous",
        fight: "3eff65a9fabc4db1a47e250dfb6ed4e9",
        data: '{"name":"combined","params":{"commands":[{"name":"moveAbility","params":{"id":"u6df19054-60cc-9920-e9bf-47d913373536|6","moveTo":"03:11"}}]}}',
        timestamp: "2023-05-02T22:34:53.666922+00:00",
      },
      {
        userName: "anonymous",
        fight: "3eff65a9fabc4db1a47e250dfb6ed4e9",
        data: '{"name":"combined","params":{"commands":[{"name":"moveAbility","params":{"id":"u6df19054-60cc-9920-e9bf-47d913373536|11","moveTo":"02:50"}}]}}',
        timestamp: "2023-05-02T22:48:19.462529+00:00",
      },
    ];
    return of(d);
  }

  getCommand(id: number): Observable<string> {
    return EMPTY;
  }

  getBosses(
    reference: number,
    searchString: string,
    privateOnly: boolean
  ): Observable<IBossSearchEntry[]> {
    const source = of(1);
    const example = source.pipe(
      // recursively call supplied function
      expand((val) => {
        return of(val + 1);
      }),
      // call 5 times
      take(50),
      map(
        (x) =>
          ({
            id: (reference * 1000 + Number(x)).toString(),
            name: reference + " name " + x,
          } as IBossSearchEntry)
      ),
      concat(),
      toArray(),
      delay(1000)
    );
    return example;
  }

  getBoss(id: string): Observable<IBoss> {
    return of({
      id,
      name: "test boss",
      ref: 1,
      isPrivate: false,
      data: JSON.stringify({
        attacks: [
          {
            id: "b56b029a6-d8ba-52eb-c034-d89d022d4c6d|1",
            ability: {
              name: "test1",
              type: 1,
              isAoe: null,
              isShareDamage: null,
              isTankBuster: null,
              offset: "09: 24",
              syncSettings: JSON.stringify({
                offset: "00:00",
                condition: {
                  operation: SyncOperation.And,
                  operands: [
                    {
                      type: "name",
                      payload: {
                        name: "Flamethrower",
                      },
                      description: "nothing new",
                    },
                  ],
                },
              } as ISyncData),
            },
          },
          {
            id: "b56b029a6 - d8ba - 52eb - c034 - d89d022d4c6d|2",
            ability: {
              name: "test2",
              type: 2,
              isAoe: null,
              isShareDamage: null,
              isTankBuster: null,
              offset: "13: 50",
              syncSettings: null,
            },
          },
          {
            id: "b56b029a6 - d8ba - 52eb - c034 - d89d022d4c6d|3",
            ability: {
              name: "test3",
              type: 0,
              isAoe: null,
              isShareDamage: null,
              isTankBuster: null,
              offset: "18: 50",
              syncSettings: null,
            },
          },
        ],
        downTimes: [],
      }),
      userName: "",
    } as IBoss).pipe(delay(1000));
  }

  saveBoss(boss: IBoss): Observable<IBoss> {
    return of(boss);
  }

  getFight(id: string): Observable<IFight> {
    return of({
      id: "",
      name: "",
      userName: "",
      data: "{}",
      game: "ff",
    });
  }

  removeBosses(_: any[]): Observable<any> {
    return of(null);
  }

  saveFight(fight: IFight): Observable<IFight> {
    return of(fight);
  }

  getFightsForUser(): Observable<IFight[]> {
    return of([
      {
        id: "1",
        name: "dummy fight 1",
        data: "",
        userName: "user",
        isDraft: true,
        game: "ffxiv",
      } as IFight,
      {
        id: "2",
        name: "dummy fight 2",
        data: "",
        userName: "user",
        isDraft: true,
        game: "ffxiv",
      } as IFight,
      {
        id: "3",
        name: "dummy fight 3",
        data: "",
        userName: "user",
        isDraft: false,
        game: "ffxiv",
      } as IFight,
      {
        id: "4",
        name: "dummy fight 4",
        data: "",
        userName: "user",
        isDraft: true,
        game: "ffxiv",
      } as IFight,
      {
        id: "5",
        name: "dummy fight 5",
        data: "",
        userName: "user",
        isDraft: false,
        game: "ffxiv",
      } as IFight,
      {
        id: "6",
        name: "dummy fight 6",
        data: "",
        userName: "user",
        isDraft: true,
        game: "ffxiv",
      } as IFight,
      {
        id: "7",
        name: "dummy fight 7",
        data: "",
        userName: "user",
        isDraft: false,
        game: "ffxiv",
      } as IFight,
      {
        id: "8",
        name: "dummy fight 8",
        data: "",
        userName: "user",
        isDraft: true,
        game: "ffxiv",
      } as IFight,
      {
        id: "9",
        name: "dummy fight 9",
        data: "",
        userName: "user",
        isDraft: false,
        game: "ffxiv",
      } as IFight,
      {
        id: "10",
        name: "dummy fight 10",
        data: "",
        userName: "user",
        isDraft: true,
        game: "ffxiv",
      } as IFight,
      {
        id: "11",
        name: "dummy fight 11",
        data: "",
        userName: "user",
        isDraft: true,
        game: "ffxiv",
      } as IFight,
    ]);
  }

  removeFights(_: any[]): Observable<any> {
    return of(null);
  }
}
