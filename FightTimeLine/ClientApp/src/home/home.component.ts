import { Component, OnInit, OnDestroy, ViewChild, ViewChildren, QueryList, HostListener, Inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import * as S from "../services/index"
import * as Gameserviceprovider from "../services/game.service-provider";
import * as Gameserviceinterface from "../services/game.service-interface";
import { IRecentStorage } from "../services/RecentActivitiesService";

@Component({
  selector: "home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit, OnDestroy {

  public container = { pinned: [], nonpinned: [] };
  private subs = [];

  public fflogsExtraPath: string;

  public constructor(
    private notification: S.ScreenNotificationsService,
    private dialogService: S.DialogService,
    @Inject(S.authenticationServiceToken) public authenticationService: S.IAuthenticationService,
    private router: Router,
    private recentService: S.RecentActivityService,
    private changeNotesService: S.ChangeNotesService,
    private storage: S.LocalStorageService,
    private dispatcher: S.DispatcherService,
    private settingsService: S.SettingsService,
    @Inject(Gameserviceprovider.gameServiceToken) public gameService: Gameserviceinterface.IGameService
  ) {
    this.subs.push(
      this.dispatcher.on("BossTemplates Load").subscribe(value => {
        value.close();
        this.router.navigateByUrl("/boss/" + value.boss.id);
      }));
  }

  pin($event, item) {
    $event.stopPropagation();
    $event.preventDefault();
    const activityStorage = this.recentService.load();
    const found = activityStorage.activities.find(t => t.id.toLowerCase() === item.id.toLowerCase());
    if (found) {
      found.pinned = true;
      this.recentService.save(activityStorage);
      this.container.pinned = activityStorage.activities.filter(ac => ac.pinned);
      this.container.nonpinned = activityStorage.activities.filter(ac => !ac.pinned);
    }
  }

  unpin($event, item) {
    $event.stopPropagation();
    $event.preventDefault();
    const activityStorage = this.recentService.load();
    const found = activityStorage.activities.find(t => t.id.toLowerCase() === item.id.toLowerCase());
    if (found) {
      found.pinned = false;
      this.recentService.save(activityStorage);
      this.container.pinned = activityStorage.activities.filter(ac => ac.pinned);
      this.container.nonpinned = activityStorage.activities.filter(ac => !ac.pinned);
    }
  }

  delete(item) {
    const activityStorage = this.recentService.load();
    const found = activityStorage.activities.find(t => t.id.toLowerCase() === item.id.toLowerCase());
    if (found) {
      activityStorage.activities = activityStorage.activities.filter(t => t.id !== item.id);
      this.recentService.save(activityStorage);
      this.container.pinned = activityStorage.activities.filter(ac => ac.pinned);
      this.container.nonpinned = activityStorage.activities.filter(ac => !ac.pinned);
    }
  }

  ngOnInit(): void {
    const activityStorage = this.recentService.load();
    this.container.pinned = activityStorage.activities.filter(ac => ac.pinned).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    this.container.nonpinned = activityStorage.activities.filter(ac => !ac.pinned).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const settings = this.settingsService.load();
    if (settings.fflogsImport.characterRegion &&
      settings.fflogsImport.characterName &&
      settings.fflogsImport.characterServer) {
      this.fflogsExtraPath = `character/${settings.fflogsImport.characterRegion}/${settings.fflogsImport.characterServer}/${encodeURIComponent(settings.fflogsImport.characterName)}`
    }
    setTimeout(() => {
      this.showHelpForFirstTimers().then(value => {
        this.showWhatsNew().then(value => { });
      });
    });

  }

  bossTemplates() {
    this.dialogService.openBossTemplates(false);
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


  ngOnDestroy(): void {
    this.subs.forEach(e => e.unsubscribe());
  }

  openSettings(): void {
    this.dialogService.openSettings();
  }
  onClick(url: string) {
    this.router.navigateByUrl(url);
  }

  onOpenTable(item, name) {
    window.open("/table/" + item.id + "/" + name, "_blank");
  }

  showHelpForFirstTimers(): Promise<void> {
    if (!this.storage.getString("help_shown")) {
      return this.showHelp();
    }
    return new Promise<void>((resolve, reject) => resolve());
  }

  gotoDiscord() {
    window.open("https://discord.gg/xRppKj4", "_blank");
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
        if (result)
          this.authenticationService.login(result.username, result.password).subscribe((): void => {
          });
      });
  }

  logout() {
    this.authenticationService.logout();
  }

  load(): void {
    if (!this.authenticationService.authenticated) {
      this.notification.showSignInRequired(null);
      return;
    }

    this.dialogService.openLoad();
  }

  importFromFFLogs(code: string = null): void {
    this.dialogService.openImportFromFFLogs(code)
      .then((result) => {
        if (!result) return;
        const code = result.code;
        const enc = result.fight;
        this.router.navigateByUrl("/fight/" + code + "/" + enc);
      });
  }

  new() {
    if (this.gameService.fractions) {
      this.dialogService.showFractionSelection(this.gameService.fractions)
        .subscribe(fraction => {
          if (fraction)
            this.router.navigateByUrl("/new/" + fraction.name);
        });
    } else {
      this.router.navigateByUrl("/new");
    }
  }

}
