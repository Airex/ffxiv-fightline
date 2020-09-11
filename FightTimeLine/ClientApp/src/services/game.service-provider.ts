import { InjectionToken } from '@angular/core/';
import { HttpClient } from "@angular/common/http"
import * as Gameserviceinterface from "./game.service-interface";
import * as Gameffxivservice from "./game-ffxiv.service";
import * as Gameswtorservice from "./game-swtor.service";
import {environment} from "../environments/environment"
import * as SettingsService from "./SettingsService";
import * as LocalStorageService from "./LocalStorageService";

let gameServiceFactory = (
   httpClient: HttpClient,
  //@Inject("FFLogs_URL")
   fflogsUrl: string,
  //@Inject("FFLogs_API_KEY")
   apiKey: string,
   settings: SettingsService.SettingsService,
   storage: LocalStorageService.LocalStorageService) => {
  var serviceToReturn: Gameserviceinterface.IGameService;
  
  if (location.hostname.toLowerCase().indexOf("swtor") >= 0 || environment.forceSWTOR) {
    serviceToReturn = new Gameswtorservice.SWTORGameService(httpClient);
  } else {
    serviceToReturn = new Gameffxivservice.FFXIVGameService(httpClient, fflogsUrl, apiKey, storage);
  }
  return serviceToReturn;
};

export let gameServiceToken = new InjectionToken("IGameService");

export let gameServiceProvider =
{
  provide: gameServiceToken,
  useFactory: gameServiceFactory,
  deps: [HttpClient, "FFLogs_URL", "FFLogs_API_KEY", SettingsService.SettingsService, LocalStorageService.LocalStorageService]
};
