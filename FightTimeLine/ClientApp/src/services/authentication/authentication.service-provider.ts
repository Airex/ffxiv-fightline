import { HttpClient } from "@angular/common/http";
import { InjectionToken } from '@angular/core';
import { AuthenticationService } from "./authentication.service";
import { IAuthenticationService } from "./authentication.service-interface";
import { AuthenticationMockService } from "./authentication.service-mock";

import { environment } from "../../environments/environment";
import { UserStorageService } from "../UserStorageService";

const authenticationServiceFactory = (http: HttpClient, ls: UserStorageService, basePath: string) => {
  let serviceToReturn: IAuthenticationService;
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
