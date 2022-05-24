import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, Inject, AfterViewInit } from "@angular/core";
import { Router } from "@angular/router";
import { DialogService } from "../../services/index";
import { ScreenNotificationsService } from "../../services/ScreenNotificationsService";
import { IAuthenticationService, authenticationServiceToken, ChangeNotesService } from "../../services/index";
import * as Gameserviceprovider from "../../services/game.service-provider";
import * as Gameserviceinterface from "../../services/game.service-interface";
import * as _ from "lodash";
import { VisStorageService } from "src/services/VisStorageService";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "toolbar",
  templateUrl: "./toolbar.component.html",
  styleUrls: ["./toolbar.component.css"],
})
export class ToolbarComponent {

  @Input() showHome: boolean;
  @Input() showRefresh: boolean;
  @Output() refresh: EventEmitter<void> = new EventEmitter<void>();
  @Output() langChanged: EventEmitter<void> = new EventEmitter<void>();

  container = { data: [] };

  public constructor(
    private dialogService: DialogService,
    @Inject(authenticationServiceToken) public authenticationService: IAuthenticationService,
    @Inject(Gameserviceprovider.gameServiceToken) public gameService: Gameserviceinterface.IGameService,
    private notification: ScreenNotificationsService,
    private changeNotesService: ChangeNotesService,
    private router: Router,
    private visStorage: VisStorageService,
    private translate: TranslateService
  ) {

  }

  get currentLang() {
    return this.visStorage.presenter.language.toLocaleUpperCase();
  }

  setLang(lang: string) {

    this.visStorage.presenter.setLang(lang);
    {
      const all = this.visStorage.holders.abilities.getAll();
      all.forEach(a => a.applyData({}));
      this.visStorage.holders.abilities.update(all);
    }

    {
      const all = this.visStorage.holders.jobs.getAll();
      all.forEach(a => a.applyData({}));
      this.visStorage.holders.jobs.update(all);
    }
    this.langChanged.emit();
    // this.translate.use((localStorage.getItem("lang") || "en").replace("jp", "ja"));
  }

  onHome() {
    this.router.navigateByUrl("/");
  }

  onRefresh() {
    this.refresh.emit();
  }

  openSettings(): void {
    this.dialogService.openSettings();
  }


  showWhatsNewInt() {
    this.changeNotesService.load(true)
      .then(value => {
        this.dialogService.openWhatsNew(null, value);
      });
  }

  gotoDiscord() {
    window.open("https://discord.gg/xRppKj4", "_blank");
  }

  gotoGithub() {
    window.open("https://github.com/Airex/ffxiv-fightline/issues", "_blank");
  }


  privacy() {
    window.open("/privacy", "_blank");
  }

  showHelp(): Promise<void> {
    return this.dialogService.openHelp();
  }

  login() {
    this.dialogService.openLogin();
  }

  register() {
    this.dialogService.openRegister()
      .then(result => {
        if (result) {
          this.authenticationService
            .login(result.username, result.password)
            .subscribe((): void => {
            });
        }
      });
  }

  changeTheme() {
    (window as any).changeTheme(this.darkTheme ? "default" : "dark");
  }


  logout() {
    this.authenticationService.logout();
  }
  get darkTheme() {
    return localStorage.getItem("theme") === "dark";
  }

  onLoad(): void {
    if (!this.authenticationService.authenticated) {
      this.notification.showSignInRequired(() => { this.login(); });
    } else {
      this.dialogService.openLoad();
    }
  }
}
