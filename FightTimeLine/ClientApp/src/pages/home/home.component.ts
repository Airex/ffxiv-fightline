import { Component, OnInit, OnDestroy, Inject, ViewChild, TemplateRef } from "@angular/core";
import { Router } from "@angular/router";
import * as S from "../../services/index"
import * as Gameserviceprovider from "../../services/game.service-provider";
import * as Gameserviceinterface from "../../services/game.service-interface";
import { DispatcherPayloads } from "src/services/dispatcher.service";


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
    @Inject("DispatcherPayloads" )private dispatcher: S.DispatcherService<DispatcherPayloads>,
    private settingsService: S.SettingsService,
    @Inject(Gameserviceprovider.gameServiceToken) public gameService: Gameserviceinterface.IGameService
  ) {
    this.subs.push(
      this.dispatcher.on("bossTemplatesLoad").subscribe(value => {
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
      this.reload(activityStorage);
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
      this.reload(activityStorage);
    }
  }

  delete(item) {
    const activityStorage = this.recentService.load();
    const found = activityStorage.activities.find(t => t.id.toLowerCase() === item.id.toLowerCase());
    if (found) {
      activityStorage.activities = activityStorage.activities.filter(t => t.id !== item.id);
      this.recentService.save(activityStorage);
      this.reload(activityStorage);
    }
  }

  reload(activityStorage) {
    this.container.pinned = activityStorage.activities.filter(ac => ac.pinned).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    this.container.nonpinned = activityStorage.activities.filter(ac => !ac.pinned).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  ngOnInit(): void {
    const activityStorage = this.recentService.load();
    this.reload(activityStorage);
    const settings = this.settingsService.load();
    if (settings.fflogsImport.characterRegion &&
      settings.fflogsImport.characterName &&
      settings.fflogsImport.characterServer) {
      this.fflogsExtraPath = `character/${settings.fflogsImport.characterRegion}/${settings.fflogsImport.characterServer}/${encodeURIComponent(settings.fflogsImport.characterName)}`
    }

  }

  listopentablevisiblechange(item: HTMLElement, visible: boolean) {
    item.className = visible ? "forcevisible" : "";
  }

  bossTemplates() {
    this.dialogService.openBossTemplates(false);
  }

  test() {
    alert("test");
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



  gotoDiscord() {
    window.open("https://discord.gg/xRppKj4", "_blank");
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
