import { Component, OnInit, OnDestroy, ViewChild, HostListener, Inject, NgZone } from "@angular/core";
import { Location } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import * as _ from "lodash";

import { FightTimeLineController } from "../core/FightTimeLineController"
import * as M from "../core/Models";
import * as FF from "../core/FFLogs";
import { NgProgressComponent } from "ngx-progressbar"
import * as S from "../services/index"
import { process } from "../core/BossAttackProcessors"
import { ToolbarComponent } from "../toolbar/toolbar.component"
import { SidepanelComponent } from "../sidepanel/sidepanel.component"
import { PlanAreaComponent, Action, EventSource } from "./planArea/planArea.component"
import { ToolsManager, CopyPasteTool, DowntimeTool } from "../core/ToolsManager"
import { PresenterManager } from "../core/PresentationManager"

import { IdGenerator } from "../core/Generators"
import { ICommandData } from "../core/UndoRedo"
import * as Gameserviceprovider from "../services/game.service-provider";
import * as Gameserviceinterface from "../services/game.service-interface";
import { VisStorageService } from "../services";
import * as SerializeController from "../core/SerializeController";
import * as Environment from "../environments/environment";
import * as RecentActivitiesService from "../services/RecentActivitiesService";


@Component({
  selector: "fightline",
  templateUrl: "./fightline.component.html",
  styleUrls: ["./fightline.component.css"],
})
export class FightLineComponent implements OnInit, OnDestroy {
  startDate = new Date(946677600000);

  fightId: string;
  private fflogsCode: string = null;

  @ViewChild("sidepanel", { static: true })
  sidepanel: SidepanelComponent;
  @ViewChild("toolbar", { static: true })
  toolbar: ToolbarComponent;
  @ViewChild("progressBar", { static: true })
  progressBar: NgProgressComponent;
  @ViewChild("planArea", { static: true })
  planArea: PlanAreaComponent;

  fightLineController: FightTimeLineController;
  subs: any[] = [];

  private idgen = new IdGenerator();
  toolsManager = new ToolsManager();
  presenterManager = new PresenterManager();
  jobs = this.gameService.jobRegistry.getJobs();
  sideNavOpened: boolean = false;

  public constructor(
    private recent: S.RecentActivityService,

    @Inject(S.fightServiceToken) private fightService: S.IFightService,
    @Inject(Gameserviceprovider.gameServiceToken) private gameService: Gameserviceinterface.IGameService,
    private notification: S.ScreenNotificationsService,
    private visStorage: VisStorageService,
    private route: ActivatedRoute,
    private location: Location,
    private ngZone: NgZone,
    private router: Router,
    private dialogService: S.DialogService,
    private changeNotesService: S.ChangeNotesService,
    @Inject(S.authenticationServiceToken) public authenticationService: S.IAuthenticationService,
    private settingsService: S.SettingsService,
    private storage: S.LocalStorageService,
    public fightHubService: S.FightHubService,
    private dispatcher: S.DispatcherService) {
  }

  onAction(event: Action) {
    if (this.toolsManager.handleAction(event)) return;

    const actionName = "on" + event.name[0].toUpperCase() + event.name.slice(1);
    if (this[actionName])
      this[actionName](event.source, event.payload);
  }

  onSelected(source: EventSource, event) {
    this.setSidePanel(event.data);
  }

  onClickGroup(source: EventSource, event) {
    if (source === "player") {
      this.planArea.clearSelection();
      this.setSidePanel(event);
    }
  }

  onClickEmpty(source: EventSource, event) {
    const downtimesAtTime = this.fightLineController.getDowntimesAtTime(event.time);
    if (downtimesAtTime.length > 0 && (source === "boss" || (source === "player" && this.presenterManager.view.showDowntimesInPartyArea))) {
      event.items = downtimesAtTime.map(d => d.id);
      this.planArea.clearSelection();

      this.setSidePanel(event);
    }
    else
      this.planArea.updateSelection(source, event);
  }

  onDoubleClickEmpty(source: EventSource, event) {
    this.fightLineController.notifyDoubleClick(event.item, event.group, new Date(event.time));
  }

  onDoubleClickItem(source: EventSource, event) {
    this.fightLineController.notifyDoubleClick(event.item, event.group, new Date(event.time));
  }

