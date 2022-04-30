import { Component, OnInit, OnDestroy, ViewChild, HostListener, Inject, QueryList, ViewChildren, Renderer2 } from "@angular/core";
import { Location } from "@angular/common";
import { ActivatedRoute, Params, Router } from "@angular/router";
import * as _ from "lodash";
import { FightTimeLineController } from "../../core/FightTimeLineController";
import * as M from "../../core/Models";
import * as FF from "../../core/FFLogs";
import { NgProgressComponent } from "ngx-progressbar";
import * as S from "../../services/index";
import { process } from "../../core/BossAttackProcessors";
import { SidepanelComponent } from "../../components/sidepanel/sidepanel.component";
import { PlanAreaComponent, Action, EventSource } from "./planArea/planArea.component";
import { ToolsManager, CopyPasteTool, DowntimeTool } from "../../core/ToolsManager";
import { PresenterManager } from "../../core/PresentationManager";

import { IdGenerator } from "../../core/Generators";
import { ICommandData } from "../../core/UndoRedo";
import * as Gameserviceprovider from "../../services/game.service-provider";
import * as Gameserviceinterface from "../../services/game.service-interface";
import * as SerializeController from "../../core/SerializeController";
import * as Environment from "../../environments/environment";
import { VisStorageService } from "src/services/VisStorageService";
import { PingComponent } from "../../components/ping/ping.component";
import { ActivitySource } from "src/services/RecentActivitiesService";
import { DispatcherPayloads } from "src/services/dispatcher.service";

@Component({
  selector: "fightline",
  templateUrl: "./fightline.component.html",
  styleUrls: ["./fightline.component.css"],
})
export class FightLineComponent implements OnInit, OnDestroy {
  startDate = new Date(946677600000);

  fightId: string;
  fflogsCode: string = null;

  @ViewChild("sidepanel", { static: true })
  sidepanel: SidepanelComponent;
  @ViewChild("progressBar", { static: true })
  progressBar: NgProgressComponent;
  @ViewChild("planArea", { static: true })
  planArea: PlanAreaComponent;
  @ViewChildren(PingComponent) pings: QueryList<PingComponent>;

  fightLineController: FightTimeLineController;
  subs: any[] = [];

  private idgen = new IdGenerator();
  toolsManager = new ToolsManager();
  private presenterManager: PresenterManager;
  jobs = this.gameService.jobRegistry.getJobs();


  public constructor(
    private recent: S.RecentActivityService,
    @Inject(S.fightServiceToken) private fightService: S.IFightService,
    @Inject(Gameserviceprovider.gameServiceToken) public gameService: Gameserviceinterface.IGameService,
    @Inject(S.authenticationServiceToken) public authenticationService: S.IAuthenticationService,
    @Inject("DispatcherPayloads") private dispatcher: S.DispatcherService<DispatcherPayloads>,
    private notification: S.ScreenNotificationsService,
    private visStorage: VisStorageService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private dialogService: S.DialogService,
    private settingsService: S.SettingsService,
    private storage: S.LocalStorageService,
    public fightHubService: S.FightHubService
  ) {
    this.presenterManager = visStorage.presenter;
  }

