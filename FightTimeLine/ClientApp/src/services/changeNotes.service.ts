import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import * as LocalStorageService from "./LocalStorageService";
import { Guid } from "guid-typescript"

@Injectable()
export class ChangeNotesService {
  constructor(
    private httpClient: HttpClient,
    private storage: LocalStorageService.LocalStorageService,
  ) {
  }

  load(ignoreRevision?: boolean): Promise<IChahgeNote[]> {
    const promise = new Promise<IChahgeNote[]>((resolve, reject) => {
      this.httpClient
        .get<IChahgeNote[]>("https://raw.githubusercontent.com/Airex/fightline-resources/master/change-notes.json?v="+Guid.create().toString())
        .subscribe(value => {
          if (value) {
            const changes = value.sort((a, b) => b.revision - a.revision);
            const latestRev = changes[0];
            const shown = this.storage.getString("whatsnew_shown") || "0";

            this.storage.setString("whatsnew_shown", latestRev.revision.toString());
            if (Number.parseInt(shown) < latestRev.revision || ignoreRevision) {
              resolve(value);
            } else {
              reject();
            }
          } else {
            reject();
          }
        },
          error => {
            reject(error);
          });
    });

    return promise;

  }

}

export interface IChahgeNote {
  revision: number;
  date: string;
  items: string[];
}
