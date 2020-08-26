import { Injectable, EventEmitter, Output, Directive,Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, of, } from 'rxjs';
import { LocalStorageService } from "./LocalStorageService";
import { IAuthenticationService } from "./authentication.service-interface";

@Directive()
@Injectable()
export class AuthenticationService implements IAuthenticationService {

  @Output("usernameChanged") usernameChanged = new EventEmitter<void>();
  @Output("authenticatedChanged") authenticatedChanged = new EventEmitter<void>();
  private user:any;
  constructor(
    private readonly http: HttpClient,
    @Inject("BASE_URL") private basePath: string,
    private readonly storage: LocalStorageService) { }

  login(username: string, password: string):Observable<any> {
    return this.http.post<any>(this.basePath+ 'api/token/createtoken', { username: username, password: password })
      .pipe(map((res: any) => {
        // login successful if there's a jwt token in the response
        if (res && res.token) {
          // store username and jwt token in local storage to keep user logged in between page refreshes
          this.user = { username, token: res.token };
          this.storage.setObject('currentUser', this.user);
          this.authenticatedChanged.emit();
          this.usernameChanged.emit();
        } else {
          this.logout();
        }
      }));
  }

  logout(): Observable<any> {
    // remove user from local storage to log user out
    this.user = null;
    this.storage.removeItem('currentUser');
    this.authenticatedChanged.emit();
    this.usernameChanged.emit();
    return of(null);
  }

  get authenticated(): boolean {
    return !!this.user && !!(this.user = this.storage.getObject<any>("currentUser"));
  }
  get username(): string {
    if (this.user || (this.user = this.storage.getObject<any>("currentUser"))) return this.user.username;
    return undefined;
  }
}
