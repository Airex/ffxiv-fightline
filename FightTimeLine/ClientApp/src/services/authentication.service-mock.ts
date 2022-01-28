import { Injectable, EventEmitter, Output, Directive } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IAuthenticationService } from "./authentication.service-interface";

@Directive()
@Injectable()
export class AuthenticationMockService implements IAuthenticationService {

  @Output("usernameChanged") usernameChanged = new EventEmitter<void>();
  @Output("authenticatedChanged") authenticatedChanged = new EventEmitter<void>();
  
  userName:string = "Dummy";

  login(username: string, password: string): Observable<any> {
    this.userName = username;
    this.authenticatedChanged.emit();
    this.usernameChanged.emit();
    return of(null);
  }

  logout():Observable<any> {
    // remove user from local storage to log user out
    this.userName = null;
    this.authenticatedChanged.emit();
    this.usernameChanged.emit();
    return of(null);
  }

  get authenticated(): boolean {
    return this.username!=null;
  }
  get username(): string {
    return this.userName;
  }
}
