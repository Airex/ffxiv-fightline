import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable, of} from "rxjs"
import { Zone, ReportFightsResponse, } from "../core/FFLogs"
import * as Parser from "../core/Parser";


@Injectable()
export class SWTORDataService {
  constructor(private httpClient: HttpClient) {

  }

  async getFight(code: string): Promise<ReportFightsResponse> {
    return Promise.resolve(null);
  }

  async getEvents(code: string, instance: number, callBack: (percentage: number) => void): Promise<Parser.Parser> {
    return Promise.resolve(null);
  }

  getZones(): Observable<Zone[]> {
    return this.httpClient.get<Zone[]>(
      "https://raw.githubusercontent.com/Airex/fightline-resources/master/swtor-bosses.json");
  }

  getParses(cn:string, a: string, b: string): Observable<any[]> {
    return of(null);
  }

}
