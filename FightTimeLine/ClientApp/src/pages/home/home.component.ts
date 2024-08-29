import { Component, OnInit, OnDestroy, Inject } from "@angular/core";
import { Router } from "@angular/router";
import * as S from "../../services/index";
import * as Gameserviceprovider from "../../services/game.service-provider";
import * as Gameserviceinterface from "../../services/game.service-interface";
import { DispatcherPayloads } from "../../services/dispatcher.service";


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
    @Inject(S.authenticationServiceToken) public authenticationService: S.IAuthenticationService,
    @Inject("DispatcherPayloads") private dispatcher: S.DispatcherService<DispatcherPayloads>,
    @Inject(Gameserviceprovider.gameServiceToken) public gameService: Gameserviceinterface.IGameService,
    private notification: S.ScreenNotificationsService,
    private dialogService: S.DialogService,
    private router: Router,
    private recentService: S.RecentActivityService,
    private settingsService: S.SettingsService,
  ) {
    this.subs.push(
      this.dispatcher.on("bossTemplatesLoad").subscribe(value => {
        value.close();
        this.router.navigateByUrl("/boss/" + value.boss.id);
      }));
  }

  pinChanged(id) {
    const activityStorage = this.recentService.load();
    const found = activityStorage.activities.find(t => t.id.toLowerCase() === id.toLowerCase());
    if (found) {
      found.pinned = !found.pinned;
      this.recentService.save(activityStorage);
      this.reload(activityStorage);
    }
  }

  delete(id) {
    const activityStorage = this.recentService.load();
    const found = activityStorage.activities.find(t => t.id.toLowerCase() === id.toLowerCase());
    if (found) {
      activityStorage.activities = activityStorage.activities.filter(t => t.id !== id);
      this.recentService.save(activityStorage);
      this.reload(activityStorage);
    }
  }

  reload(activityStorage) {
    this.container.pinned = activityStorage.activities
      .filter(ac => ac.pinned)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    this.container.nonpinned = activityStorage.activities
      .filter(ac => !ac.pinned)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  ngOnInit(): void {
    const activityStorage = this.recentService.load();
    this.reload(activityStorage);
    const settings = this.settingsService.load();
    if (settings.fflogsImport.characterRegion &&
      settings.fflogsImport.characterName &&
      settings.fflogsImport.characterServer) {
      this.fflogsExtraPath = `character/${settings.fflogsImport.characterRegion}/${settings.fflogsImport.characterServer}/${encodeURIComponent(settings.fflogsImport.characterName)}`;
    }

  }

  bossTemplates() {
    this.dialogService.openBossTemplates(false);
  }

  ngOnDestroy(): void {
    this.subs.forEach(e => e.unsubscribe());
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
        if (!result) { return; }
        this.router.navigateByUrl("fflogs/" + result.reportId + "/" + result.fightId);
      });
  }

  new() {
    this.router.navigateByUrl("/new");
  }

  showHelp(): Promise<void> {
    return this.dialogService.openHelp();
  }

}
