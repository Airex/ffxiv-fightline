import { Component, OnInit } from '@angular/core';
import { ChangeNotesService } from 'src/services/changeNotes.service';
import { DialogService } from 'src/services/DialogService';
import { LocalStorageService } from 'src/services/LocalStorageService';
import { environment } from "../environments/environment";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(
    private storage: LocalStorageService,
    private changeNotesService: ChangeNotesService,
    private dialogService: DialogService
  ) {
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.showWhatsNew().then(() => { });
    });
  }

  showHelpForFirstTimers(): Promise<void> {
    if (!this.storage.getString("help_shown")) {
      return this.showHelp();
    }
    return Promise.resolve();
  }

  showWhatsNew() {
    const promise = new Promise<void>((resolve) => {
      this.changeNotesService.load()
        .then(value => {
          this.dialogService.openWhatsNew(value)
            .finally(() => {
              resolve();
            });
        })
        .finally(() => {
          resolve();
        });
    });
    return promise;
  }

  showHelp(): Promise<void> {
    return this.dialogService.openHelp();
  }



  title = 'ClientApp';
  version = environment.version;
}
