import { Injectable, Inject } from "@angular/core"
import { Observable, of, empty } from "rxjs"
import { expand, take, concatMap, concat, toArray, map, delay } from "rxjs/operators"
import { IBoss, IFight, IBossSearchEntry, ISyncData, SyncOperation, ICommandEntry } from "../core/Models"
import { IFightService } from "./fight.service-interface"
import { Guid } from "guid-typescript"

@Injectable()
export class FightsMockService implements IFightService {
   newFight(fraction: string = ""): Observable<IFight> {
      return of({
         id: 'dummy',//+Guid.create().toString().toLowerCase().replace(/-/,""),
         name: 'dummy',
         userName: 'dummy',
         data: null,
         isDraft: true,
         dateModified: new Date(),
         dateCreated: new Date(),
         game: 'ffxiv'
      });
   }

   addCommand(fight: string, data): Observable<any> {
      const ms = localStorage.getItem("fight_mock")
      const d = !!ms ? JSON.parse(ms) : []
      d.push({ data });
      localStorage.setItem("fight_mock", JSON.stringify(d))
      return empty();
   }

   getCommands(fight: string, timestamp: number): Observable<ICommandEntry[]> {
      const ms = localStorage.getItem("fight_mock")
      // const d = !!ms? JSON.parse(ms): []
      return of([]);
      // const d = [
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addJob\",\"params\":{\"id\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|5\",\"jobName\":\"WHM\",\"prevBossTarget\":\"j5847ca4a-de0f-e352-2d89-e47a44252184|582\",\"doUpdates\":true,\"pet\":null}}",
      //       "timestamp": "2021-11-18T13:39:14.803685+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addJob\",\"params\":{\"id\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|7\",\"jobName\":\"AST\",\"prevBossTarget\":\"j5847ca4a-de0f-e352-2d89-e47a44252184|582\",\"doUpdates\":true,\"pet\":null}}",
      //       "timestamp": "2021-11-18T13:39:16.047567+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addJob\",\"params\":{\"id\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|9\",\"jobName\":\"DRG\",\"prevBossTarget\":\"j5847ca4a-de0f-e352-2d89-e47a44252184|582\",\"doUpdates\":true,\"pet\":null}}",
      //       "timestamp": "2021-11-18T13:39:17.167239+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addJob\",\"params\":{\"id\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|11\",\"jobName\":\"MNK\",\"prevBossTarget\":\"j5847ca4a-de0f-e352-2d89-e47a44252184|582\",\"doUpdates\":true,\"pet\":null}}",
      //       "timestamp": "2021-11-18T13:39:18.254103+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addJob\",\"params\":{\"id\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|13\",\"jobName\":\"MCH\",\"prevBossTarget\":\"j5847ca4a-de0f-e352-2d89-e47a44252184|582\",\"doUpdates\":true,\"pet\":null}}",
      //       "timestamp": "2021-11-18T13:39:19.765342+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addJob\",\"params\":{\"id\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|15\",\"jobName\":\"RDM\",\"prevBossTarget\":\"j5847ca4a-de0f-e352-2d89-e47a44252184|582\",\"doUpdates\":true,\"pet\":null}}",
      //       "timestamp": "2021-11-18T13:39:20.878184+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|17\",\"attack\":{\"offset\":\"00:10\",\"name\":\"Cleaver\",\"type\":1,\"source\":\"Voidwalker\",\"description\":\"Clock\",\"tags\":[\"AoE\"],\"syncSettings\":null}}}",
      //       "timestamp": "2021-11-18T13:42:23.58597+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|19\",\"attack\":{\"offset\":\"02:54\",\"name\":\"Cleaver\",\"type\":1,\"source\":\"Voidwalker\",\"description\":\"Clock\",\"tags\":[\"AoE\"],\"syncSettings\":null}}}",
      //       "timestamp": "2021-11-18T13:43:07.404435+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|21\",\"attack\":{\"offset\":\"04:45\",\"name\":\"Cleaver\",\"type\":1,\"source\":\"Voidwalker\",\"description\":\"Clock\\n\",\"tags\":[\"AoE\"],\"syncSettings\":null}}}",
      //       "timestamp": "2021-11-18T13:43:37.32042+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|23\",\"attack\":{\"offset\":\"07:34\",\"name\":\"Cleaver\",\"type\":1,\"source\":\"Voidwalker\",\"description\":\"Clock\",\"tags\":[\"AoE\"],\"syncSettings\":null}}}",
      //       "timestamp": "2021-11-18T13:47:00.868517+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|25\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|11\",\"abilityName\":\"Feint\",\"time\":\"00:09\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T13:47:12.174149+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|26\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|11\",\"abilityName\":\"Feint\",\"time\":\"02:54\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T13:47:21.729579+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|27\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|11\",\"abilityName\":\"Feint\",\"time\":\"04:44\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T13:47:24.11363+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|28\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|11\",\"abilityName\":\"Feint\",\"time\":\"07:33\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T13:47:26.576952+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|29\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|9\",\"abilityName\":\"Feint\",\"time\":\"00:00\",\"loaded\":false,\"jobActor\":null,\"settings\":null}},{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|30\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|9\",\"abilityName\":\"Feint\",\"time\":\"01:30\",\"loaded\":false,\"jobActor\":null,\"settings\":null}},{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|31\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|9\",\"abilityName\":\"Feint\",\"time\":\"03:00\",\"loaded\":false,\"jobActor\":null,\"settings\":null}},{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|32\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|9\",\"abilityName\":\"Feint\",\"time\":\"04:30\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}]}}",
      //       "timestamp": "2021-11-18T13:47:33.813581+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|33\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|9\",\"abilityName\":\"Feint\",\"time\":\"06:00\",\"loaded\":false,\"jobActor\":null,\"settings\":null}},{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|34\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|9\",\"abilityName\":\"Feint\",\"time\":\"07:30\",\"loaded\":false,\"jobActor\":null,\"settings\":null}},{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|35\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|9\",\"abilityName\":\"Feint\",\"time\":\"09:00\",\"loaded\":false,\"jobActor\":null,\"settings\":null}},{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|36\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|9\",\"abilityName\":\"Feint\",\"time\":\"10:30\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}]}}",
      //       "timestamp": "2021-11-18T13:47:39.691375+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|37\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|9\",\"abilityName\":\"Feint\",\"time\":\"12:00\",\"loaded\":false,\"jobActor\":null,\"settings\":null}},{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|38\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|9\",\"abilityName\":\"Feint\",\"time\":\"13:30\",\"loaded\":false,\"jobActor\":null,\"settings\":null}},{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|39\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|9\",\"abilityName\":\"Feint\",\"time\":\"15:00\",\"loaded\":false,\"jobActor\":null,\"settings\":null}},{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|40\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|9\",\"abilityName\":\"Feint\",\"time\":\"16:30\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}]}}",
      //       "timestamp": "2021-11-18T13:47:42.400107+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|41\",\"attack\":{\"offset\":\"01:45\",\"name\":\"Unholy Darkness\",\"type\":2,\"source\":\"Spell In Waiting\",\"description\":\"Stack Marker\",\"tags\":[\"Share Damage\"],\"syncSettings\":null}}}",
      //       "timestamp": "2021-11-18T13:50:12.631234+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|43\",\"attack\":{\"offset\":\"06:26\",\"name\":\"Unholy Darkness\",\"type\":2,\"source\":\"Spell-In-Waiting\",\"description\":\"Stack\",\"tags\":[\"Share Damage\"],\"syncSettings\":null}}}",
      //       "timestamp": "2021-11-18T13:50:36.02687+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|45\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|5\",\"abilityName\":\"Benediction\",\"time\":\"09:07\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T14:00:34.937112+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|45\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T14:00:41.380444+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|46\",\"attack\":{\"offset\":\"06:20\",\"name\":\"Flare\",\"type\":2,\"source\":\"Spell-In-Waiting\",\"description\":\"Fall-off\",\"tags\":[\"AoE\"],\"syncSettings\":null}}}",
      //       "timestamp": "2021-11-18T14:01:13.037557+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|48\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|3\",\"abilityName\":\"Vengeance\",\"time\":\"07:03\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T14:04:31.837476+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|48\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T14:04:33.60967+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|49\",\"attack\":{\"offset\":\"07:09\",\"name\":\"Flare\",\"type\":2,\"source\":\"Spell-In-Waiting\",\"description\":\"Falloff\",\"tags\":[\"AoE\"],\"syncSettings\":null}}}",
      //       "timestamp": "2021-11-18T14:04:47.355982+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|51\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|3\",\"abilityName\":\"Vengeance\",\"time\":\"02:06\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T14:06:01.23099+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|51\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T14:06:03.509227+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|52\",\"attack\":{\"offset\":\"02:05\",\"name\":\"Entropy\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"AoE\"],\"syncSettings\":null}}}",
      //       "timestamp": "2021-11-18T14:06:18.595121+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttackBatch\",\"params\":{\"commands\":[{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|54\",\"attack\":{\"offset\":\"03:58\",\"name\":\"Entropy\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"AoE\"],\"syncSettings\":null}}]}}",
      //       "timestamp": "2021-11-18T14:06:39.254237+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttackBatch\",\"params\":{\"commands\":[{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|55\",\"attack\":{\"offset\":\"05:02\",\"name\":\"Entropy\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"AoE\"],\"syncSettings\":null}}]}}",
      //       "timestamp": "2021-11-18T14:06:43.449568+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttackBatch\",\"params\":{\"commands\":[{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|56\",\"attack\":{\"offset\":\"05:48\",\"name\":\"Entropy\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"AoE\"],\"syncSettings\":null}}]}}",
      //       "timestamp": "2021-11-18T14:06:44.073863+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|54\",\"attack\":{\"offset\":\"03:15\",\"name\":\"Entropy\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"AoE\"],\"syncSettings\":null},\"updateAllWithSameName\":false}}]}}",
      //       "timestamp": "2021-11-18T14:06:54.868634+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|52\",\"attack\":{\"offset\":\"02:12\",\"name\":\"Entropy\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"AoE\"],\"syncSettings\":null},\"updateAllWithSameName\":false}}]}}",
      //       "timestamp": "2021-11-18T14:07:08.201198+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|54\",\"attack\":{\"offset\":\"03:22\",\"name\":\"Entropy\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"AoE\"],\"syncSettings\":null},\"updateAllWithSameName\":false}}]}}",
      //       "timestamp": "2021-11-18T14:07:13.791203+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|55\",\"attack\":{\"offset\":\"04:32\",\"name\":\"Entropy\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"AoE\"],\"syncSettings\":null},\"updateAllWithSameName\":false}}]}}",
      //       "timestamp": "2021-11-18T14:07:20.118771+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|56\",\"attack\":{\"offset\":\"05:41\",\"name\":\"Entropy\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"AoE\"],\"syncSettings\":null},\"updateAllWithSameName\":false}}]}}",
      //       "timestamp": "2021-11-18T14:07:28.058669+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|62\",\"attack\":{\"offset\":\"02:00\",\"name\":\"Shadowflame\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"Tank Buster\"],\"syncSettings\":null}}}",
      //       "timestamp": "2021-11-18T14:08:00.36535+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttackBatch\",\"params\":{\"commands\":[{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|64\",\"attack\":{\"offset\":\"03:38\",\"name\":\"Shadowflame\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"Tank Buster\"],\"syncSettings\":null}}]}}",
      //       "timestamp": "2021-11-18T14:08:03.279074+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttackBatch\",\"params\":{\"commands\":[{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|65\",\"attack\":{\"offset\":\"04:47\",\"name\":\"Shadowflame\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"Tank Buster\"],\"syncSettings\":null}}]}}",
      //       "timestamp": "2021-11-18T14:08:04.679005+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttackBatch\",\"params\":{\"commands\":[{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|66\",\"attack\":{\"offset\":\"05:30\",\"name\":\"Shadowflame\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"Tank Buster\"],\"syncSettings\":null}}]}}",
      //       "timestamp": "2021-11-18T14:08:05.90527+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttackBatch\",\"params\":{\"commands\":[{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|67\",\"attack\":{\"offset\":\"05:48\",\"name\":\"Shadowflame\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"Tank Buster\"],\"syncSettings\":null}}]}}",
      //       "timestamp": "2021-11-18T14:08:07.256272+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttackBatch\",\"params\":{\"commands\":[{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|68\",\"attack\":{\"offset\":\"06:54\",\"name\":\"Shadowflame\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"Tank Buster\"],\"syncSettings\":null}}]}}",
      //       "timestamp": "2021-11-18T14:08:07.97203+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttackBatch\",\"params\":{\"commands\":[{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|69\",\"attack\":{\"offset\":\"08:00\",\"name\":\"Shadowflame\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"Tank Buster\"],\"syncSettings\":null}}]}}",
      //       "timestamp": "2021-11-18T14:08:08.670474+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|64\",\"attack\":{\"offset\":\"03:10\",\"name\":\"Shadowflame\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"Tank Buster\"],\"syncSettings\":null},\"updateAllWithSameName\":false}}]}}",
      //       "timestamp": "2021-11-18T14:08:19.095914+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|65\",\"attack\":{\"offset\":\"04:19\",\"name\":\"Shadowflame\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"Tank Buster\"],\"syncSettings\":null},\"updateAllWithSameName\":false}}]}}",
      //       "timestamp": "2021-11-18T14:08:27.174884+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|66\",\"attack\":{\"offset\":\"05:29\",\"name\":\"Shadowflame\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"Tank Buster\"],\"syncSettings\":null},\"updateAllWithSameName\":false}}]}}",
      //       "timestamp": "2021-11-18T14:08:35.001348+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|68\",\"attack\":{\"offset\":\"06:39\",\"name\":\"Shadowflame\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"Tank Buster\"],\"syncSettings\":null},\"updateAllWithSameName\":false}}]}}",
      //       "timestamp": "2021-11-18T14:08:41.513839+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|69\",\"attack\":{\"offset\":\"07:49\",\"name\":\"Shadowflame\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"Tank Buster\"],\"syncSettings\":null},\"updateAllWithSameName\":false}}]}}",
      //       "timestamp": "2021-11-18T14:08:50.574482+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|66\",\"attack\":{\"offset\":\"05:29\",\"name\":\"Shadowflame\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"Tank Buster\"],\"syncSettings\":null},\"updateAllWithSameName\":false}}]}}",
      //       "timestamp": "2021-11-18T14:09:01.006621+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|26\",\"moveTo\":\"02:51\"}}]}}",
      //       "timestamp": "2021-11-18T14:12:50.759034+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|25\",\"moveTo\":\"00:09\"}}]}}",
      //       "timestamp": "2021-11-18T14:13:13.131778+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|25\",\"moveTo\":\"00:04\"}}]}}",
      //       "timestamp": "2021-11-18T14:13:19.570394+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|27\",\"moveTo\":\"04:39\"}}]}}",
      //       "timestamp": "2021-11-18T14:13:28.297489+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|21\",\"attack\":{\"offset\":\"04:45\",\"name\":\"Cleaver\",\"type\":1,\"source\":\"Voidwalker\",\"description\":\"Clock\\n\",\"tags\":[],\"syncSettings\":null},\"updateAllWithSameName\":true}}]}}",
      //       "timestamp": "2021-11-18T14:13:46.867568+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|21\",\"attack\":{\"offset\":\"04:45\",\"name\":\"Cleaver\",\"type\":1,\"source\":\"Voidwalker\",\"description\":\"Clock\\n\",\"tags\":[\"Split\"],\"syncSettings\":null},\"updateAllWithSameName\":true}}]}}",
      //       "timestamp": "2021-11-18T14:14:03.261714+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|64\",\"attack\":{\"offset\":\"03:10\",\"name\":\"Shadowflame\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"Tank Buster\"],\"syncSettings\":null},\"updateAllWithSameName\":false}}]}}",
      //       "timestamp": "2021-11-18T14:15:22.529449+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|83\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|11\",\"abilityName\":\"Feint\",\"time\":\"09:03\",\"loaded\":false,\"jobActor\":null,\"settings\":null}},{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|84\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|11\",\"abilityName\":\"Feint\",\"time\":\"10:33\",\"loaded\":false,\"jobActor\":null,\"settings\":null}},{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|85\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|11\",\"abilityName\":\"Feint\",\"time\":\"12:03\",\"loaded\":false,\"jobActor\":null,\"settings\":null}},{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|86\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|11\",\"abilityName\":\"Feint\",\"time\":\"13:33\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}]}}",
      //       "timestamp": "2021-11-18T14:17:24.785241+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|83\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T14:17:28.996822+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|84\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T14:17:30.273826+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|85\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T14:17:30.959718+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|86\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T14:17:32.345801+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|35\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T14:17:33.547682+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|36\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T14:17:34.015783+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[]}}",
      //       "timestamp": "2021-11-18T14:17:34.047182+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|37\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T14:17:35.077418+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|38\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T14:17:35.445791+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|34\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T14:17:36.420223+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|25\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T14:18:32.85605+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|26\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T14:18:33.591961+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|27\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T14:18:34.238789+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|28\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T14:18:35.167202+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|87\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|11\",\"abilityName\":\"Feint\",\"time\":\"00:04\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T14:18:45.518852+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|87\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T14:19:03.213621+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|88\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|11\",\"abilityName\":\"Feint\",\"time\":\"00:07\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T14:19:41.021799+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|89\",\"attack\":{\"offset\":\"00:24\",\"name\":\"Unholy Darkness\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"Share Damage\"],\"syncSettings\":null}}}",
      //       "timestamp": "2021-11-18T14:21:05.74936+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|91\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|1\",\"abilityName\":\"Intervention\",\"time\":\"05:04\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T14:21:51.642225+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|91\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T14:21:55.088515+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|92\",\"attack\":{\"offset\":\"04:54\",\"name\":\"Unholy Darkness\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":null,\"syncSettings\":null}}}",
      //       "timestamp": "2021-11-18T14:22:06.857509+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|92\",\"attack\":{\"offset\":\"04:54\",\"name\":\"Unholy Darkness\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"Share Damage\"],\"syncSettings\":null},\"updateAllWithSameName\":false}}]}}",
      //       "timestamp": "2021-11-18T14:22:40.682859+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|95\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|11\",\"abilityName\":\"Feint\",\"time\":\"02:50\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T14:22:44.234749+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|96\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|11\",\"abilityName\":\"Feint\",\"time\":\"04:42\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T14:22:46.974057+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|96\",\"moveTo\":\"04:38\"}}]}}",
      //       "timestamp": "2021-11-18T14:23:01.344637+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|97\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|11\",\"abilityName\":\"Feint\",\"time\":\"07:27\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T14:23:03.774748+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|97\",\"moveTo\":\"07:31\"}}]}}",
      //       "timestamp": "2021-11-18T14:23:21.101312+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|97\",\"moveTo\":\"07:27\"}}]}}",
      //       "timestamp": "2021-11-18T14:23:25.015421+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|97\",\"moveTo\":\"07:31\"}}]}}",
      //       "timestamp": "2021-11-18T14:23:33.466532+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|46\",\"attack\":{\"offset\":\"06:20\",\"name\":\"Flare\",\"type\":2,\"source\":\"Spell-In-Waiting\",\"description\":\"Fall-off\",\"tags\":[\"Fall-Off RaidWide\"],\"syncSettings\":null},\"updateAllWithSameName\":true}}]}}",
      //       "timestamp": "2021-11-18T14:24:15.513578+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|99\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|3\",\"abilityName\":\"Shake It Off\",\"time\":\"09:21\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T14:24:27.72519+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|99\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T14:24:29.074988+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|100\",\"attack\":{\"offset\":\"08:19\",\"name\":\"Quietus\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"Raidwide\"],\"syncSettings\":null}}}",
      //       "timestamp": "2021-11-18T14:24:50.847209+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|56\",\"attack\":{\"offset\":\"05:41\",\"name\":\"Entropy\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"Raidwide\"],\"syncSettings\":null},\"updateAllWithSameName\":true}}]}}",
      //       "timestamp": "2021-11-18T14:24:55.925184+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|55\",\"attack\":{\"offset\":\"04:32\",\"name\":\"Entropy\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"Raidwide\"],\"syncSettings\":null},\"updateAllWithSameName\":false}}]}}",
      //       "timestamp": "2021-11-18T14:25:01.679554+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|104\",\"attack\":{\"offset\":\"09:18\",\"name\":\"Quietus\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"Raidwide\"],\"syncSettings\":null}}}",
      //       "timestamp": "2021-11-18T14:25:17.851119+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|106\",\"attack\":{\"offset\":\"09:53\",\"name\":\"Quietus\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"Raidwide\"],\"syncSettings\":null}}}",
      //       "timestamp": "2021-11-18T14:25:37.593323+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|108\",\"attack\":{\"offset\":\"10:02\",\"name\":\"Quietus\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"Raidwide\"],\"syncSettings\":null}}}",
      //       "timestamp": "2021-11-18T14:25:52.887601+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|110\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|7\",\"abilityName\":\"Collective Unconscious\",\"time\":\"06:16\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T14:28:55.905562+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|110\",\"moveTo\":\"06:14\"}}]}}",
      //       "timestamp": "2021-11-18T14:29:19.063156+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|111\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|5\",\"abilityName\":\"Temperance\",\"time\":\"06:53\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T14:29:31.81379+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|111\",\"moveTo\":\"06:49\"}}]}}",
      //       "timestamp": "2021-11-18T14:29:35.67447+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|112\",\"attack\":{\"offset\":\"01:34\",\"name\":\"Dark Fire 3\",\"type\":2,\"source\":\"Spell-In-Waiting\",\"description\":null,\"tags\":[\"AoE\"],\"syncSettings\":null}}}",
      //       "timestamp": "2021-11-18T14:30:10.250073+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|46\",\"attack\":{\"offset\":\"06:20\",\"name\":\"Flare\",\"type\":2,\"source\":\"Spell-In-Waiting\",\"description\":\"Fall-off\",\"tags\":[\"Fall-Off RaidWide\"],\"syncSettings\":null},\"updateAllWithSameName\":false}}]}}",
      //       "timestamp": "2021-11-18T14:30:13.002269+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|115\",\"attack\":{\"offset\":\"07:16\",\"name\":\"Dark Fire 3\",\"type\":2,\"source\":\"Spell-In-Waiting\",\"description\":null,\"tags\":[\"AoE\"],\"syncSettings\":null}}}",
      //       "timestamp": "2021-11-18T14:30:47.536+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|111\",\"moveTo\":\"07:02\"}}]}}",
      //       "timestamp": "2021-11-18T14:30:52.371906+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|117\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|13\",\"abilityName\":\"Tactician\",\"time\":\"06:17\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T14:31:18.836052+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|117\",\"moveTo\":\"06:17\"}}]}}",
      //       "timestamp": "2021-11-18T14:31:23.609423+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|117\",\"moveTo\":\"06:14\"}}]}}",
      //       "timestamp": "2021-11-18T14:31:50.236333+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|118\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|5\",\"abilityName\":\"Temperance\",\"time\":\"01:30\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T14:34:05.528184+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|118\",\"moveTo\":\"01:27\"}}]}}",
      //       "timestamp": "2021-11-18T14:34:13.13572+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|119\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|7\",\"abilityName\":\"Celestial Opposition\",\"time\":\"06:15\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T14:34:47.996613+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|120\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|7\",\"abilityName\":\"Neutral Sect\",\"time\":\"06:14\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T14:34:53.529494+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|119\",\"moveTo\":\"06:21\"}}]}}",
      //       "timestamp": "2021-11-18T14:35:07.037268+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|121\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|7\",\"abilityName\":\"Lightspeed\",\"time\":\"06:17\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T14:35:16.372036+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|122\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|5\",\"abilityName\":\"Asylum\",\"time\":\"07:06\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:46:37.863419+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|123\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|15\",\"abilityName\":\"Addle\",\"time\":\"06:59\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:47:28.211461+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|123\",\"moveTo\":\"07:06\"}}]}}",
      //       "timestamp": "2021-11-18T16:47:37.871878+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|124\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|3\",\"abilityName\":\"Reprisal\",\"time\":\"06:18\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:49:37.993175+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|125\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|1\",\"abilityName\":\"Reprisal\",\"time\":\"07:05\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:49:45.22397+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|125\",\"moveTo\":\"07:07\"}}]}}",
      //       "timestamp": "2021-11-18T16:49:49.373355+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|126\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|1\",\"abilityName\":\"Passage of Arms\",\"time\":\"01:41\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:50:51.213292+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|126\",\"moveTo\":\"01:42\"}}]}}",
      //       "timestamp": "2021-11-18T16:50:59.477281+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|127\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|5\",\"abilityName\":\"Temperance\",\"time\":\"04:48\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:51:12.300987+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|128\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|7\",\"abilityName\":\"Collective Unconscious\",\"time\":\"02:07\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:51:33.982718+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|128\",\"moveTo\":\"01:57\"}}]}}",
      //       "timestamp": "2021-11-18T16:51:40.312038+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|129\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|7\",\"abilityName\":\"Celestial Opposition\",\"time\":\"02:05\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:51:46.222246+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|129\",\"moveTo\":\"02:03\"}}]}}",
      //       "timestamp": "2021-11-18T16:51:50.359208+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|130\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|7\",\"abilityName\":\"Collective Unconscious\",\"time\":\"03:09\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:51:57.170663+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|130\",\"moveTo\":\"03:07\"}}]}}",
      //       "timestamp": "2021-11-18T16:52:04.484127+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|131\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|7\",\"abilityName\":\"Collective Unconscious\",\"time\":\"04:15\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:52:07.894484+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|132\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|5\",\"abilityName\":\"Asylum\",\"time\":\"09:04\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:52:15.096371+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|132\",\"moveTo\":\"08:50\"}}]}}",
      //       "timestamp": "2021-11-18T16:52:20.893146+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|132\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T16:52:21.510562+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|133\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|1\",\"abilityName\":\"Reprisal\",\"time\":\"01:56\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:53:02.497132+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|133\",\"moveTo\":\"02:07\"}}]}}",
      //       "timestamp": "2021-11-18T16:53:04.983872+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"switchTarget\",\"params\":{\"prevTarget\":\"j5847ca4a-de0f-e352-2d89-e47a44252184|582\",\"newTarget\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|3\"}}",
      //       "timestamp": "2021-11-18T16:53:06.763912+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|135\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|3\",\"abilityName\":\"Reprisal\",\"time\":\"01:57\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:53:10.929865+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|136\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|1\",\"abilityName\":\"Shirk\",\"time\":\"01:40\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:53:12.555357+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|136\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T16:53:15.245369+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|137\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|3\",\"abilityName\":\"Reprisal\",\"time\":\"03:06\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:53:20.828359+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|138\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|1\",\"abilityName\":\"Reprisal\",\"time\":\"03:18\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:53:22.236249+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|138\",\"moveTo\":\"03:17\"}}]}}",
      //       "timestamp": "2021-11-18T16:53:24.321371+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|139\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|3\",\"abilityName\":\"Reprisal\",\"time\":\"04:14\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:53:26.075184+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|140\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|1\",\"abilityName\":\"Reprisal\",\"time\":\"04:26\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:53:27.835445+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|141\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|1\",\"abilityName\":\"Reprisal\",\"time\":\"05:38\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:53:34.706291+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|142\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|1\",\"abilityName\":\"Shirk\",\"time\":\"03:47\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:54:45.364047+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|142\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T16:54:47.795185+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|143\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|11\",\"abilityName\":\"Riddle of Earth\",\"time\":\"06:18\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:55:54.99057+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|143\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T16:55:58.617457+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|144\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|11\",\"abilityName\":\"Riddle of Earth\",\"time\":\"06:14\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:56:00.523784+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|145\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|11\",\"abilityName\":\"Riddle of Earth\",\"time\":\"06:31\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:56:01.181038+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|146\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|11\",\"abilityName\":\"Riddle of Earth\",\"time\":\"06:25\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:56:01.929206+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|147\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|11\",\"abilityName\":\"Riddle of Earth\",\"time\":\"06:39\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:56:02.519727+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|148\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|11\",\"abilityName\":\"Riddle of Earth\",\"time\":\"06:33\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:56:03.137451+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|149\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|11\",\"abilityName\":\"Riddle of Earth\",\"time\":\"06:36\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:56:03.689882+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|147\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T16:56:06.61324+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|149\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T16:56:07.561598+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|148\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T16:56:07.950398+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|145\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T16:56:09.049018+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|146\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T16:56:09.350153+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|144\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T16:56:09.974745+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|150\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|11\",\"abilityName\":\"Mantra\",\"time\":\"06:20\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:56:11.428628+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|150\",\"moveTo\":\"06:17\"}}]}}",
      //       "timestamp": "2021-11-18T16:56:14.188105+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|151\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|3\",\"abilityName\":\"Shake It Off\",\"time\":\"01:58\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:58:26.064269+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|151\",\"moveTo\":\"02:05\"}}]}}",
      //       "timestamp": "2021-11-18T16:58:29.733782+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|152\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|1\",\"abilityName\":\"Cover\",\"time\":\"03:18\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:58:40.045999+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|152\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T16:58:42.625502+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|153\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|1\",\"abilityName\":\"Divine Veil\",\"time\":\"03:19\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:58:43.613471+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|153\",\"moveTo\":\"03:13\"}}]}}",
      //       "timestamp": "2021-11-18T16:58:45.896812+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|153\",\"moveTo\":\"03:15\"}}]}}",
      //       "timestamp": "2021-11-18T16:59:02.333973+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|154\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|3\",\"abilityName\":\"Shake It Off\",\"time\":\"04:24\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:59:06.928673+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|155\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|1\",\"abilityName\":\"Divine Veil\",\"time\":\"06:17\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:59:20.620973+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|155\",\"moveTo\":\"06:22\"}}]}}",
      //       "timestamp": "2021-11-18T16:59:26.813356+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|156\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|3\",\"abilityName\":\"Shake It Off\",\"time\":\"07:02\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T16:59:43.280486+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|156\",\"moveTo\":\"07:04\"}}]}}",
      //       "timestamp": "2021-11-18T16:59:49.464194+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|157\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|1\",\"abilityName\":\"Divine Veil\",\"time\":\"01:35\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T17:00:17.579129+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|157\",\"moveTo\":\"01:39\"}}]}}",
      //       "timestamp": "2021-11-18T17:00:25.330016+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|158\",\"attack\":{\"offset\":\"03:44\",\"name\":\"Flare\",\"type\":2,\"source\":\"Voidwalker\",\"description\":null,\"tags\":[\"Fall-Off RaidWide\"],\"syncSettings\":null}}}",
      //       "timestamp": "2021-11-18T17:01:59.950195+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|160\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|7\",\"abilityName\":\"Collective Unconscious\",\"time\":\"09:50\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T17:02:22.512434+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|161\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|5\",\"abilityName\":\"Temperance\",\"time\":\"09:46\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T17:02:39.758139+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|161\",\"moveTo\":\"09:48\"}}]}}",
      //       "timestamp": "2021-11-18T17:02:41.72948+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|162\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|3\",\"abilityName\":\"Reprisal\",\"time\":\"09:09\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T17:02:45.681788+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|162\",\"moveTo\":\"09:12\"}}]}}",
      //       "timestamp": "2021-11-18T17:02:49.5021+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|163\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|1\",\"abilityName\":\"Passage of Arms\",\"time\":\"09:51\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T17:02:53.313284+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|164\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|5\",\"abilityName\":\"Asylum\",\"time\":\"09:51\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T17:03:01.456483+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|164\",\"moveTo\":\"09:48\"}}]}}",
      //       "timestamp": "2021-11-18T17:03:04.592486+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|165\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|3\",\"abilityName\":\"Shake It Off\",\"time\":\"09:14\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T17:03:08.445393+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|165\",\"moveTo\":\"09:10\"}}]}}",
      //       "timestamp": "2021-11-18T17:03:10.672074+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|166\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|1\",\"abilityName\":\"Reprisal\",\"time\":\"09:49\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T17:03:11.784438+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|166\",\"moveTo\":\"09:48\"}}]}}",
      //       "timestamp": "2021-11-18T17:03:15.188672+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|167\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|15\",\"abilityName\":\"Addle\",\"time\":\"09:55\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T17:03:20.064781+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|167\",\"moveTo\":\"09:56\"}}]}}",
      //       "timestamp": "2021-11-18T17:03:21.764518+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|168\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|11\",\"abilityName\":\"Mantra\",\"time\":\"09:54\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T17:03:27.286752+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|168\",\"moveTo\":\"09:55\"}}]}}",
      //       "timestamp": "2021-11-18T17:03:30.352642+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|169\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|13\",\"abilityName\":\"Tactician\",\"time\":\"09:49\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T17:03:31.847656+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|170\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|7\",\"abilityName\":\"Neutral Sect\",\"time\":\"09:53\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T17:03:38.853832+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"moveAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|170\",\"moveTo\":\"09:50\"}}]}}",
      //       "timestamp": "2021-11-18T17:03:41.038853+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|39\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T17:03:42.468922+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|40\",\"updateBossAttack\":false}}]}}",
      //       "timestamp": "2021-11-18T17:03:42.900324+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[]}}",
      //       "timestamp": "2021-11-18T17:03:42.970169+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"useAbility\",\"params\":{\"id\":\"ub7054c74-a6c2-9c39-dbca-97d207453313|171\",\"jobGroup\":\"jb7054c74-a6c2-9c39-dbca-97d207453313|13\",\"abilityName\":\"Tactician\",\"time\":\"03:40\",\"loaded\":false,\"jobActor\":null,\"settings\":null}}",
      //       "timestamp": "2021-11-18T17:08:06.293691+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|172\",\"attack\":{\"offset\":\"01:29\",\"name\":\"hello tapko did I do something wrong D:\",\"type\":0,\"source\":null,\"description\":null,\"tags\":null,\"syncSettings\":null}}}",
      //       "timestamp": "2021-11-18T17:11:29.197445+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|172\",\"attack\":{\"offset\":\"01:47\"},\"updateAllWithSameName\":false}}]}}",
      //       "timestamp": "2021-11-18T17:11:37.657905+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|172\",\"attack\":{\"offset\":\"02:22\"},\"updateAllWithSameName\":false}}]}}",
      //       "timestamp": "2021-11-18T17:11:38.193553+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|172\",\"attack\":{\"offset\":\"03:05\"},\"updateAllWithSameName\":false}}]}}",
      //       "timestamp": "2021-11-18T17:11:38.666675+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|172\",\"attack\":{\"offset\":\"01:56\"},\"updateAllWithSameName\":false}}]}}",
      //       "timestamp": "2021-11-18T17:11:39.367162+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|172\",\"updateAttacks\":false}}]}}",
      //       "timestamp": "2021-11-18T17:11:59.117483+00:00"
      //    },
      //    {
      //       "userName": "Tapko",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttack\",\"params\":{\"id\":\"b24f2b372-ef61-d578-93cb-8588ffe9f0a3|30\",\"attack\":{\"offset\":\"02:20\",\"name\":\"No. I did, truing to figure out\",\"type\":2,\"source\":null,\"description\":null,\"tags\":null,\"syncSettings\":null}}}",
      //       "timestamp": "2021-11-18T17:12:23.334744+00:00"
      //    },
      //    {
      //       "userName": "Tapko",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"b24f2b372-ef61-d578-93cb-8588ffe9f0a3|30\",\"attack\":{\"offset\":\"01:15\"},\"updateAllWithSameName\":false}}]}}",
      //       "timestamp": "2021-11-18T17:13:48.534164+00:00"
      //    },
      //    {
      //       "userName": "Tapko",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"b24f2b372-ef61-d578-93cb-8588ffe9f0a3|30\",\"attack\":{\"offset\":\"02:28\"},\"updateAllWithSameName\":false}}]}}",
      //       "timestamp": "2021-11-18T17:13:49.786901+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|182\",\"attack\":{\"offset\":\"03:42\",\"name\":\"fair enough - I noticed the table views weren't loading and was scared I broke something haha\",\"type\":0,\"source\":null,\"description\":null,\"tags\":null,\"syncSettings\":null}}}",
      //       "timestamp": "2021-11-18T17:15:38.51264+00:00"
      //    },
      //    {
      //       "userName": "Tapko",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttack\",\"params\":{\"id\":\"b24f2b372-ef61-d578-93cb-8588ffe9f0a3|35\",\"attack\":{\"offset\":\"03:32\",\"name\":\"No worries, going to fix asap\",\"type\":1,\"source\":null,\"description\":null,\"tags\":null,\"syncSettings\":null}}}",
      //       "timestamp": "2021-11-18T17:16:11.163899+00:00"
      //    },
      //    {
      //       "userName": "Tapko",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"b24f2b372-ef61-d578-93cb-8588ffe9f0a3|35\",\"attack\":{\"offset\":\"02:47\"},\"updateAllWithSameName\":false}}]}}",
      //       "timestamp": "2021-11-18T17:16:18.219256+00:00"
      //    },
      //    {
      //       "userName": "Tapko",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"b24f2b372-ef61-d578-93cb-8588ffe9f0a3|35\",\"attack\":{\"offset\":\"02:51\"},\"updateAllWithSameName\":false}}]}}",
      //       "timestamp": "2021-11-18T17:16:20.436252+00:00"
      //    },
      //    {
      //       "userName": "Tapko",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeBossAttack\",\"params\":{\"id\":\"b24f2b372-ef61-d578-93cb-8588ffe9f0a3|30\",\"updateAttacks\":false}}]}}",
      //       "timestamp": "2021-11-18T17:17:38.114653+00:00"
      //    },
      //    {
      //       "userName": "anonymous",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|188\",\"attack\":{\"offset\":\"04:05\",\"name\":\"great tool btw, has made my raid planning a ton easier haha\",\"type\":0,\"source\":null,\"description\":null,\"tags\":null,\"syncSettings\":null}}}",
      //       "timestamp": "2021-11-18T17:21:47.339914+00:00"
      //    },
      //    {
      //       "userName": "Tapko",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttack\",\"params\":{\"id\":\"b24f2b372-ef61-d578-93cb-8588ffe9f0a3|41\",\"attack\":{\"offset\":\"03:12\",\"name\":\"good to hear 😀\",\"type\":0,\"source\":null,\"description\":null,\"tags\":null,\"syncSettings\":null}}}",
      //       "timestamp": "2021-11-18T17:27:09.081838+00:00"
      //    },
      //    {
      //       "userName": "Tapko",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"addBossAttack\",\"params\":{\"id\":\"b24f2b372-ef61-d578-93cb-8588ffe9f0a3|43\",\"attack\":{\"offset\":\"03:34\",\"name\":\"Looks like fixed\",\"type\":1,\"source\":null,\"description\":null,\"tags\":null,\"syncSettings\":null}}}",
      //       "timestamp": "2021-11-18T17:35:08.272212+00:00"
      //    },
      //    {
      //       "userName": "Tapko",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|182\",\"updateAttacks\":false}}]}}",
      //       "timestamp": "2021-11-18T17:35:13.634346+00:00"
      //    },
      //    {
      //       "userName": "Tapko",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeBossAttack\",\"params\":{\"id\":\"bb7054c74-a6c2-9c39-dbca-97d207453313|188\",\"updateAttacks\":false}}]}}",
      //       "timestamp": "2021-11-18T17:35:14.503403+00:00"
      //    },
      //    {
      //       "userName": "Tapko",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeBossAttack\",\"params\":{\"id\":\"b24f2b372-ef61-d578-93cb-8588ffe9f0a3|35\",\"updateAttacks\":false}}]}}",
      //       "timestamp": "2021-11-18T17:35:15.478706+00:00"
      //    },
      //    {
      //       "userName": "Tapko",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"b24f2b372-ef61-d578-93cb-8588ffe9f0a3|43\",\"attack\":{\"offset\":\"03:34\",\"name\":\"                                     Looks like fixed                                                \",\"type\":1,\"source\":null,\"description\":null,\"tags\":null,\"syncSettings\":null},\"updateAllWithSameName\":false}}]}}",
      //       "timestamp": "2021-11-18T17:35:24.718034+00:00"
      //    },
      //    {
      //       "userName": "Tapko",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeBossAttack\",\"params\":{\"id\":\"b24f2b372-ef61-d578-93cb-8588ffe9f0a3|41\",\"updateAttacks\":false}}]}}",
      //       "timestamp": "2021-11-18T17:35:29.166041+00:00"
      //    },
      //    {
      //       "userName": "Tapko",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"changeBossAttack\",\"params\":{\"id\":\"b24f2b372-ef61-d578-93cb-8588ffe9f0a3|43\",\"attack\":{\"offset\":\"03:34\",\"name\":\"😁😁😁😁😁😁😁😁😁Looks like fixed    😍😍😍😍😍😍😍                                            \",\"type\":1,\"source\":null,\"description\":null,\"tags\":null,\"syncSettings\":null},\"updateAllWithSameName\":false}}]}}",
      //       "timestamp": "2021-11-18T17:36:04.855625+00:00"
      //    },
      //    {
      //       "userName": "Tapko",
      //       "fight": "b0b94a8ea1a54f90b0fc434d6b1a8252",
      //       "data": "{\"name\":\"combined\",\"params\":{\"commands\":[{\"name\":\"removeBossAttack\",\"params\":{\"id\":\"b24f2b372-ef61-d578-93cb-8588ffe9f0a3|43\",\"updateAttacks\":false}}]}}",
      //       "timestamp": "2021-11-18T18:05:54.666526+00:00"
      //    }
      // ];
      // return of(d);

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
               {
                  "id": "b56b029a6-d8ba-52eb-c034-d89d022d4c6d|1", "ability": {
                     "name": "test1", "type": 1, "isAoe": null, "isShareDamage": null, "isTankBuster": null, "offset": "09: 24", "syncSettings": JSON.stringify(
                        <ISyncData>{
                           offset: "00:00",
                           condition: {
                              operation: SyncOperation.And,
                              operands: [
                                 {
                                    type: "name",
                                    payload: {
                                       name: "Flamethrower"
                                    },
                                    description: "nothing new"
                                 }]
                           }
                        })
                  }
               },
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
            userName: "",
            data: "{}",
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
            game: "ffxiv"
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
