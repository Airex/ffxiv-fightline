import { Injectable } from "@angular/core"
import * as LocalStorageService from "./LocalStorageService";
import data from "../changeNotes"

@Injectable()
export class ChangeNotesService {
  constructor(    
    private storage: LocalStorageService.LocalStorageService,
  ) {
  }

  load(ignoreRevision?: boolean): Promise<IChahgeNote[]> {    
    const promise = new Promise<IChahgeNote[]>((resolve, reject) => {
      if (data) {
        const changes = data.sort((a, b) => b.revision - a.revision);
        const latestRev = changes[0];
        const shown = this.storage.getString("whatsnew_shown") || "0";

        this.storage.setString("whatsnew_shown", latestRev.revision.toString());
        if (Number.parseInt(shown) < latestRev.revision || ignoreRevision) {
          resolve(data);
        } else {
          reject();
        }
      } else {
        reject();
      }
      
    });

    return promise;

  }

}

export interface IChahgeNote {
  revision: number;
  date: string;
  items: string[];
}
