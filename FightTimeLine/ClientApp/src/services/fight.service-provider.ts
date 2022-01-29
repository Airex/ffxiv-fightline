import { HttpClient } from "@angular/common/http";
import { InjectionToken, Inject,Injector } from '@angular/core';

import { FightsService } from "./fight.service";
import { IFightService } from "./fight.service-interface";
import { FightsMockService } from "./fight.service-mock";

import { environment } from "../environments/environment";
import * as Gameserviceprovider from "./game.service-provider";
import * as Gameserviceinterface from "./game.service-interface";

let fightServiceFactory = (http: HttpClient, path: string, gameService: Gameserviceinterface.IGameService) => {
  var serviceToReturn: IFightService;
  if (environment.production) {
    serviceToReturn = new FightsService(gameService, http, path);
  } else {
    serviceToReturn = new FightsMockService();
  }
  return serviceToReturn;
};

export let fightServiceToken = new InjectionToken("IFightService");

export let fightServiceProvider =
{
  provide: fightServiceToken,
  useFactory: fightServiceFactory,
  deps: [
    HttpClient,"BASE_URL", Gameserviceprovider.gameServiceToken
  ]
};