  onDoubleClickGroup(source: EventSource, event) {
    if (source === "player") {
      if (!this.fightLineController.isJobGroup(event.group)) {
        this.fightLineController.toggleCompactViewAbility(event.group);
        this.fightLineController.applyFilter();
      } else {
        this.fightLineController.toggleJobCollapsed(event.group);
        this.fightLineController.applyFilter();
      }
      setTimeout(() => this.planArea.refresh());
    }
  }

  onTimeChanged(source: EventSource, event) {
    this.fightLineController.notifyTimeChanged(event.id, event.date);
  }

  onDelete(source: EventSource, event) {
    this.fightLineController.handleDelete(event);
  }

  onMove(source: EventSource, event) {
    this.fightLineController.notifyMove(event);
  }

  onKeyMove(source: EventSource, event) {
    this.fightLineController.moveSelection(event.delta, event.selection);
  }

  onVisibleFrameTemplate(source: EventSource, event) {
    if (source === "player") {
      event.handler(this.fightLineController.visibleFrameTemplate(event.item))
    }
  }

  onCanMove(source: EventSource, event) {
    const canMove = this.fightLineController.canMove(event.item, event.selection);
    if (canMove && source === "boss")
      this.fightLineController.moveBossAttack(event.item);
    event.handler(canMove);
  }

  onItemTooltip(source: EventSource, event) {
    event.handler(this.fightLineController.tooltipOnItemUpdateTime(event.item))
  }

  refreshSidePanel() {
    if (!this.sidepanel.refresh()) {
      if (this.sideNavOpened)
        this.sideNavOpened = false;
    }
  }

  onTable(temlate: string) {
    window.open(this.router.serializeUrl(this.router.createUrlTree(["/table", this.fightId, temlate])), "_blank")
  }

  private openStanceSelector(data: M.IContextMenuData[]): void {
    //    this.contextMenu.openStanceSelector(data);
  }

  exportToTable() {
    this.dialogService.openExportToTable(() => this.fightLineController.createSerializer().serializeForExport());
  }

  private setSidePanel(eventData) {
    this.ngZone.run(() => {
      if (eventData &&
        (eventData.items && eventData.items.length > 0 ||
          (eventData.group && eventData.what === "group-label"))) {
        const items = this.fightLineController.getItems(eventData.items || [eventData.group]);
        if (items && items.length > 0) {

          this.sidepanel.setItems(items, this.fightLineController.getHolders());
          if (!this.sideNavOpened) {
            this.sideNavOpened = true;
          }
          return;
        }
      }
      this.sidepanel.setItems([], null);
      if (this.sideNavOpened)
        this.sideNavOpened = false;
    });
  }

  updateFilter($data?: M.IFilter): void {
    this.fightLineController.applyFilter($data);
  }

  updateView($data?: M.IView): void {
    this.fightLineController.applyView($data);
    setTimeout(() => this.planArea.refresh());
  }

  openBossAttackAddDialog(bossAbility: M.IBossAbility, callBack: (b: any) => void): void {
    //console.log("boss attack edit")
    this.dialogService.openBossAttackAddDialog(bossAbility, this.fightLineController.getHolders(), this.presenterManager, callBack);
  }

  openAbilityEditDialog(data: { ability: M.IAbility, settings: M.IAbilitySetting[], values: M.IAbilitySettingData[] },
    callBack: (b: any) => void): void {
    //console.log("ability edit")
    this.dialogService.openAbilityEditDialog(data, callBack);
  }

  load(): void {
    if (!this.authenticationService.authenticated) {
      this.notification.showSignInRequired(() => { });
      return;
    }

    this.dialogService.openLoad();
  }

  importFromFFLogs(code: string = null): void {
    this.dialogService
      .openImportFromFFLogs(code || this.fflogsCode)
      .then(result => {
        if (!result) return;
        this.loadFFLogsData(result.code, result.fight);
      });
  }

