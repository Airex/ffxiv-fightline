import { Component, OnInit } from '@angular/core';
import { ChangeNotesService } from 'src/services/changeNotes.service';
import { DialogService } from 'src/services/DialogService';
import { LocalStorageService } from 'src/services/LocalStorageService';
import { environment } from "../environments/environment";
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'ClientApp';
  version = environment.version;

  constructor(
    private storage: LocalStorageService,
    private changeNotesService: ChangeNotesService,
    private dialogService: DialogService,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang("en");
    this.translate.use((localStorage.getItem("lang") || "en").replace("jp", "ja"));
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




}
