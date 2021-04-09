import { Injectable } from '@angular/core';
import * as LocalStorageService from "./LocalStorageService";
import * as X from "@xivapi/angular-client"
import { Observable, Subject } from 'rxjs';
import { of } from 'rxjs/internal/observable/of';
import { tap } from 'rxjs/operators';

@Injectable()
export class FFXIVApiService {
    constructor(
        private xivapi: X.XivapiService,
        private storage: LocalStorageService.LocalStorageService) {
    }


    public loadDescription(type, id): Observable<any> {
        const value = this.storage.getString(`xivapi_${type}_${id}`);
        if (value) {
            if (value) {
                return of(({ Description: value }));
            }
        }
        return this.xivapi.get(this.getEndpoint(type), Number(id), {}).pipe(
            tap((x) => {
                this.storage.setString(`xivapi_${type}_${id}`, x.Description);
            })
        );
    }

    private getEndpoint(type: string): X.XivapiEndpoint {
        switch (type) {
            case "item":
                return X.XivapiEndpoint.Item;
            default:
        }
        return X.XivapiEndpoint.Action;
    }

}


