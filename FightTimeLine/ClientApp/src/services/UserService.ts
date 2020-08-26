import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class UserService {
  constructor(private http: HttpClient, @Inject("BASE_URL") private basePath: string) { }

    isUserNameRegistered(userName: string) {
        return this.http.get(this.basePath+ 'api/users/exists?username=' + userName);
    }

    createUser(userName: string, password: string, captchaData: string) {
        return this.http.post(this.basePath+ "api/users/createUser", { userName: userName, password: password },
            {
                headers: {
                    "captcha": captchaData
                }
            });
    }


}