  loadFFLogsData(code: string, enc: number) {
    const stop = (ref: { close: () => void; }) => {
      this.progressBar.complete();
      ref.close();
    };

    this.dialogService.executeWithLoading(ref => {
      this.progressBar.start();
      this.gameService.dataService.getEvents(code, enc, percentage => this.progressBar.set(percentage * 100))
        .then((parser) => {
          this.fightService.newFight("").subscribe(value => {
            this.fightId = value.id;
            this.location.replaceState("/" + value.id);
            this.startSession()
              .then(() => {
                this.recent.register({
                  name: parser.fight.name,
                  source: RecentActivitiesService.ActivitySource.FFLogs,
                  timestamp: new Date(),
                  url: "/" + value.id.toLowerCase(),
                  id: value.id.toLowerCase(),
                  pinned: false
                });
                const settings = this.settingsService.load();

                this.presenterManager.setSettings(settings);

                this.fightLineController.importFromFFLogs(code + ":" + enc, parser);

                this.fightLineController.applyView(settings.main.defaultView);
                this.fightLineController.applyFilter(settings.main.defaultFilter);

                this.planArea.setInitialWindow(this.fightLineController.getLatestAbilityUsageTime(), 2);
                this.planArea.refresh();

                stop(ref);
              })
              .catch(() => {
                stop(ref);
              });
          },
            error => {
              console.log(error);
              stop(ref);
              this.notification.error("Unable to start");
            });
        })
        .catch(() => {
          this.notification.showUnableToImport();
          stop(ref);
        })
    });
  }

  onNew() {
    if (this.gameService.fractions) {
      this.dialogService.showFractionSelection(this.gameService.fractions).subscribe(fraction => {
        if (fraction)
          this.router.navigateByUrl("/new/" + fraction.name);
      });
    } else {
      this.router.navigateByUrl("/new");
    }
  }

  saveBoss(): void {
    //    this.dialogService.openSaveBoss(() => this.fightLineController.serializeBoss())
    //      .then(result => {
    //        if (result !== null && result !== undefined) {
    //          this.fightLineController.updateBoss(result);
    //          this.notification.showBossSaved();
    //        }
    //      })
    //      .catch(reason => {
    //        this.notification.showBossNotSaved();
    //      });
  }

  saveFight(): void {
    if (!this.authenticationService.authenticated) {
      this.notification.showSignInRequired(() => { });
      return;
    }

    this.dialogService.openSaveFight(() => this.fightLineController.createSerializer().serializeFight())
      .then(result => {
        if (result !== null && result !== undefined) {
          this.recent.register({
            name: result.name,
            url: "/" + result.id.toLowerCase(),
            source: RecentActivitiesService.ActivitySource.Timeline,
            id: result.id.toLowerCase()
          });
          this.fightLineController.updateFight(result);
          this.location.replaceState(`/${result.id}`);
          this.notification.showFightSaved();
        }
      })
      .catch(reason => {
        console.log(reason);
        this.notification.showFightNotSaved();
      });
  }

  addJob(jobName: string, actorName?: string): void {
    this.fightLineController.addJob(null, jobName, actorName, null, false);
  }

  showHelp(): Promise<void> {
    const promise = new Promise<void>((resolve) => {
      this.dialogService.openHelp()
        .then(() => {
          this.storage.setString("help_shown", "yes");
          resolve();
        });
    });

    return promise;
  }

  openSettings(): void {
    this.dialogService.openSettings();
  }

  onUndo(): void {
    this.fightLineController.undo();
    this.planArea.refresh();
    this.onCommand({ name: "undo" });
  }

  onRedo(): void {
    this.fightLineController.redo();
    this.planArea.refresh();
    this.onCommand({ name: "redo" });
  }


  private startNew(fractionParam) {
    let fraction = null;
    if (this.gameService.fractions) {
      fraction = this.gameService.fractions.find(it => it.name === fractionParam);
    }
    this.fightLineController.fraction = fraction;
    this.toolbar.fraction = fraction;
    const settings = this.settingsService.load();
    this.presenterManager.setSettings(settings);

    if (settings && settings.main && settings.main.defaultView)
      this.fightLineController.applyView(settings.main.defaultView);
    if (settings && settings.main && settings.main.defaultFilter)
      this.fightLineController.applyFilter(settings.main.defaultFilter);

    this.fightService.newFight(this.fightLineController.fraction ? this.fightLineController.fraction.name : "")
      .subscribe(value => {
        this.fightId = value.id;
        this.location.replaceState("/" + value.id);
        this.recent.register({
          name: "New",
          url: "/" + value.id.toLowerCase(),
          source: RecentActivitiesService.ActivitySource.Timeline,
          id: value.id.toLowerCase()
        });
        this.startSession();
      },
        error => {
          console.log(error);
          this.notification.error("Unable to start");
        });
  }

