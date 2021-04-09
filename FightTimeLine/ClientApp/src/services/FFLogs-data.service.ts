import { HttpClient } from "@angular/common/http"
import { tap, debounceTime } from "rxjs/operators";
import { Observable, of } from "rxjs"
import { LocalStorageService } from "./LocalStorageService"
import { Event, ReportEventsResponse, ReportFightsResponse, Zone } from "../core/FFLogs"
import * as _ from "lodash"
import * as Dataserviceinterface from "./data.service-interface";
import * as Jobregistryserviceinterface from "./jobregistry.service-interface";
import { Parser } from "src/core/Parser";

export class FFLogsService implements Dataserviceinterface.IDataService {

  constructor(
    private jobRegistry: Jobregistryserviceinterface.IJobRegistryService,
    private httpClient: HttpClient,
    private fflogsUrl: string,
    private apiKey: string,
    private storage: LocalStorageService) {

  }

  async getCached<T>(cacheKey: string,
    itemKey: string,
    maxItems: number,
    cacheDays: number,
    action: () => Promise<T>): Promise<T> {
    const cache = this.storage.getObject<ICacheItem<T>[]>(cacheKey) || [];

    const item =
      cache.find(it => it.key === itemKey &&
        (new Date().valueOf() - it.timestamp.valueOf()) < 1000 * 60 * 60 * 24 * cacheDays) ||
      { key: itemKey, timestamp: new Date(), data: await action() };
    item.timestamp = new Date();

    cache.push(item);
    if (cache.length > maxItems)
      cache.splice(0, cache.length - maxItems);

    this.storage.setObject(cacheKey, cache);

    return item.data;

  }

  async getFight(code: string): Promise<ReportFightsResponse> {
    return this.getCached<ReportFightsResponse>("fights_cache", code, 15, 10,
      async () => {
        return await this.httpClient
          .get<ReportFightsResponse>(this.fflogsUrl +
            "v1/report/fights/" +
            code +
            "?translate=true&api_key=" +
            this.apiKey).toPromise();
      });
  }

  private loadFightChunk(code: string, instance: number, start: number, end: number, filter: string):
    Observable<ReportEventsResponse> {
    return this.httpClient
      .get<ReportEventsResponse>(
        `${this.fflogsUrl}v1/report/events/${code}?translate=true&api_key=${this.apiKey}&start=${start}&end=${end
        }&actorinstance=${instance}&filter=${filter}`)
      .pipe();
  }


  async getEvents(code: string, instance: number, callBack: (percentage: number) => void): Promise<Parser> {

    const f = await this.getFight(code);
    const resp = await this.getCached<Event[]>("events_cache", code + instance, 10, 10,
      async () => {
        const parser = new Parser(instance, f);

        const foundFight = parser.fight;
        if (!foundFight) return Promise.resolve(null);

        const filter = parser.createFilter(this.jobRegistry);
        const events: Event[] = [];
        let a: ReportEventsResponse = null;
        do {
          a = await this
            .loadFightChunk(code,
              instance,
              (a && a.nextPageTimestamp) || foundFight.start_time,
              foundFight.end_time,
              filter)
            .pipe(debounceTime(500))
            .toPromise();
          const percentage = ((a.nextPageTimestamp || foundFight.end_time) - foundFight.start_time) /
            (foundFight.end_time - foundFight.start_time);
          events.push(...a.events);
          callBack(percentage);
        } while (a && a.nextPageTimestamp && a.events.length > 0);

        callBack(1);
        return events;
      });

    const parser = new Parser(instance, f);
    parser.setEvents(resp);
    return parser;
  }

  getZones(): Observable<Zone[]> {
    const cache = this.storage.getObject<ICacheItem<Zone[]>>("zones_cache");
    if (cache) {
      if ((new Date().valueOf() - cache.timestamp.valueOf()) < 1000 * 60 * 60 * 24) {
        return of(cache.data);
      }
    }
    const observable = this.httpClient.get<Zone[]>(`${this.fflogsUrl}v1/zones?api_key=${this.apiKey}`).pipe(tap(x => {
      this.storage.setObject("zones_cache", { key: "", data: x, timestamp: new Date() });
    }));
    return observable;
  }

  getParses(characterName: string, serverName: string, region: string): Observable<any[]> {
    const observable = this.httpClient
      .get<Zone[]>(
        `${this.fflogsUrl}v1/parses/character/${encodeURIComponent(characterName)}/${encodeURIComponent(serverName)}/${encodeURIComponent(region)}?api_key=${this.apiKey}`).pipe(tap(x => {
        }));
    return observable;
  }

}

interface ICacheItem<T> {
  key: string,
  data: T;
  timestamp: Date;
}
