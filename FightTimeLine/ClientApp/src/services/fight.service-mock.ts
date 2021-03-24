import { Injectable, Inject } from "@angular/core"
import { Observable, of, empty } from "rxjs"
import { expand, take, concatMap, concat, toArray, map, delay } from "rxjs/operators"
import { IBoss, IFight, IBossSearchEntry,ISyncData, SyncOperation,ICommandEntry } from "../core/Models"
import { IFightService } from "./fight.service-interface"
import { Guid } from "guid-typescript"

@Injectable()
export class FightsMockService implements IFightService {
  newFight(fraction: string = ""): Observable<IFight> { return of({
      id: 'dummy'+Guid.create().toString().toLowerCase().replace(/-/,""),
      name: 'dummy',
      userName: 'dummy',
      data: null,
      isDraft: true,
      dateModified: new Date(),
      dateCreated: new Date(),
      game: 'ffxiv'
  }); }

  addCommand(fight: string, data): Observable<any> { 
    const ms = localStorage.getItem("fight_mock")
    const d = !!ms? JSON.parse(ms): []
    d.push({data});
    localStorage.setItem("fight_mock",JSON.stringify(d))
    return empty(); 
  }

  getCommands(fight: string, timestamp: number): Observable<ICommandEntry[]> { 
    const ms = localStorage.getItem("fight_mock")
    const d = !!ms? JSON.parse(ms): []
    return of(d);
    
  }

  getCommand(id: number): Observable<string> {
    return empty();
  }

  getBosses(reference: number, searchString: string, privateOnly: boolean): Observable<IBossSearchEntry[]> {

    const source = of(1);
    const example = source.pipe(
      //recursively call supplied function
      expand(val => {
        return of(val + 1);
      }),
      //call 5 times
      take(50),
      map(x =>
        <IBossSearchEntry>{
          id: (reference * 1000 + Number(x)).toString(),
          name: reference + " name " + x
        }),
      concat(),
      toArray(),
      delay(1000)
    );
    return example;
  }

  getBoss(id: string): Observable<IBoss> {
    return of(<IBoss>{
      id: id,
      name: "test boss",
      ref: 1,
      isPrivate: false,
      data: JSON.stringify({
        "attacks": [
          { "id": "b56b029a6-d8ba-52eb-c034-d89d022d4c6d|1", "ability": { "name": "test1", "type": 1, "isAoe": null, "isShareDamage": null, "isTankBuster": null, "offset": "09: 24", "syncSettings": JSON.stringify(
            <ISyncData>{
              offset: "00:00",
              condition: {
                operation: SyncOperation.And,
                operands: [
                  {
                    type: "name",
                    payload: {
                      name:"Flamethrower"
                    },
                    description:"nothing new"
                  }]
              }
            }) } },
          { "id": "b56b029a6 - d8ba - 52eb - c034 - d89d022d4c6d|2", "ability": { "name": "test2", "type": 2, "isAoe": null, "isShareDamage": null, "isTankBuster": null, "offset": "13: 50", "syncSettings": null } },
          { "id": "b56b029a6 - d8ba - 52eb - c034 - d89d022d4c6d|3", "ability": { "name": "test3", "type": 0, "isAoe": null, "isShareDamage": null, "isTankBuster": null, "offset": "18: 50", "syncSettings": null } }], "downTimes": []
      }),
      userName: ""
    }).pipe(delay(1000));
  }

  saveBoss(boss: IBoss): Observable<IBoss> {
    return of(boss);
  }

  getFight(id: string): Observable<IFight> {
    return of(
      { 
        id: "",
        name: "",
        userName:"",
        data:"[]",
        game: "ff"
      }
    );

  }

  removeBosses(map: any[]): Observable<any> {
    return of(null);
  }

  saveFight(fight: IFight): Observable<IFight> {
    return of(fight);
  }

  getFightsForUser(): Observable<IFight[]> {
    return of([
      <IFight>{
        id: "1",
        name: "dummy fight 1",
        data: "",
        userName: "user",
        isDraft: true,
        game:"ffxiv"
      },
      <IFight>{
        id: "2",
        name: "dummy fight 2",
        data: "",
        userName: "user",
        isDraft: true,
        game: "ffxiv"
      },
      <IFight>{
        id: "3",
        name: "dummy fight 3",
        data: "",
        userName: "user",
        isDraft: false,
        game: "ffxiv"
      },
      <IFight>{
        id: "4",
        name: "dummy fight 4",
        data: "",
        userName: "user",
        isDraft: true,
        game: "ffxiv"
      },
      <IFight>{
        id: "5",
        name: "dummy fight 5",
        data: "",
        userName: "user",
        isDraft: false,
        game: "ffxiv"
  },
      <IFight>{
        id: "6",
        name: "dummy fight 6",
        data: "",
        userName: "user",
        isDraft: true,
        game: "ffxiv"
      },
      <IFight>{
        id: "7",
        name: "dummy fight 7",
        data: "",
        userName: "user",
        isDraft: false,
        game: "ffxiv"
      },
      <IFight>{
        id: "8",
        name: "dummy fight 8",
        data: "",
        userName: "user",
        isDraft: true,
        game: "ffxiv"
      }
      , <IFight>{
        id: "9",
        name: "dummy fight 9",
        data: "",
        userName: "user",
        isDraft: false,
        game: "ffxiv"
      }
      , <IFight>{
        id: "10",
        name: "dummy fight 10",
        data: "",
        userName: "user",
        isDraft: true,
        game: "ffxiv"
      }
      , <IFight>{
        id: "11",
        name: "dummy fight 11",
        data: "",
        userName: "user",
        isDraft: true,
        game: "ffxiv"
      }

    ]);
  }

  removeFights(map: any[]): Observable<any> {
    return of(null);
  }
}