  private loadFight(id) {
    this.fightId = id;
    this.dialogService.executeWithLoading(ref => {
      this.fightService
        .getFight(id)
        .subscribe((fight: M.IFight) => {
          if (fight) {

            this.recent.register({
              id: fight.id,
              name: fight.name,
              source: RecentActivitiesService.ActivitySource.Timeline,
              url: "/" + fight.id.toLowerCase()
            });

            const settings = this.settingsService.load();
            this.presenterManager.setSettings(settings);
            if (settings && settings.main && settings.main.defaultView)
              this.fightLineController.applyView(settings.main.defaultView);
            if (settings && settings.main && settings.main.defaultFilter)
              this.fightLineController.applyFilter(settings.main.defaultFilter);


            if (fight.data) {
              const data = JSON.parse(fight.data) as SerializeController.IFightSerializeData;
              if (data.view)
                this.presenterManager.view = data.view;
              if (data.filter)
                this.presenterManager.filter = data.filter;
            }

            const fraction = this.gameService.extractFraction(fight.game);

            this.fightLineController.fraction = fraction;
            this.toolbar.fraction = fraction;
            this.fightLineController.loadFight(fight);
            this.fightService.getCommands(this.fightId, new Date(fight.dateModified).valueOf())
              .subscribe(value => {
                for (var cmd of value) {
                  this.handleRemoteCommandData(JSON.parse(cmd.data));
                }
                this.connectToSession().then(() => {
                  this.planArea.setInitialWindow(this.fightLineController.getLatestBossAttackTime(), 2);
                  this.planArea.refresh();
                  ref.close();
                });
              },
                error => {
                  console.log(error);
                  this.notification.error("Unable to load data");
                  ref.close();
                });
          } else {
            ref.close();
          }
        },
          () => {
            this.notification.showUnableToLoadFight(() => { });
            ref.close();
          });
    });
  }

  private onStart(r: any): void {
    this.fflogsCode = null;
    this.showHelpForFirstTimers().then(() => {
      this.showWhatsNew().then(() => {
        const id = r["fightId"];
        if (id) {
          if (id === "new" || id === "dummy") {
            this.startNew(r["fraction"]);
          } else {
            this.loadFight(id);
          }
        } else {
          const boss = r["boss"];
          if (boss) {
            this.loadBoss(boss);
          } else {
            const code = r["code"];
            if (code) {
              this.fflogsCode = code;
              const enc = r["fight"];
              if (enc) {
                this.loadFFLogsData(code, Number.parseInt(enc));
              } else {
                this.importFromFFLogs(code);
              }
            }
          }
        }
      });
    });
  }

  loadBoss(bossId: string) {
    this.dialogService.executeWithLoading(ref => {

      const func = (fraction: M.IFraction, bossData: M.IBoss) => {
        this.fightService.newFight(fraction ? fraction.name : "")
          .subscribe(value => {
            this.fightId = value.id;
            this.location.replaceState("/" + value.id);
            this.startSession()
              .then(() => {
                const settings = this.settingsService.load();

                this.presenterManager.setSettings(settings);

                this.fightLineController.fraction = fraction;
                this.toolbar.fraction = fraction;
                this.fightLineController.applyView(settings.main.defaultView);
                this.fightLineController.applyFilter(settings.main.defaultFilter);

                this.fightLineController.loadBoss(bossData);
                this.planArea.setInitialWindow(this.fightLineController.getLatestBossAttackTime(), 2);
                this.planArea.refresh();
                ref.close();
              })
              .catch(error => {
                console.log((error));
                this.notification.error("Unable to start");
                ref.close();
              });
          },
            error => {
              console.log((error));
              this.notification.error("Unable to start fight");
              ref.close();
            });
      };

      this.fightService.getBoss(bossId).subscribe((data) => {
        if (this.gameService.fractions) {
          this.dialogService.showFractionSelection(this.gameService.fractions)
            .subscribe(fraction => {
              if (fraction)
                func(fraction, data);
              else {
                this.router.navigateByUrl("/");
                ref.close();
              }
            });
        } else {
          func(null, data);
        }
      },
        error => {
          console.log((error));
          this.notification.error("Unable to start");
          ref.close();
        });
    });
  }

