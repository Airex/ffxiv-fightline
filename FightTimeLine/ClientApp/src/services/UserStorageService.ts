import { Injectable} from '@angular/core';
import { LocalStorageService } from "./LocalStorageService";


export type User = {
    username: string;
    token: string;
}

@Injectable()
export class UserStorageService {
    
    private _user: User;
    get user(): User | undefined | null {
        if (!this._user) {
            this._user = this.storage.getObject<User>("currentUser");
        }
        return this._user;
    }
    constructor(
        private readonly storage: LocalStorageService) { }

    set(user: User) {
        this._user = user;
        this.storage.setObject("currentUser", user)
    }

    clear() {
        // remove user from local storage to log user out
        this._user = null;
        this.storage.removeItem('currentUser');        
    }   
}
