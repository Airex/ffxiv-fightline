import { HttpClient } from "@angular/common/http"
import { tap, debounceTime, flatMap, map, merge, concatMap } from "rxjs/operators";
import { Observable, of, from } from "rxjs"
import { SettingsService } from "./SettingsService"
import { LocalStorageService } from "./LocalStorageService"
import { Event, ReportEventsResponse, ReportFightsResponse, Events, Zone } from "../core/FFLogs"
import * as _ from "lodash"
import * as Dataserviceinterface from "./data.service-interface";
import * as Jobregistryserviceinterface from "./jobregistry.service-interface";
import * as Parser from "../core/Parser";

export class FFLogsService implements Dataserviceinterface.IDataService {

  constructor(
    private jobRegistry: Jobregistryserviceinterface.IJobRegistryService,
    private httpClient: HttpClient,
    private fflogsUrl: string,
    private apiKey: string,
    private settings: SettingsService,
    private storage: LocalStorageService) {

  }

  async getFight(code: string): Promise<ReportFightsResponse> {

    const cache = this.storage.getObject<ICacheItem<any>[]>("fights_cache");
    if (cache) {
      const item = cache.find(it => it.key === code);
      if (item) {
        item.timestamp = new Date();
        return Promise.resolve(item.data);
      }
    }

    return this.httpClient.get(this.fflogsUrl + "v1/report/fights/" + code + "?translate=true&api_key=" + this.apiKey).pipe(
      tap((val: ReportFightsResponse) => {
        const fcache = this.storage.getObject<ICacheItem<any>[]>("fights_cache") || [];
        const item = { key: code, timestamp: new Date(), data: val };
        fcache.push(item);
        if (fcache.length > 15)
          fcache.splice(0, fcache.length - 15);
        this.storage.setObject("fights_cache", fcache);
      })).toPromise();
  }

  private loadFightChunk(code: string, instance: number, start: number, end: number, filter: string): Observable<ReportEventsResponse> {
    return this.httpClient.get<ReportEventsResponse>(`${this.fflogsUrl}v1/report/events/${code}?translate=true&api_key=${this.apiKey}&start=${start}&end=${end}&actorinstance=${instance}&filter=${filter}`).pipe(tap(() => { }));
  }

  async getEvents(code: string, instance: number, callBack: (percentage: number) => void): Promise<Parser.Parser> {

    let cache = this.storage.getObject<ICacheItem<any>[]>("events_cache");
    if (cache) {
      const item = cache.find(it => it.key === code + instance);
      if (item) {
        const fight = await this.getFight(code);
        const parser = new Parser.Parser(instance, fight);
        parser.setEvents(item.data.events);
        item.timestamp = new Date();
        return Promise.resolve(parser);
      }
    }

    const fight = await this.getFight(code);
    const parser = new Parser.Parser(instance, fight);

    const foundFight = parser.fight;
    if (!foundFight) return Promise.resolve(null);

    const filter = parser.createFilter(this.jobRegistry);
    const events: Event[] = [];
    let a: ReportEventsResponse = null;
    do {
      a = await this
        .loadFightChunk(code, instance, (a && a.nextPageTimestamp) || foundFight.start_time, foundFight.end_time, filter)
        .pipe(debounceTime(500))
        .toPromise()
        .then((value: ReportEventsResponse) => value);
      const percentage = ((a.nextPageTimestamp || foundFight.end_time) - foundFight.start_time) / (foundFight.end_time - foundFight.start_time);
      events.push(...a.events);
      callBack(percentage);
    } while (a && a.nextPageTimestamp && a.events.length > 0);

    callBack(1);

    parser.setEvents(events);

    const result = { events: events, jobs: parser.players, start_time: foundFight.start_time, name: foundFight.zoneName + " " + foundFight.name };

    cache = cache || [];
    const item = { key: code + instance, timestamp: new Date(), data: result };
    cache.push(item);
    if (cache.length > 10)
      cache.splice(0, cache.length - 10);
    this.storage.setObject("events_cache", cache);

    return Promise.resolve(parser);
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

  getParses(characterName: string, serverName: string, region: string):Observable<any[]> {
    const observable = this.httpClient.get<Zone[]>(`${this.fflogsUrl}v1/parses/character/${encodeURIComponent(characterName)}/${encodeURIComponent(serverName)}/${encodeURIComponent(region)}?api_key=${this.apiKey}`).pipe(tap(x => {
    }));
    return observable
  }

}

interface ICacheItem<T> {
  key: string,
  data: T;
  timestamp: Date;
}