  onCommand(data: ICommandData) {
    this.fightService.addCommand(this.fightId, JSON.stringify(data)).subscribe((result) => {
      this.fightHubService.sendCommand(this.fightId, "", result.id);
    });
    this.refreshSidePanel();
  }

  ngOnInit(): void {
    this.visStorage.clear();
    this.fightLineController = new FightTimeLineController(
      this.startDate,
      this.idgen,
      this.visStorage.playerContainer,
      this.visStorage.bossContainer,
      {
        openBossAttackAddDialog: this.openBossAttackAddDialog.bind(this),
        openAbilityEditDialog: this.openAbilityEditDialog.bind(this),
        openStanceSelector: this.openStanceSelector.bind(this)
      },
      this.gameService,
      this.settingsService,
      this.toolsManager,
      this.presenterManager
    );

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = "reload";
    this.fightLineController.downtimeChanged.subscribe(() => {
      this.toolsManager.refresh();
    });
    this.fightLineController.commandExecuted.subscribe((data: ICommandData) => {
      this.onCommand(data);
    });
    this.fightHubService.usersChanged.subscribe(() => {
      //console.log(this.fightHubService.users);
    });
    this.subscribeToDispatcher(this.dispatcher);

    this.route.params.subscribe(r => {
      setTimeout(() => { this.onStart(r); });
    });

    this.toolsManager.register(new DowntimeTool(this.planArea, this.fightLineController));
    this.toolsManager.register(new CopyPasteTool(this.fightLineController));
    //    this.toolsManager.register(new StickyAttacksTool(this.fightLineController));
  }

  startSession(): Promise<void> {
    if (!Environment.environment.production) {
      return Promise.resolve();
    }

    const promise = new Promise<void>((resolve, reject) => {
      const handlers: S.IStartSessionHandlers = {
        onCommand: ((data: M.IHubCommand) => this.handleRemoteCommand(data.id, data.userId)).bind(this),
        onConnected: ((data: M.IHubUser) => this.notification.showUserConnected(data)).bind(this),
        onDisconnected: ((data: M.IHubUser) => this.notification.showUserDisonnected(data)).bind(this)
      };

      const settings = this.settingsService.load();
      const name = settings.teamwork.displayName ||
        this.authenticationService.username ||
        "Anonymous";

      this.fightHubService.startSession(this.fightId, name, handlers)
        .then(() => {
          this.notification.showSessionStarted();
          resolve();
        })
        .catch(() => {
          this.notification.showUnableToStartSession();
          reject();
        });
    });
    return promise;
  }

  stopSession() {
    this.fightHubService.disconnect(this.fightId);
  }

  handleRemoteCommand(id: string, userId: string) {
    this.toolbar.ping(userId, false);

    this.fightService.getCommand(+id).subscribe((data: ICommandData) => {
      this.handleRemoteCommandData(data);
    },
      error => {
        console.log(error);
      });
  }

  handleRemoteCommandData(data: ICommandData) {
    if (data.name === "undo") {
      this.fightLineController.undo();
      this.planArea.refresh();
    } else if (data.name === "redo") {
      this.fightLineController.redo();
      this.planArea.refresh();
    } else {
      this.fightLineController.execute(data);
    }
  }

  connectToSession() {
    const handlers: S.IConnectToSessionHandlers = {
      onCommand: ((data: M.IHubCommand) => this.handleRemoteCommand(data.id, data.userId)).bind(this),
      onConnected: ((data: M.IHubUser) => this.notification.showUserConnected(data)).bind(this),
      onDisconnected: ((data: M.IHubUser) => this.notification.showUserDisonnected(data)).bind(this)
    };

    const settings = this.settingsService.load();
    const name = settings.teamwork.displayName || this.authenticationService.username || "Anonymous";
    return this.fightHubService.connect(this.fightId, name, handlers)
      .then(() => {
        this.notification.showConnectedToSession();
      })
      .catch(() => {
        this.notification.showConnectedToSessionError();
      });
  }

