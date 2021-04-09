import { Injectable } from '@angular/core';
import * as LocalStorageService from "./LocalStorageService";
import * as X from "@xivapi/angular-client"
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class FFXIVApiService {
    constructor(
        private xivapi: X.XivapiService,
        private storage: LocalStorageService.LocalStorageService) {
    }


    public loadDescription(type, id): Observable<any> {
        const key = `xivapi_${type}_${id}`;
        const value = this.storage.getString(key);
        if (value) {
            return of(({ Description: value }));
        }
        return this.xivapi.get(this.getEndpoint(type), Number(id), {}).pipe(
            tap((x) => {
                this.storage.setString(key, x.Description);
            })
        );
    }

    private getEndpoint(type: string): X.XivapiEndpoint {
        switch (type) {
            case "item":
                return X.XivapiEndpoint.Item;            
        }
        return X.XivapiEndpoint.Action;
    }

}


