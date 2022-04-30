import { HttpClient } from "@angular/common/http";
import { tap, debounceTime } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { LocalStorageService } from "./LocalStorageService";
import { BaseEventFields, CorrectReportEventsResponse, ReportFightsResponse, Zone } from "../core/FFLogs";
import * as _ from "lodash";
import { Parser } from "src/core/Parser";
import { IJobRegistryService } from "./jobregistry.service-interface";
import { GetEventsOptions, IDataService } from "./data.service-interface";
import { SettingsService } from "./SettingsService";

export class FFLogsService implements IDataService {

  constructor(
    private jobRegistry: IJobRegistryService,
    private httpClient: HttpClient,
    private fflogsUrl: string,
    private apiKey: string,
    private settings: SettingsService,
    private storage: LocalStorageService) {

  }

  async getCached<T>(
    cacheKey: string,
    itemKey: string,
    maxItems: number,
    cacheDays: number,
    action: () => Promise<T>): Promise<T> {
    let cache = this.storage.getObject<ICacheItem<T>[]>(cacheKey) || [];

    const item = cache.find(it =>
      it.key === itemKey &&
      (new Date().valueOf() - it.timestamp.valueOf()) < 1000 * 60 * 60 * 24 * cacheDays
    ) || { key: itemKey, timestamp: new Date(), data: await action() };

    item.timestamp = new Date();

    cache = cache.filter(it => it.key !== itemKey && (new Date().valueOf() - it.timestamp.valueOf()) < 1000 * 60 * 60 * 24 * cacheDays);
    cache.push(item);
    if (cache.length > maxItems) {
      cache.splice(0, cache.length - maxItems);
    }

    this.storage.setObject(cacheKey, cache);

    return item.data;

  }

  async getFight(code: string): Promise<ReportFightsResponse> {
    return this.getCached<ReportFightsResponse>("fights_cache", code, 15, 10,
      async () => {
        const url = `${this.fflogsUrl}v1/report/fights/${encodeURIComponent(code)}?translate=true&api_key=${this.apiKey}`;
        return await this.httpClient.get<ReportFightsResponse>(url).toPromise();
      });
  }

  private loadFightChunk(
    code: string,
    instance: number,
    start: number,
    end: number,
    filter: string,
    transtate: boolean): Observable<CorrectReportEventsResponse> {
    const url = `${this.fflogsUrl}v1/report/events/${code}?translate=${transtate ? 1 : 0}&api_key=${this.apiKey}&start=${start}&end=${end}&actorinstance=${instance}&filter=${filter}`;
    return this.httpClient.get<CorrectReportEventsResponse>(url);
  }


  async getEvents(code: string, instance: number, options: GetEventsOptions, callBack: (percentage: number) => void): Promise<Parser> {

    const config = this.settings.load();
    const translate = config.fflogsImport.translate === undefined ? true : config.fflogsImport.translate;

    const f = await this.getFight(code);
    const parser = new Parser(instance, f);

    const resp = await this.getCached<BaseEventFields[]>("events_cache", code + instance, 10, 10, async () => {
      const foundFight = parser.fight;
      if (!foundFight) { return Promise.resolve(null); }

      const filter = parser.createFilter(this.jobRegistry, options?.bossAttacksOnly);
      const events: BaseEventFields[] = [];
      let a: CorrectReportEventsResponse = null;

      do {
        a = await this.loadFightChunk(
          code,
          instance,
          (a && a?.nextPageTimestamp) || foundFight.start_time,
          foundFight.end_time,
          filter,
          translate)
          .pipe(debounceTime(500))
          .toPromise();

        const diff = (a.nextPageTimestamp || foundFight.end_time) - foundFight.start_time;
        const percentage = diff / (foundFight.end_time - foundFight.start_time);
        callBack(percentage);

        events.push(...a.events);
      } while (a && a.nextPageTimestamp && a.events.length > 0);

      callBack(1);
      return events;
    });

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
    const observable = this.httpClient
      .get<Zone[]>(`${this.fflogsUrl}v1/zones?api_key=${this.apiKey}`)
      .pipe(
        tap(x => {
          this.storage.setObject("zones_cache", {
            key: "", data: x, timestamp: new Date()
          });
        }
        ));
    return observable;
  }

  getParses(characterName: string, serverName: string, region: string): Observable<any[]> {
    const url = `${this.fflogsUrl}v1/parses/character/${encodeURIComponent(characterName)}/${encodeURIComponent(serverName)}/${encodeURIComponent(region)}?api_key=${this.apiKey}`;
    const observable = this.httpClient.get<Zone[]>(url);
    return observable;
  }
}

interface ICacheItem<T> {
  key: string;
  data: T;
  timestamp: Date;
}