  showHelpForFirstTimers(): Promise<void> {
    if (!this.storage.getString("help_shown")) {
      return this.showHelp();
    }
    return Promise.resolve();
  }

  @HostListener("window:beforeunload", ["$event"])
  beforeUnloadHandler(event: any) {
    //    if (this.hasChanges && Environment.environment.showDialogOnUnload) {
    //      event.returnValue = "You have unsaved changes. Are you sure you want to leave?";
    //      return event.returnValue;
    //    }
    return null;
  }

  @HostListener("window:unload", ["$event"])
  unloadHandler(event: any) {
    this.stopSession();
  }

  get hasChanges(): boolean {
    return this.fightLineController.hasChanges;
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.stopSession();
    this.dispatcher.destroy();
  }

  showAsTable() {
    this.dialogService.openTable(() => this.fightLineController.createSerializer().serializeForExport());
  }

  openBossTemplates() {
    const boss = this.fightLineController.data.boss;
    this.dialogService.openBossTemplates(true, boss);
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

  private subscribeToDispatcher(dispatcher: S.DispatcherService) {
    dispatcher.on("SidePanel Similar Click").subscribe(value => {
      this.planArea.selectBossAttaks([value]);
      this.sidepanel.setItems(this.fightLineController.getItems([value]), this.fightLineController.getHolders());
    });

    dispatcher.on("SidePanel Similar All Click").subscribe(value => {
      this.planArea.selectBossAttaks(value);
      this.sidepanel.setItems(this.fightLineController.getItems(value), this.fightLineController.getHolders());
    });

    dispatcher.on("SidePanel Ability Click").subscribe(value => {
      this.planArea.selectAbilities([value]);
      this.sidepanel.setItems(this.fightLineController.getItems([value]), this.fightLineController.getHolders());
    });

    dispatcher.on("BossTemplates Save").subscribe(value => {
      const bossData = this.fightLineController.createSerializer().serializeBoss();

      if (bossData.id) {
        this.fightService.saveBoss(bossData).subscribe((e) => {
          this.notification.success("Boss saved");
          this.fightLineController.updateBoss(e);
          value.close();
        },
          (err) => {
            console.log(err);
            this.notification.error("Boss save failed");
          });
      } else {

        this.dialogService.openSaveBoss(value.name + " new template")
          .then(data => {
            if (data) {
              bossData.name = data;
              bossData.userName = bossData && bossData.userName || this.authenticationService.username;
              bossData.ref = bossData && bossData.ref || value.reference;
              bossData.isPrivate = bossData && bossData.isPrivate || value.isPrivate;
              bossData.game = this.gameService.name;

              this.fightService.saveBoss(bossData).subscribe((e) => {
                this.notification.success("Boss saved");
                this.fightLineController.updateBoss(e);
                value.close();
              },
                (err) => {
                  console.log(err);
                  this.notification.error("Boss save failed");
                });
            } else {
              value.close();
            }
          });
      }
    });

    dispatcher.on("BossTemplates Save as new").subscribe(value => {
      const bossData = this.fightLineController.createSerializer().serializeBoss();
      this.dialogService.openSaveBoss(value.name + " new template")
        .then(data => {
          if (data) {
            bossData.id = null;
            bossData.name = data;
            bossData.userName = bossData && bossData.userName || this.authenticationService.username;
            bossData.ref = bossData && bossData.ref || value.reference;
            bossData.isPrivate = bossData && bossData.isPrivate || value.isPrivate;
            bossData.game = this.gameService.name;

            this.fightService.saveBoss(bossData).subscribe((e) => {
              this.notification.success("Boss saved");
              this.fightLineController.updateBoss(e);
              value.close();
            },
              (err) => {
                console.log(err);
                this.notification.error("Boss save failed");
              });
          } else {
            value.close();
          }
        });

    });

    dispatcher.on("SettingsUpdate").subscribe(value => {
      this.fightLineController.colorSettings = this.settingsService.load().colors;
      this.planArea.refresh();
    });

    dispatcher.on("SidePanel Remove Job").subscribe(value => {
      this.fightLineController.removeJob(value);
      this.setSidePanel(null);
    });

    dispatcher.on("SidePanel Attack Copy").subscribe(value => {
      this.fightLineController.copy(value);
      this.toolsManager.setActive("Copy & Paste");
    });

    dispatcher.on("SidePanel Attack Edit Click").subscribe(value => {
      this.fightLineController.updateBossAttack(value);
    });



    dispatcher.on("Update Filter").subscribe(value => {
      this.updateFilter();
    });

    dispatcher.on("Update View").subscribe(value => {
      this.updateView();
    });

    dispatcher.on("SidePanel Ability Settings").subscribe(value => {
      this.fightLineController.editAbility(value.id);
    });

    dispatcher.on("SidePanel Ability Save Settings").subscribe(value => {
      this.fightLineController.updateAbilitySettings(value.id, value.settings);
    });

    dispatcher.on("SidePanel Hide Job Ability").subscribe(value => {
      this.fightLineController.hideAbility(value);
      this.setSidePanel(null);
    });

    dispatcher.on("SidePanel Clear Job Ability").subscribe(value => {
      this.fightLineController.clearAbility(value);
      this.setSidePanel(null);
    });

    dispatcher.on("SidePanel Fill Job Ability").subscribe(value => {
      this.fightLineController.combineAndExecute(this.fightLineController.fillAbility(value));
    });

    dispatcher.on("SidePanel Fill Job").subscribe(value => {
      this.fightLineController.combineAndExecute(this.fightLineController.fillJob(value));
    });

    dispatcher.on("SidePanel Restore Job Ability").subscribe(value => {
      this.fightLineController.showAbility(value);
    });
    dispatcher.on("SidePanel Toggle Job Compact View").subscribe(value => {
      this.fightLineController.toggleCompactView(value);
    });

    dispatcher.on("SidePanel Toggle Job Ability Compact View").subscribe(value => {
      this.fightLineController.toggleCompactViewAbility(value);
    });

    dispatcher.on("SidePanel Color Downtime").subscribe(value => {
      this.fightLineController.setDownTimeColor(value.id, value.color);
    });

    dispatcher.on("SidePanel Comment Downtime").subscribe(value => {
      this.fightLineController.setDownTimeComment(value.id, value.comment);
    });

    dispatcher.on("SidePanel Multiple Abilities Remove").subscribe(value => {
      this.fightLineController.handleDelete(value);
    });

    dispatcher.on("SidePanel Multiple Attacks Remove").subscribe(value => {
      this.fightLineController.handleDelete(value);
    });



    dispatcher.on("SidePanel Remove Downtime").subscribe(value => {
      this.fightLineController.removeDownTime(value);
      this.setSidePanel(null);
    });

    dispatcher.on("BossTemplates Load").subscribe(async value => {
      const source = this.fightLineController.data.importedFrom;
      if (source) {
        const parts = source.split(":");
        let bossHp = 0;

        const data = await this.gameService.dataService.getEvents(parts[0], Number(parts[1]), null);

        const enemyAttacks = data.events.filter((it: FF.AbilityEvent) => {
          if (it.sourceIsFriendly && FF.isDamageEvent(it)) {
            bossHp = it.targetResources.hitPoints / it.targetResources.maxHitPoints * 100;
          }

          it.bossHp = bossHp;
          return !it.sourceIsFriendly &&
            it.ability &&
            it.ability.name.toLowerCase() !== "attack" &&
            it.ability.name.trim() !== "" &&
            it.ability.name.indexOf("Unknown_") < 0
        }
        );
        const g = _.groupBy(enemyAttacks, d => d.ability.name + "_" + Math.trunc(d.timestamp / 1000));
        const attacks: FF.AbilityEvent[] = Object.keys(g).map((k: string) => {
          return g[k][0];
        });

        const bossData = JSON.parse(value.boss.data) as SerializeController.IBossSerializeData;
        const result = process(attacks, data.fight.start_time, bossData.attacks.map(it => it.ability), bossData.downTimes);
        bossData.attacks = result.map(it => <SerializeController.IBossAbilityUsageData>{
          ability: it,
          id: this.idgen.getNextId(M.EntryType.BossAttack)
        });
        value.boss.data = JSON.stringify(bossData);
        this.fightLineController.loadBoss(value.boss);
        value.close();

      } else {
        this.fightLineController.loadBoss(value.boss);
        value.close();
      }
    });
  }
}
