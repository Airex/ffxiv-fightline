import { Injectable } from '@angular/core';
import * as X from "@xivapi/angular-client";
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SessionStorageService } from './SessionStorageService';

@Injectable()
export class FFXIVApiService {
  constructor(
    private xivapi: X.XivapiService,
    private storage: SessionStorageService) {
  }


  public loadDescription(type, id): Observable<{}> {
    const key = `xivapi_${type}_${id}`;
    const value = this.storage.getObject<any>(key);
    if (value) {
      return of(value);
    }
    return this.xivapi.get(this.getEndpoint(type), Number(id), {}).pipe(
      tap((x) => {
        this.storage.setObject(key, {
          Description_de: x.Description_de,
          Description_en: x.Description_en,
          Description_fr: x.Description_fr,
          Description_ja: x.Description_ja
        });
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


