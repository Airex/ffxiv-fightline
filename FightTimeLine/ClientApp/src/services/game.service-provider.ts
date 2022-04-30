import { InjectionToken } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { LocalStorageService } from './LocalStorageService';
import { IGameService } from './game.service-interface';
import { FFXIVGameService } from './game-ffxiv.service';
import { SettingsService } from './SettingsService';

const gameServiceFactory = (
  httpClient: HttpClient,
  fflogsUrl: string,
  apiKey: string,
  settings: SettingsService,
  storage: LocalStorageService) => {
  let serviceToReturn: IGameService;
  serviceToReturn = new FFXIVGameService(httpClient, fflogsUrl, apiKey, settings, storage);

  return serviceToReturn;
};

export const gameServiceToken = new InjectionToken("IGameService");

export const gameServiceProvider =
{
  provide: gameServiceToken,
  useFactory: gameServiceFactory,
  deps: [HttpClient, "FFLogs_URL", "FFLogs_API_KEY", SettingsService, LocalStorageService]
};
