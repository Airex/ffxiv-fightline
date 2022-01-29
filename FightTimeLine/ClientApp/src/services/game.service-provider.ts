import { InjectionToken } from '@angular/core';
import { HttpClient } from "@angular/common/http"
import { LocalStorageService } from './LocalStorageService';
import { IGameService } from './game.service-interface';
import { FFXIVGameService } from './game-ffxiv.service';

let gameServiceFactory = (
  httpClient: HttpClient,
  //@Inject("FFLogs_URL")
  fflogsUrl: string,
  //@Inject("FFLogs_API_KEY")
  apiKey: string,
  storage: LocalStorageService) => {
  var serviceToReturn: IGameService;
  serviceToReturn = new FFXIVGameService(httpClient, fflogsUrl, apiKey, storage);

  return serviceToReturn;
};

export const gameServiceToken = new InjectionToken("IGameService");

export const gameServiceProvider =
{
  provide: gameServiceToken,
  useFactory: gameServiceFactory,
  deps: [HttpClient, "FFLogs_URL", "FFLogs_API_KEY", LocalStorageService]
};
