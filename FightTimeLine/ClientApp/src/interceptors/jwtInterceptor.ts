import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserStorageService } from 'src/services/UserStorageService';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private readonly storage: UserStorageService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add authorization header with jwt token if available
    if (request.headers.has("fightService")) {
      if (this.storage.user) {
        const currentUser = this.storage.user;
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${currentUser.token}`
          }
        });
      }
    }
    const result = next.handle(request);
    return result;
  }
}
