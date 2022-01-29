import { HttpClient } from "@angular/common/http";
import { InjectionToken, Inject } from '@angular/core';
import { AuthenticationService } from "./authentication.service";
import { IAuthenticationService } from "./authentication.service-interface";
import { AuthenticationMockService } from "./authentication.service-mock";

import { environment } from "../environments/environment";
import { UserStorageService } from "./UserStorageService";

let authenticationServiceFactory = (http: HttpClient, ls: UserStorageService, basePath: string) => {
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
    HttpClient, UserStorageService, "BASE_URL"
  ]
};
