import { Injectable, EventEmitter, Output } from '@angular/core';
import { Observable } from "rxjs";

export interface IAuthenticationService {
  usernameChanged: EventEmitter<void>;
  authenticatedChanged: EventEmitter<void>;
  login(username: string, password: string): Observable<any>;
  logout(): Observable<any>;
  authenticated: boolean;
  username: string;
}
