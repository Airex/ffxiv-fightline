import { Component, OnInit, OnDestroy, ViewChild, ViewChildren, QueryList, HostListener, Input, Output, EventEmitter, Inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { IJob, IFilter, IView } from "../core/Models";
import { DialogService } from "../services/index"
import { FilterComponent } from "../fightline/filter/filter.component"
import { ViewComponent } from "../fightline/view/view.component"
import { PingComponent } from "../fightline/ping/ping.component"
import { ScreenNotificationsService } from "../services/ScreenNotificationsService"
import { LocalStorageService } from "../services/LocalStorageService"
import { IAuthenticationService, authenticationServiceToken, ChangeNotesService } from "../services/index"
import * as M from "../core/Models"
import * as Gameserviceprovider from "../services/game.service-provider";
import * as Gameserviceinterface from "../services/game.service-interface";
import * as _ from "lodash";
import * as SettingsService from "../services/SettingsService";

@Component({
  selector: "toolbar",
  templateUrl: "./toolbar.component.html",
  styleUrls: ["./toolbar.component.css"],
})
export class ToolbarComponent implements OnInit, OnDestroy {

  @Input("showHome") showHome: boolean;
  @Input("showTitle") showTitle: boolean;
  @Input("showHeaderLabel") showHeaderLabel: boolean;
  @Input("showJobButton") showJobButton: boolean;
  @Input("showMenu") showMenu: boolean;
  @Input("showUndoRedo") showUndoRedo: boolean;
  @Input("showfilter") showfilter: boolean;
  @Input("showView") showView: boolean;
  @Input("showTools") showTools: boolean;
  @Input("showTeamwork") showTeamwork: boolean;
  @Input("showRefresh") showRefresh: boolean;

  @Input("authenticated") authenticated: boolean;
  @Input("username") username: string;
  @Input("canUndo") canUndo: boolean;
  @Input("canRedo") canRedo: boolean;
  @Input("connectedUsers") connectedUsers: M.IHubUser[];
  @Input("connected") connected: boolean;
  @Input("availableTools") availableTools: string[];

  private _fraction:M.IFraction;

  @Input("fraction")
  set fraction(value: M.IFraction) {
    this._fraction = value;
    this.setMenu();
  }

  get fraction(): M.IFraction {
    return this._fraction;
  }

  @Output("startNew") startNew: EventEmitter<void> = new EventEmitter<void>();
  @Output("bossTemplates") bossTemplates: EventEmitter<void> = new EventEmitter<void>();
  @Output("saveFight") saveFight: EventEmitter<void> = new EventEmitter<void>();
  @Output("sessionStart") sessionStart: EventEmitter<void> = new EventEmitter<void>();
  @Output("sessionStop") sessionStop: EventEmitter<void> = new EventEmitter<void>();
  @Output("exportToTable") exportToTable: EventEmitter<void> = new EventEmitter<void>();
  @Output("showTable") showTable: EventEmitter<void> = new EventEmitter<void>();

  @Output("undo") undo: EventEmitter<void> = new EventEmitter<void>();
  @Output("redo") redo: EventEmitter<void> = new EventEmitter<void>();

  @Output("filterUpdate") filterUpdate: EventEmitter<IFilter> = new EventEmitter<IFilter>();
  @Output("viewUpdate") viewUpdate: EventEmitter<IView> = new EventEmitter<IView>();

  @Output("refresh") refresh: EventEmitter<void> = new EventEmitter<void>();

  @Output("tool") tool: EventEmitter<string> = new EventEmitter<string>();
  @Output("addJob") addJob: EventEmitter<string> = new EventEmitter<string>();



  @ViewChild("filter")
  public filter: FilterComponent;
  @ViewChild("view")
  public view: ViewComponent;
  @ViewChildren(PingComponent)
  pings: QueryList<PingComponent>;


  container = { data: [] };

  toolToUse: string = null;

  menu: any;

  public constructor(
    private dialogService: DialogService,
    @Inject(authenticationServiceToken) private authenticationService: IAuthenticationService,
    @Inject(Gameserviceprovider.gameServiceToken) public gameService: Gameserviceinterface.IGameService,
    private notification: ScreenNotificationsService,
    private changeNotesService: ChangeNotesService,
    private router: Router,
    private storage: LocalStorageService
  ) {
    this.setMenu();
  }

  private setMenu() {
    const jobs = this.gameService.jobRegistry.getJobs().filter(it => !this.fraction || it.fraction.name === this.fraction.name);
    if (this.gameService.name === 'swtor') {
      const grouped = _.groupBy(jobs, (it: IJob) => it.baseClass);
      this.menu = grouped;
    } else {
      this.menu = jobs;
    }
  }

  setSettings(settings: SettingsService.ISettings) {
    if (settings) {
      if (settings.main && settings.main.defaultView)
        this.view.set(settings.main.defaultView);
      if (settings.main && settings.main.defaultFilter)
        this.filter.set(settings.main.defaultFilter);
    }
  }

  onHome() {
    this.router.navigateByUrl("/");
  }

  onStartSession() {
    this.sessionStart.emit();
  }

  onStopSession() {
    this.sessionStop.emit();
  }

  onUndo() {
    this.undo.emit();
  }

  onExportToTable() {
    this.exportToTable.emit();
  }

  onShowAsTable() {
    this.showTable.emit();
  }

  onRedo() {
    this.redo.emit();
  }

  onTool() {
    this.tool.emit();
  }

  onAddJob(name: string) {
    this.addJob.emit(name);
  }

  onRefresh() {
    this.refresh.emit();
  }

  useTool(tool: string) {
    this.toolToUse = tool;
    this.tool.emit(tool);
  }

  onOpenBossTemplates() {
    this.bossTemplates.emit();
  }

  onSave() {
    this.saveFight.emit();
  }

  ngOnInit(): void {

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

  updateFilter($data: IFilter): void {
    this.filterUpdate.emit($data);
  }

  updateView($data: IView): void {
    this.viewUpdate.emit($data);
  }

  ngOnDestroy(): void {

  }

  ping(id: string, owner: boolean): void {
    const pingComponent = this.pings.find(it => it.id === id || (owner && it.owner === owner));
    if (pingComponent)
      pingComponent.ping();
  }

  openSettings(): void {
    this.dialogService.openSettings();
  }

  showHelpForFirstTimers(): Promise<void> {
    if (!this.storage.getString("help_shown")) {
      return this.showHelp();
    }
    return new Promise<void>((resolve, reject) => resolve());
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
        if (result)
        this.authenticationService
          .login(result.username, result.password)
          .subscribe((): void => {
          });
      });
  }

  logout() {
    this.authenticationService.logout();
  }

  onLoad(): void {
    if (!this.authenticationService.authenticated) {
      this.notification.showSignInRequired(() => { this.login(); });
    } else {
      this.dialogService.openLoad();
    }
  }

  onImport(): void {
    this.dialogService.openImportFromFFLogs()
      .then((result) => {
        if (!result) return;
        const code = result.code;
        const enc = result.fight;
        this.router.navigateByUrl("/fight/" + code + "/" + enc);
      });
  }

  onNew() {
    this.startNew.emit();
  }
}
