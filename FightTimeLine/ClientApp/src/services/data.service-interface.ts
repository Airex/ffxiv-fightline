import { Observable } from "rxjs";
import * as FFLogs from "../core/FFLogs";
import * as Parser from "../core/Parser";

export type GetEventsOptions = {
  bossAttacksOnly?: boolean
};

export interface IDataService {
  getFight(code: string): Promise<FFLogs.ReportFightsResponse>;
  getEvents(code: string, instance: number, options: GetEventsOptions, callBack: (percentage: number) => void): Promise<Parser.Parser>;
  getZones(): Observable<FFLogs.Zone[]>;
  getParses(characterName: string, serverName: string, region: string): Observable<FFLogs.Parse[]>;
}
