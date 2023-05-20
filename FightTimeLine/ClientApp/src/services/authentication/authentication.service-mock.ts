import { Injectable, EventEmitter, Output } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IAuthenticationService } from "./authentication.service-interface";

@Injectable()
export class AuthenticationMockService implements IAuthenticationService {

  @Output() usernameChanged = new EventEmitter<void>();
  @Output() authenticatedChanged = new EventEmitter<void>();

  userName = "Dummy";

  login(username: string, password: string): Observable<any> {
    this.userName = username;
    this.authenticatedChanged.emit();
    this.usernameChanged.emit();
    return of(null);
  }

  logout(): Observable<any> {
    // remove user from local storage to log user out
    this.userName = null;
    this.authenticatedChanged.emit();
    this.usernameChanged.emit();
    return of(null);
  }

  get authenticated(): boolean {
    return this.username != null;
  }
  get username(): string {
    return this.userName;
  }
}
