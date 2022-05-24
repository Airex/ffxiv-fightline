import { Injectable, EventEmitter, Output, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, of, } from 'rxjs';
import { IAuthenticationService } from "./authentication.service-interface";
import { User, UserStorageService } from './UserStorageService';

@Injectable()
export class AuthenticationService implements IAuthenticationService {

  @Output() usernameChanged = new EventEmitter<void>();
  @Output() authenticatedChanged = new EventEmitter<void>();

  get user(): User | undefined | null {
    return this.storage.user;
  }
  constructor(
    private readonly http: HttpClient,
    @Inject("BASE_URL") private basePath: string,
    private readonly storage: UserStorageService) { }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(this.basePath + 'api/token/createtoken', { username, password })
      .pipe(map((res: any) => {
        // login successful if there's a jwt token in the response
        if (res && res.token) {
          // store username and jwt token in local storage to keep user logged in between page refreshes
          this.storage.set({ username, token: res.token });
          this.authenticatedChanged.emit();
          this.usernameChanged.emit();
        } else {
          return this.logout();
        }
      }));
  }

  logout(): Observable<any> {
    // remove user from local storage to log user out
    this.storage.clear();
    this.authenticatedChanged.emit();
    this.usernameChanged.emit();
    return of(null);
  }

  get authenticated(): boolean {
    return !!this.user;
  }

  get username(): string {
    return this.user?.username || undefined;
  }
}
