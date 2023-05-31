import { Injectable } from "@angular/core";
import * as LocalStorageService from "./LocalStorageService";
import data from "../changeNotes";

@Injectable()
export class ChangeNotesService {
  constructor(private storage: LocalStorageService.LocalStorageService) {}

  toDate(date: string): Date {
    const sp = date.split(".");
    return new Date(+sp[2], +sp[1] - 1, +sp[0]);
  }

  load(ignoreRevision?: boolean): Promise<IChangeNote[]> {
    const promise = new Promise<IChangeNote[]>((resolve, reject) => {
      if (data) {
        const changeNotes = data.map(
          (d) => ({ date: this.toDate(d.date), key: d.date } as IChangeNote)
        );
        const changes = changeNotes.sort(
          (a, b) => b.date.getTime() - a.date.getTime()
        );
        const latestRev = changes[0];
        const shown = new Date(this.storage.getString("whatsnew_shown") || 0);
        this.storage.setString("whatsnew_shown", latestRev.date.toJSON());

        if (shown < latestRev.date || ignoreRevision) {
          resolve(changeNotes);
          return;
        }
      }
      reject();
    });

    return promise;
  }
}

export interface IChangeNote {
  key: string;
  date: Date;
}
