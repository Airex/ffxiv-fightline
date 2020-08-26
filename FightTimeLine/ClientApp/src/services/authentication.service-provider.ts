import { HttpClient } from "@angular/common/http";
import { InjectionToken, Inject } from '@angular/core/';

import { LocalStorageService } from "./LocalStorageService"

import { AuthenticationService } from "./authentication.service";
import { IAuthenticationService } from "./authentication.service-interface";
import { AuthenticationMockService } from "./authentication.service-mock";

import { environment } from "../environments/environment";

let authenticationServiceFactory = (http: HttpClient, ls: LocalStorageService, basePath: string) => {
  var serviceToReturn: IAuthenticationService;
  if (environment.production) {
    serviceToReturn = new AuthenticationService(http, basePath, ls);
  } else {
    serviceToReturn = new AuthenticationMockService();
  }
  return serviceToReturn;
};

export let authenticationServiceToken = new InjectionToken("IAuthenticationService");

export let authenticationServiceProvider =
{
  provide: authenticationServiceToken,
  useFactory: authenticationServiceFactory,
  deps: [
    HttpClient, LocalStorageService, "BASE_URL"
  ]
};