  onAction(event: Action) {
    if (this.toolsManager.handleAction(event)) { return; }

    const actionName = "on" + event.name[0].toUpperCase() + event.name.slice(1);
    if (this[actionName]) {
      this[actionName](event.source, event.payload);
    }
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

  useTool(t) {
    this.toolsManager.setActive(t);
  }

  onClickEmpty(source: EventSource, event) {
    const downtimesAtTime = this.fightLineController.getDowntimesAtTime(event.time);
    if (downtimesAtTime.length > 0 && (source === "boss" || (source === "player" && this.presenterManager.view.showDowntimesInPartyArea))) {
      event.items = downtimesAtTime.map(d => d.id);
      this.planArea.clearSelection();

      this.setSidePanel(event);
    }
    else {
      this.planArea.updateSelection(source, event);
    }
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
        this.presenterManager.save(this.storage, this.fightId);
      } else {
        this.fightLineController.toggleJobCollapsed(event.group);
        this.presenterManager.save(this.storage, this.fightId);
      }
      setTimeout(() => this.planArea.refresh());
    }
  }

  onGroupOrderSwap(source: EventSource, event) {
    if (source === "player") {
      const from = event.from;
      const to = event.to;
      const fromJob = this.visStorage.holders.jobs.get(from.id);
      if (fromJob) {
        const toJob = this.visStorage.holders.jobs.get(to.id);
        if (toJob) {
          event.handler(true);
          const fromAbs = this.visStorage.holders.abilities.getByParentId(fromJob.id);
          fromAbs.forEach(ab => {
            ab.applyData
          });
        }
      }
      else {
        const abFrom = this.visStorage.holders.abilities.get(from.id);
        const abTo = this.visStorage.holders.abilities.get(to.id);
        if (abTo && abFrom && abTo.job.id === abFrom.job.id) {
          const ind = abFrom.index;
          abFrom.index = abTo.index;
          abTo.index = ind;
          event.handler(true);
        }
      }
    }
  }

  onTimeChanged(source: EventSource, event) {
    this.fightLineController.notifyTimeChanged(event.id, event.date);
    this.sidepanel.refresh();
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
      const html = this.fightLineController.visibleFrameTemplate(event.item);
      event.handler(html);
    }
  }

  onCanMove(source: EventSource, event) {
    const canMove = this.fightLineController.canMove(event.item, event.selection);
    if (canMove && source === "boss") {
      this.fightLineController.moveBossAttack(event.item);
    }
    event.handler(canMove);
  }

  onItemTooltip(source: EventSource, event) {
    event.handler(this.fightLineController.tooltipOnItemUpdateTime(event.item));
  }

  onTable(temlate: string) {
    window.open(this.router.serializeUrl(this.router.createUrlTree(["/table", this.fightId || "dummy", temlate])), "_blank");
  }

  // private openStanceSelector(data: M.IContextMenuData[]): void {
  //   //    this.contextMenu.openStanceSelector(data);
  // }

  exportToTable() {
  }



  private setSidePanel(eventData) {
    this.sidepanel.setSidePanel(eventData);
  }

  updateFilter(source?: string): void {
    this.fightLineController.applyFilter(null, source);
    this.presenterManager.save(this.storage, this.fightId);
  }

  updateView($data?: M.IView): void {
    this.fightLineController.applyView($data);
    this.presenterManager.save(this.storage, this.fightId);
    setTimeout(() => this.planArea.refresh());
  }

  openBossAttackAddDialog(bossAbility: M.IBossAbility, callBack: (b: any) => void): void {
    this.dialogService.openBossAttackAddDialog(bossAbility, this.presenterManager, callBack);
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
        if (!result) { return; }
        this.router.navigateByUrl("fflogs/" + result.reportId + "/" + result.fightId);
      });
  }

  importBossAttacksFromFFLogs(code: string = null): void {
    this.dialogService
      .openImportFromFFLogs(code || this.fflogsCode)
      .then(result => {
        if (!result) { return; }
        this.replaceBossFFLogsData(result.reportId, result.fightId);
      });
  }

  loadFFLogsData(code: string, enc: number) {
    const stop = (ref: { close: () => void; }) => {
      this.progressBar.complete();
      ref.close();
    };

    this.dialogService.executeWithLoading("Loading...", ref => {
      this.progressBar.start();
      this.gameService.dataService.getEvents(code, enc, {}, percentage => this.progressBar.set(percentage * 100))
        .then((parser) => {
          this.fightService.newFight("").subscribe(value => {
            this.fightId = value.id;
            this.location.replaceState("/" + value.id);
            this.startSession()
              .then(() => {
                this.recent.register({
                  name: parser.fight.name,
                  source: ActivitySource.FFLogs,
                  timestamp: new Date(),
                  url: "/" + value.id.toLowerCase(),
                  id: value.id.toLowerCase(),
                });
                const settings = this.settingsService.load();

                try {
                  this.presenterManager.setSettings(settings);
                  this.fightLineController.importFromFFLogs(code + ":" + enc, parser);
                  this.planArea.setInitialWindow(this.fightLineController.getLatestAbilityUsageTime(), 2);
                  this.planArea.refresh();
                }
                catch (error) {
                  this.notification.error("We are unable to load this fight. Dev team is already informed about this case");
                }
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
        .catch((error) => {
          console.error(error);
          this.notification.showUnableToImport();
          stop(ref);
        });
    });
  }

  replaceBossFFLogsData(code: string, enc: number) {
    const stop = (ref: { close: () => void; }) => {
      this.progressBar.complete();
      ref.close();
    };

    this.dialogService.executeWithLoading("Importing...", ref => {
      this.progressBar.start();
      this.gameService.dataService.getEvents(code, enc, { bossAttacksOnly: true }, percentage => this.progressBar.set(percentage * 100))
        .then((parser) => {

          try {
            this.fightLineController.importAttacksFromFFLogs(code + ":" + enc, parser);
            this.planArea.refresh();
          }
          catch (error) {
            this.notification.error("We are unable to load this fight. Dev team is already informed about this case");
          }
          stop(ref);
        })
        .catch((error) => {
          console.error(error);
          this.notification.showUnableToImport();
          stop(ref);
        });
    });
  }

  onNew() {
    this.router.navigateByUrl("/new");
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
            source: ActivitySource.Timeline,
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


  private startNew() {
    this.dialogService.executeWithLoading("Starting...", ref => {
      this.presenterManager.reset();

      const settings = this.settingsService.load();
      this.presenterManager.setSettings(settings);

      this.fightService.newFight("").subscribe(
        value => {
          this.fightId = value.id;
          this.location.replaceState("/" + value.id);
          this.recent.register({
            name: "New",
            url: "/" + value.id.toLowerCase(),
            source: ActivitySource.Timeline,
            id: value.id.toLowerCase()
          });
          this.startSession().finally(() => {
            ref.close();
          });
        },
        error => {
          console.log(error);
          this.notification.error("We are unable to connect to server. Your actions will not be stored.");
          ref.close();
        });
    });
  }

  private loadFight(id) {
    this.dialogService.executeWithLoading("Loading...", ref => {
      this.presenterManager.reset();
      this.fightId = id;
      this.fightService.getFight(id).subscribe((fight: M.IFight) => {
        if (fight) {
          this.recent.register({
            id: fight.id,
            name: fight.name,
            source: ActivitySource.Timeline,
            url: "/" + fight.id.toLowerCase()
          });

          const settings = this.settingsService.load();
          this.presenterManager.setSettings(settings);

          const loadedData = fight.data && JSON.parse(fight.data) as SerializeController.IFightSerializeData;
          if (loadedData.filter) {
            this.presenterManager.filter = loadedData.filter;
          }
          if (loadedData.view) {
            this.presenterManager.view = loadedData.view;
          }

          this.presenterManager.load(this.storage, fight.id);

          const fraction = this.gameService.extractFraction(fight.game);
          this.fightLineController.fraction = fraction;

          this.fightService.getCommands(this.fightId, new Date(fight.dateModified).valueOf())
            .subscribe(commands => {
              this.connectToSession().then(() => {
                this.planArea.setInitialWindow(this.fightLineController.getLatestBossAttackTime(), 2);
                this.planArea.refresh();
              }).finally(() => {
                try {
                  this.fightLineController.loadFight(fight, loadedData, commands.map(cmd => JSON.parse(cmd.data)));
                }
                catch (error) {
                  this.notification.error("We are unable to load this fight. Dev team is already informed about this case");
                }
                ref.close();
              });
            }, error => {
              console.log(error);
              this.notification.error("Unable to load data");
              ref.close();
            }, () => {

            });
        } else {
          ref.close();
        }
      }, () => {
        this.notification.showUnableToLoadFight(() => { });
        ref.close();
      });
    });
  }

  private onStart(r: Params): void {
    this.fflogsCode = null;
    const id = r.fightId;
    if (id) {
      if (id.indexOf("dummy") === 0) {
        this.loadFight("");
      } else if (id === "new") {
        this.startNew();
      } else {
        this.loadFight(id);
      }
    } else {
      const boss = r.boss;
      if (boss) {
        this.loadBoss(boss);
      } else {
        const code = r.code;
        if (code) {
          this.fflogsCode = code;
          const enc = r.fight;
          if (enc) {
            this.loadFFLogsData(code, +enc);
          } else {
            this.importFromFFLogs(code);
          }
        }
      }
    }
  }

  loadBoss(bossId: string) {
    this.dialogService.executeWithLoading("Loading...", ref => {
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
        func(null, data);
      },
        error => {
          console.log((error));
          this.notification.error("Unable to start");
          ref.close();
        });
    });
  }

  onCommand(data: ICommandData) {
    console.log("adding command in fightline.onCOmmand");
    this.fightService.addCommand(this.fightId, JSON.stringify(data)).subscribe((result) => {
      this.fightHubService.sendCommand(this.fightId, "", result.id);
    });
    this.sidepanel.refresh();
  }

  ngOnInit(): void {
    this.visStorage.clear();
    this.fightLineController = new FightTimeLineController(
      this.startDate,
      this.idgen,
      this.visStorage.holders,
      {
        openBossAttackAddDialog: this.openBossAttackAddDialog.bind(this),
        // openAbilityEditDialog: this.openAbilityEditDialog.bind(this),
        // openStanceSelector: null
      },
      this.gameService,
      this.settingsService,
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
      // console.log(this.fightHubService.users);
    });
    this.subscribeToDispatcher(this.dispatcher);

    this.route.params.subscribe(r => {
      setTimeout(() => { this.onStart(r); });
    });

    this.toolsManager.register(new DowntimeTool(this.planArea, this.fightLineController));
    this.toolsManager.register(new CopyPasteTool(this.fightLineController));

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
    this.ping(userId, false);

    this.fightService.getCommand(+id).subscribe((data: ICommandData) => {
      this.handleRemoteCommandData(data);
    }, error => {
      console.log(error);
    });
  }

  ping(id: string, owner: boolean): void {
    const pingComponent = this.pings.find(it => it.id === id || (owner && it.owner === owner));
    if (pingComponent) {
      pingComponent.ping();
    }
  }

  handleRemoteCommandData(data: ICommandData) {
    this.fightLineController.execute(data);
    this.planArea.refresh();
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

  attachPreset(data: { name: string, preset: M.IPresetTemplate }) {
    this.fightLineController.execute({
      name: "attachPreset",
      params: {
        id: data.name,
        preset: data.preset
      }
    });
  }

  exportData(format) {
    const saveData = (() => {
      const a = document.createElement("a");
      a.style.display = "none";
      document.body.appendChild(a);
      return (data: Blob, fileName: string) => {
        const url = window.URL.createObjectURL(data);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      };
    })();

    const serializer = this.fightLineController.createSerializer();
    const exported = serializer.serializeForDownload();
    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
    saveData(blob, "data.json");
  }

  private subscribeToDispatcher(dispatcher: S.DispatcherService<DispatcherPayloads>) {

    dispatcher.on("similarClick").subscribe(value => {
      this.planArea.selectBossAttaks([value]);
      this.sidepanel.setItems(this.fightLineController.getItems([value]));
    });

    dispatcher.on("similarAllClick").subscribe(value => {
      this.planArea.selectBossAttaks(value);
      this.sidepanel.setItems(this.fightLineController.getItems(value));
    });

    dispatcher.on("abilityClick").subscribe(value => {
      this.planArea.selectAbilities([value]);
      this.sidepanel.setItems(this.fightLineController.getItems([value]));
    });

    dispatcher.on("bossTemplateSave").subscribe(value => {
      const bossData = this.fightLineController.createSerializer().serializeBoss();

      if (bossData.id) {
        this.fightService.saveBoss(bossData).subscribe((e) => {
          this.notification.success("Boss saved");
          this.fightLineController.updateBoss(e);
          value.close();
        },
          (err) => {
            console.error(err);
            this.notification.error("Boss save failed");
          });
      } else {
        this.dialogService.openSaveBoss(value.name + " new template").then(data => {
          if (data) {
            bossData.name = data;
            bossData.userName = bossData && bossData.userName || this.authenticationService.username;
            bossData.ref = bossData && bossData.ref || value.reference;
            bossData.isPrivate = bossData && bossData.isPrivate || value.isPrivate;
            bossData.game = this.gameService.name;

            this.fightService.saveBoss(bossData).subscribe(
              (e) => {
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

    dispatcher.on("changeJobStats").subscribe(value => {
      this.fightLineController.setJobStats(value.id, value.data);
    });

    dispatcher.on("toggleAttackPin").subscribe(value => {
      this.fightLineController.toggleBossAttackPin(value);
    });

    dispatcher.on("bossTemplateSaveAsNew").subscribe(value => {
      const bossData = this.fightLineController.createSerializer().serializeBoss();
      this.dialogService.openSaveBoss(value.name + " new template").then(data => {
        if (data) {
          bossData.id = null;
          bossData.name = data;
          bossData.userName = bossData && bossData.userName || this.authenticationService.username;
          bossData.ref = bossData && bossData.ref || value.reference;
          bossData.isPrivate = bossData && bossData.isPrivate || value.isPrivate;
          bossData.game = this.gameService.name;

          this.fightService.saveBoss(bossData).subscribe(
            (e) => {
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

    dispatcher.on("updateSettings").subscribe(() => {
      this.fightLineController.colorSettings = this.settingsService.load().colors;
      this.planArea.refresh();
    });

    dispatcher.on("removeJob").subscribe(value => {
      this.fightLineController.removeJob(value);
      this.setSidePanel(null);
    });

    dispatcher.on("attackCopy").subscribe(value => {
      this.fightLineController.copy(value);
      this.toolsManager.setActive("Copy & Paste");
    });

    dispatcher.on("attackEdit").subscribe(value => {
      this.fightLineController.updateBossAttack(value);
    });



    dispatcher.on("updateFilter").subscribe(value => {
      this.updateFilter();
    });

    dispatcher.on("updateView").subscribe(value => {
      this.updateView();
    });

    // dispatcher.on("SidePanel Ability Settings").subscribe(value => {
    //   this.fightLineController.editAbility(value.id);
    // });

    dispatcher.on("abilitySaveSettings").subscribe(value => {
      this.fightLineController.updateAbilitySettings(value.id, value.settings);
    });

    dispatcher.on("hideJobAbility").subscribe(value => {
      this.fightLineController.hideAbility(value);
      this.setSidePanel(null);
      this.presenterManager.save(this.storage, this.fightId);
    });

    dispatcher.on("clearJobAbility").subscribe(value => {
      this.fightLineController.clearAbility(value);
      this.setSidePanel(null);
    });

    dispatcher.on("fillJobAbility").subscribe(value => {
      this.fightLineController.combineAndExecute(this.fightLineController.fillAbility(value));
    });

    dispatcher.on("fillJob").subscribe(value => {
      this.fightLineController.combineAndExecute(this.fightLineController.fillJob(value));
    });

    dispatcher.on("jobAbilityRestoreAll").subscribe(value => {
      const hidden = [...this.presenterManager.jobFilter(value).abilityHidden];
      hidden?.forEach(h => {
        const ab = this.visStorage.holders.abilities.getByParentAndAbility(value, h);
        this.fightLineController.showAbility(ab.id);
      });
      this.presenterManager.save(this.storage, this.fightId);
    });

    dispatcher.on("jobAbilityRestore").subscribe(value => {
      this.fightLineController.showAbility(value);
      this.presenterManager.save(this.storage, this.fightId);
    });


    dispatcher.on("toggleJobCompactView").subscribe(value => {
      this.fightLineController.toggleJobCompactView(value);
      this.fightLineController.applyFilter();
      this.presenterManager.save(this.storage, this.fightId);
    });

    dispatcher.on("toggleJobAbilityCompactView").subscribe(value => {
      this.fightLineController.toggleCompactViewAbility(value);
      // this.fightLineController.applyFilter();
      this.presenterManager.save(this.storage, this.fightId);
    });

    dispatcher.on("downTimeColor").subscribe(value => {
      this.fightLineController.setDownTimeColor(value.id, value.color);
    });

    dispatcher.on("downtimeComment").subscribe(value => {
      this.fightLineController.setDownTimeComment(value.id, value.comment);
    });

    dispatcher.on("abilitiesRemove").subscribe(value => {
      this.fightLineController.handleDelete(value);
    });

    dispatcher.on("attacksRemove").subscribe(value => {
      this.fightLineController.handleDelete(value);
    });

    dispatcher.on("downtimeRemove").subscribe(value => {
      this.fightLineController.removeDownTime(value);
      this.setSidePanel(null);
    });

    dispatcher.on("selectDowntimes").subscribe(value => {
      this.setSidePanel({
        items: [value],
      });
    });

    dispatcher.on("bossTemplatesLoad").subscribe(async value => {
      this.dialogService.executeWithLoading("Loading...", async ref => {
        const stop = (dialog: { close: () => void; }) => {
          value.close();
          this.progressBar.complete();
          dialog.close();
        };

        this.progressBar.start();
        const source = this.fightLineController.data.importedFrom;
        if (source) {
          const [code, fight] = source.split(":");
          const parser = await this.gameService.dataService.getEvents(
            code,
            +fight,
            { bossAttacksOnly: true },
            percentage => this.progressBar.set(percentage * 100));

          const enemyAttacks = parser.events.filter((it: FF.AbilityEvent) => {
            return !it.sourceIsFriendly &&
              it.ability &&
              it.ability.name.toLowerCase() !== "attack" &&
              it.ability.name.trim() !== "" &&
              it.ability.name.indexOf("Unknown_") < 0;
          }
          );
          const g = _.groupBy(enemyAttacks as FF.AbilityEvent[], d => d.ability.name + "_" + Math.trunc(d.timestamp / 1000));
          const attacks: FF.AbilityEvent[] = Object.keys(g).map((k: string) => {
            return g[k][0];
          });

          const bossData = JSON.parse(value.boss.data) as SerializeController.IBossSerializeData;
          const result = process(attacks, parser.fight.start_time, bossData.attacks.map(it => it.ability), bossData.downTimes);
          bossData.attacks = result.map(it => ({
            ability: it,
            id: this.idgen.getNextId(M.EntryType.BossAttack)
          }) as SerializeController.IBossAbilityUsageData);
          value.boss.data = JSON.stringify(bossData);
          this.fightLineController.loadBoss(value.boss);
          stop(ref);
        } else {
          this.fightLineController.loadBoss(value.boss);
          stop(ref);
        }
      });

    });
  }
}
