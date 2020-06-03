import {Component, OnInit, OnDestroy, ViewChild, HostListener, Inject} from "@angular/core";
import {Location} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import * as _ from "lodash";
import {VisTimelineService, TimelineOptions, DataItem, DataGroup,DataSet} from "ngx-vis";

import {FightTimeLineController} from "../core/FightTimeLineController"
import * as M from "../core/Models";
import * as FF from "../core/FFLogs";
import {NgProgress, NgProgressComponent} from "ngx-progressbar"
import {Utils} from "../core/Utils"
import * as S from "../services/index"
import {process} from "../core/BossAttackProcessors"
import {FightLineContextMenuComponent} from "./contextmenu/contextmenu.component"
import {ToolbarComponent} from "../toolbar/toolbar.component"
import {SidepanelComponent} from "../sidepanel/sidepanel.component"
import {ClassNameBuilder} from "../core/ClassNameBuilder"
import {IdGenerator} from "../core/Generators"
import {DownTimesController} from "../core/DownTimesController"
import {ICommandData} from "../core/UndoRedo"
import * as Gameserviceprovider from "../services/game.service-provider";
import * as Gameserviceinterface from "../services/game.service-interface";
import * as SerializeController from "../core/SerializeController";
import * as Environment from "../environments/environment";
import {SelectionController} from "../core/SelectionController";

@Component({
  selector: "fightline",
  templateUrl: "./fightline.component.html",
  styleUrls: ["./fightline.component.css"],
})
export class FightLineComponent implements OnInit, OnDestroy {
  startDate = new Date(946677600000);
  visTimeline: string = "timeLineMain";
  visTimelineBoss: string = "timeLineBoss";
  fightId: string;
  private fflogsCode: string = null;

  @ViewChild("contextMenu", {static: true})
  contextMenu: FightLineContextMenuComponent;
  @ViewChild("sidepanel", {static: true})
  sidepanel: SidepanelComponent;
  @ViewChild("toolbar", {static: true})
  toolbar: ToolbarComponent;
  @ViewChild("progressBar", {static: true})
  progressBar: NgProgressComponent;

  fightLineController: FightTimeLineController;

  items: DataSet<DataItem>;
  groups: DataSet<DataGroup>;
  itemsBoss: DataSet<DataItem>;
  groupsBoss: DataSet<DataGroup>;

  private idgen = new IdGenerator();
  private downTimesController: DownTimesController;
  private selectionController: SelectionController;

  jobs = this.gameService.jobRegistry.getJobs();


  sideNavOpened: boolean;

  tool: string;
  options: TimelineOptions = {
    width: "100%",
    height: "100%",
    minHeight: "300px",
    autoResize: true,
    start: this.startDate,
    end: new Date(new Date(this.startDate).setMinutes(30)),
    max: new Date(new Date(this.startDate).setMinutes(30)),
    min: new Date(new Date(this.startDate.valueOf() as number - 30 * 1000)),
    zoomable: true,
    zoomMin: 3 * 60 * 1000,
    zoomMax: 30 * 60 * 1000,
    zoomKey: "ctrlKey",
    moveable: true,
    type: "range",
    multiselect: true,
    multiselectPerGroup: true,
    format: Utils.format(this.startDate),
    stack: true,
    showCurrentTime: false,
    stackSubgroups: true,
    groupOrder: (a: any, b: any) => {
      return -(a.value || a.sValue) + (b.value || b.sValue);
    },
    editable: {remove: true, updateTime: true, add: true},
    horizontalScroll: true,
    margin: {item: {horizontal: 0, vertical: 5}},
    onRemove: (item: any, callback: any) => {
      callback(null);
      this.fightLineController.handleDelete(this.visTimelineService.getSelection(this.visTimeline));
    },
    onMoving: (item: any, callback: any) => {
      if (this.fightLineController.canMove(item)) {
        callback(item);
      } else {
        callback(null);
      }
    },
    onMove: (item: any, callback: any) => {
      callback(item);
      this.fightLineController.notifyMove(item);
    },
    onAdd: (item: any, callback: any) => {
      callback(null);
      if (this.downTimesController.isInBossDownTimeMode) {
        this.downTimesController.registerPoint(item.start);
      } else {
        console.log(item);
        this.fightLineController.notifyDoubleClick(null, item.group, item.start);
      }
    },
    onUpdate: (item: any, callback: any) => {
      callback(null);
      this.fightLineController.notifyDoubleClick(item.id, item.group, item.start);
    },
    visibleFrameTemplate: (item: any) => this.fightLineController.visibleFrameTemplate(item),
    tooltipOnItemUpdateTime: {
      template: (item: any) => this.fightLineController.tooltipOnItemUpdateTime(item)
    },
    snap: (date: Date) => date,
    groupEditable: {order: false}
  };
  optionsBoss: TimelineOptions = {
    width: "100%",
    height: "100%",
    minHeight: "50px",
    autoResize: true,
    start: this.startDate,
    end: new Date(new Date(this.startDate).setMinutes(30)),
    max: new Date(new Date(this.startDate).setMinutes(30)),
    min: new Date(new Date(this.startDate.valueOf() as number - 30 * 1000)),
    zoomable: true,
    zoomMin: 3 * 60 * 1000,
    zoomMax: 30 * 60 * 1000,
    zoomKey: "ctrlKey",
    moveable: true,
    tooltip: {
      followMouse: false,
      overflowMethod: "flip"
    },
    type: "box",
    multiselect: true,
    showCurrentTime: false,
    stack: true,
    orientation: "none",
    stackSubgroups: true,
    groupOrder: "id",
    editable: {remove: true, updateTime: true, add: true},
    horizontalScroll: true,
    margin: {item: {horizontal: 0, vertical: 5}},
    onRemove: (item: any, callback: any) => {
      callback(null);
      this.fightLineController.handleDelete(this.visTimelineService.getSelection(this.visTimelineBoss));
    },
    onMoving: (item: any, callback: any) => {
      if (this.fightLineController.canMove(item)) {
        callback(item);
        this.fightLineController.moveBossAttack(item);
      } else {
        callback(null);
      }
    },
    onMove: (item: any, callback: any) => {
      callback(item);
      this.fightLineController.notifyMove(item);
    },
    onAdd: (item: any, callback: any) => {
      callback(null);
      if (this.downTimesController.isInBossDownTimeMode) {
        this.downTimesController.registerPoint(item.start);
      } else {
        console.log(item);
        this.fightLineController.notifyDoubleClick(null, item.group, item.start);
      }
    },
    tooltipOnItemUpdateTime: {
      template: (item: any) => this.fightLineController.tooltipOnItemUpdateTime(item)
    },
    onUpdate: (item: any, callback: any) => {
      callback(null);
      this.fightLineController.notifyDoubleClick(item.id, item.group, item.start);
    },
    snap: (date: Date) => date
  };

  public constructor(
    private recent: S.RecentActivityService,
    private visTimelineService: VisTimelineService,
    @Inject(S.fightServiceToken) private fightService: S.IFightService,
    @Inject(Gameserviceprovider.gameServiceToken) private gameService: Gameserviceinterface.IGameService,
    private notification: S.ScreenNotificationsService,
    private progressService: NgProgress,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private dialogService: S.DialogService,
    private changeNotesService: S.ChangeNotesService,
    @Inject(S.authenticationServiceToken) public authenticationService: S.IAuthenticationService,
    private settingsService: S.SettingsService,
    private storage: S.LocalStorageService,
    public fightHubService: S.FightHubService,
    private dispatcher: S.DispatcherService) {

    this.items = new DataSet<DataItem>([], {});
    this.groups = new DataSet<DataGroup>([], {});
    this.itemsBoss = new DataSet<DataItem>([], {});
    this.groupsBoss = new DataSet<DataGroup>([], {});


    this.fightLineController = new FightTimeLineController(
      this.startDate,
      this.idgen,
      {items: this.items, groups: this.groups},
      {items: this.itemsBoss, groups: this.groupsBoss},
      {
        openBossAttackAddDialog: this.openBossAttackAddDialog.bind(this),
        openAbilityEditDialog: this.openAbilityEditDialog.bind(this),
        openStanceSelector: this.openStanceSelector.bind(this)
      },
      this.gameService,
      this.settingsService);

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = "reload";
    this.downTimesController = new DownTimesController(
      this.visTimelineService,
      this.visTimelineBoss,
      this.fightLineController);
    this.fightLineController.downtimeChanged.subscribe(() => {
      this.downTimesController.modeChanged(this.downTimesController.isInBossDownTimeMode);
    });
    this.fightLineController.commandExecuted.subscribe((data: ICommandData) => {
      this.fightHubService.sendCommand(this.fightId, "", data);
    });
    this.fightHubService.usersChanged.subscribe(() => {
      console.log(this.fightHubService.users);
    });
    this.subscribeToDispatcher(this.dispatcher);
  }

  timelineBossInitialized(): void {
    this.visTimelineService.setOptions(this.visTimelineBoss, this.optionsBoss);
  }

  private openStanceSelector(data: M.IContextMenuData[]): void {
    this.contextMenu.openStanceSelector(data);
  }

  timelineInitialized(): void {
    console.log("timeline initialized");
    this.visTimelineService.setOptions(this.visTimeline, this.options);

    this.visTimelineService.on(this.visTimeline, "click");
    this.visTimelineService.on(this.visTimeline, "doubleClick");
    this.visTimelineService.on(this.visTimelineBoss, "click");
    this.visTimelineService.on(this.visTimeline, "contextmenu");
    this.visTimelineService.on(this.visTimelineBoss, "contextmenu");
    this.visTimelineService.on(this.visTimeline, "select");
    this.visTimelineService.on(this.visTimelineBoss, "select");
    this.visTimelineService.on(this.visTimeline, "timechanged");
    this.visTimelineService.on(this.visTimelineBoss, "timechanged");
    this.visTimelineService.on(this.visTimeline, "timechange");
    this.visTimelineService.on(this.visTimeline, "rangechange");
    this.visTimelineService.on(this.visTimelineBoss, "rangechange");

    this.visTimelineService.rangechange
      .subscribe((eventData: any[]) => {
        const event: any = eventData[1];
        if (event.byUser) {
          this.visTimelineService.setWindow(eventData[0] === this.visTimeline ? this.visTimelineBoss : this.visTimeline,
            event.start,
            event.end,
            {
              animation: false
            });
        }
      });

    this.visTimelineService.contextmenu.subscribe((eventData: any[]) => {
      const event: any = eventData[1];
      this.contextMenu.openMenu(eventData, this.fightLineController.getContextMenuItems(eventData[1]));

      event.event.preventDefault();
      event.event.stopPropagation();

    });

    this.visTimelineService.select.subscribe((eventData: any[]) => {
      this.updateSelection(eventData);
    });

    this.visTimelineService.timechanged.subscribe((eventData: any[]) => {
      console.log(eventData);
      this.fightLineController.notifyTimeChanged(eventData[1].id, eventData[1].time as Date);
    });

    this.visTimelineService.click.subscribe((eventData: any[]) => {
      if (eventData[0] === this.visTimeline) {
        if (eventData[1].what === "group-label") {
          this.fightLineController.notifySelect("group", [eventData[1].group]);
          this.visTimelineService.setSelectionToIds(this.visTimeline, []);
          this.visTimelineService.setSelectionToIds(this.visTimelineBoss, []);
          this.setSidePanel(eventData);
        }
      }
      if (eventData[1].what === "background" || eventData[1].what === null) {
        this.updateSelection(eventData);
      }
    });

    this.visTimelineService.doubleClick.subscribe((eventData: any[]) => {
      console.log(eventData);
      if (eventData[0] === this.visTimeline) {
        if (eventData[1].what === "group-label" && eventData[1].event.type === "dblclick") {
          if (!this.fightLineController.isJobGroup(eventData[1].group)) {
            this.fightLineController.toggleCompactViewAbility(eventData[1].group);
            this.fightLineController.applyFilter();
            setTimeout(() => this.refresh());
          } else {
            this.fightLineController.toggleJobCollapsed(eventData[1].group);
            this.fightLineController.applyFilter();
            setTimeout(() => this.refresh());
          }
        }
      }
    });

  }

  useTool(tool: string) {
    this.tool = tool;
    const tools: M.ITools = {
      downtime: tool === "Downtime",
      stickyAttacks: tool === "Sticky Attacks"
    };

    this.onBossDownTimeChanged(tools.downtime);
    this.fightLineController.updateTools(tools);
  }

  exportToTable() {
    this.dialogService.openExportToTable(() => this.fightLineController.createSerializer().serializeForExport());
  }

  private updateSelection(eventData: any[]): void {
    if (eventData[0] === this.visTimeline) {
      this.visTimelineService.setSelectionToId(this.visTimelineBoss, "");
      this.setSelectionOfBossAttacks([]);
      console.log(eventData[1]);
      this.fightLineController.notifySelect("friend", eventData[1].items);

    }
    if (eventData[0] === this.visTimelineBoss) {
      this.visTimelineService.setSelectionToId(this.visTimeline, "");
      console.log(eventData[1]);
      this.setSelectionOfBossAttacks(eventData[1].items);
      this.fightLineController.notifySelect("boss", eventData[1].items);
    }

    this.setSidePanel(eventData);
  }

  private setSidePanel(eventData) {
    if (eventData && (eventData[1].items && eventData[1].items.length > 0 || eventData[1].group)) {
      const items = this.fightLineController.getItems(eventData[1].items || [eventData[1].group]);
      if (items && items.length > 0) {
        this.sidepanel.setItems(items, this.fightLineController.getHolders());
        if (!this.sideNavOpened)
          this.sideNavOpened = true;
      }
    } else {
      this.sidepanel.setItems([], null);
      if (this.sideNavOpened)
        this.sideNavOpened = false;
    }
  }

  private setSelectionOfBossAttacks(ids: string[]): void {
    const toUpdate: any[] = [];

    const items = this.items.get();
    items.forEach((it: DataItem) => {
      const b = new ClassNameBuilder(it.className);
      const have = !!ids && ids.some((e => "bossAttack_" + e === it.id) as any);
      b.set({"selected": have});
      if (b.isChanged()) {
        it.className = b.build();
        toUpdate.push(it);
      }
    });
    this.items.update(toUpdate);
  }

  onCommand(command: {name: string, data?: any}) {
    if (command.name === "delete") {
      const selected = [
        ...this.visTimelineService.getSelection(this.visTimeline),
        ...this.visTimelineService.getSelection(this.visTimelineBoss)
      ];
      this.fightLineController.handleDelete(selected);
    }else
    if (command.name === "undo") {
      this.undo();
    }else
    if (command.name === "redo") {
      this.redo();
    } else
    if (command.name === "move") {
      this.fightLineController.moveSelection(command.data.delta);
    }
  }

  updateFilter($data?: M.IFilter): void {
    this.fightLineController.applyFilter($data);
    setTimeout(() => this.refresh());
  }

  updateView($data: M.IView): void {
    this.fightLineController.applyView($data);
    setTimeout(() => this.refresh());
  }

  openBossAttackAddDialog(bossAbility: M.IBossAbility, callBack: (b: any) => void): void {
    this.dialogService.openBossAttackAddDialog(bossAbility, callBack);
  }

  onBossDownTimeChanged(value: boolean) {
    if (value !== this.downTimesController.isInBossDownTimeMode) {
      this.downTimesController.isInBossDownTimeMode = value;
      this.downTimesController.toggle(this.downTimesController.isInBossDownTimeMode);
    }
  }

  openAbilityEditDialog(data: {ability: M.IAbility, settings: M.IAbilitySetting[], values: M.IAbilitySettingData[]},
    callBack: (b: any) => void): void {
    this.dialogService.openAbilityEditDialog(data, callBack);
  }

  load(): void {
    if (!this.authenticationService.authenticated) {
      this.notification.showSignInRequired(() => {});
      return;
    }

    this.dialogService.openLoad();
  }

  refresh(): void {
    this.visTimelineService.redraw(this.visTimeline);
    this.visTimelineService.redraw(this.visTimelineBoss);
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
    this.dialogService.executeWithLoading(ref => {
      this.progressBar.start();
      this.gameService.dataService.getEvents(code, enc, percentage => this.progressBar.set(percentage))
        .then((parser) => {
          this.fightService.newFight("")
            .subscribe(value => {
                this.fightId = value.id;
                this.location.replaceState("/" + value.id);
                this.startSession().then(() => {
                  this.recent.register("FFLogs " + parser.fight.name, "/fflogs/" + code + "/" + enc);
                  const settings = this.settingsService.load();

                  this.toolbar.setSettings(settings);
                  this.fightLineController.applyView(settings.main.defaultView);
                  this.fightLineController.applyFilter(settings.main.defaultFilter);

                  this.fightLineController.importFromFFLogs(code + ":" + enc, parser);
                });
              },
              error => {
                console.log(error);
                this.notification.error("Unable to start");
              });
        })
        .catch(() => {
          this.notification.showUnableToImport();
        })
        .finally(() => {
          this.progressBar.complete();
          this.setInitialWindow(this.fightLineController.getLatestAbilityUsageTime(), 2);
          this.refresh();
          ref.close();
        });
    });
  }

  onNew() {
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

  private setInitialWindow(date: Date, mins: number): void {

    const eDate = (date || this.startDate).getMinutes() + mins;

    setTimeout(() => {
      const endDate = new Date(this.startDate.valueOf() as number + Math.max(eDate, 3) * 60 * 1000);
      this.visTimelineService.setWindow(this.visTimeline, this.startDate, endDate, {animation: false});
      this.visTimelineService.setWindow(this.visTimelineBoss, this.startDate, endDate, {animation: false});
    });
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
      this.notification.showSignInRequired(() => {});
      return;
    }

    this.dialogService.openSaveFight(() => this.fightLineController.createSerializer().serializeFight())
      .then(result => {
        if (result !== null && result !== undefined) {
          this.recent.register(result.name, "/" + result.id);
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

  undo(): void {

    this.fightLineController.undo();
    this.fightHubService.sendCommand(this.fightId, "", {name: "undo"});
    this.refresh();

  }

  redo(): void {
    this.fightLineController.redo();
    this.fightHubService.sendCommand(this.fightId, "", {name: "redo"});
    this.refresh();
  }

  private onStart(r: any): void {
    this.fflogsCode = null;
    this.showHelpForFirstTimers().then(() => {
      this.showWhatsNew().then(() => {
        const id = r["fightId"];
        if (id === "new" || id === "dummy") {
          let fraction = null;
          if (this.gameService.fractions) {
            fraction = this.gameService.fractions.find(it => it.name === r["fraction"]);
          }
          this.fightLineController.fraction = fraction;
          this.toolbar.fraction = fraction;
          const settings = this.settingsService.load();
          this.onBossDownTimeChanged(false);

          this.toolbar.setSettings(settings);
          if (settings && settings.main && settings.main.defaultView)
            this.fightLineController.applyView(settings.main.defaultView);
          if (settings && settings.main && settings.main.defaultFilter)
            this.fightLineController.applyFilter(settings.main.defaultFilter);

          this.fightService.newFight(this.fightLineController.fraction ? this.fightLineController.fraction.name : "")
            .subscribe(value => {
                this.fightId = value.id;
                this.location.replaceState("/" + value.id);
                this.startSession();
              },
              error => {
                console.log((error));
                this.notification.error("Unable to start");
              });
          return;
        }
        if (id) {
          this.fightId = id;
          this.dialogService.executeWithLoading(ref => {
            this.fightService
              .getFight(id)
              .subscribe((fight: M.IFight) => {
                  if (fight) {
                    this.recent.register(fight.name, "/" + id.toLowerCase());
                    if (fight.data) {
                      const data = JSON.parse(fight.data) as SerializeController.IFightSerializeData;
                      if (data.view)
                        this.toolbar.view.set(data.view);
                      if (data.filter)
                        this.toolbar.filter.set(data.filter);
                    }

                    const fraction = this.gameService.extractFraction(fight.game);

                    this.fightLineController.fraction = fraction;
                    this.toolbar.fraction = fraction;
                    this.fightLineController.loadFight(fight);
                    this.fightService.getCommands(this.fightId, new Date(fight.dateModified).valueOf())
                      .subscribe(value => {
                          for (var cmd of value) {
                            this.handleRemoteCommand(JSON.parse(cmd.data), "");
                          }
                          this.setInitialWindow(this.fightLineController.getLatestBossAttackTime(), 2);
                          this.connectToSession().then(() => {
                            this.refresh();
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
                  this.notification.showUnableToLoadFight(() => this.router.navigateByUrl("/"));
                  ref.close();
                });
          });

        } else {
          const boss = r["boss"];
          if (boss) {
            this.loadBoss(boss);
            return;
          }

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
              this.startSession().then(() => {
                const settings = this.settingsService.load();

                this.toolbar.setSettings(settings);

                this.fightLineController.fraction = fraction;
                this.toolbar.fraction = fraction;
                this.fightLineController.applyView(settings.main.defaultView);
                this.fightLineController.applyFilter(settings.main.defaultFilter);

                this.fightLineController.loadBoss(bossData);
                this.setInitialWindow(this.fightLineController.getLatestBossAttackTime(), 2);
                this.refresh();
                ref.close();
              });
            },
            error => {
              console.log((error));
              this.notification.error("Unable to start");
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
      });
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(r => {
      setTimeout(() => {this.onStart(r);});
    });
  }

  startSession(): Promise<void> {
    if (!Environment.environment.production) {
      return Promise.resolve();
    }

    const promise = new Promise<void>((resolve, reject) => {
      const handlers: S.IStartSessionHandlers = {
        onCommand: ((data: M.IHubCommand) => this.handleRemoteCommand(JSON.parse(data.body), data.userId)).bind(this),
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

  handleRemoteCommand(data: ICommandData, userId: string) {
    this.toolbar.ping(userId, false);

    if (data.name === "undo") {
      this.fightLineController.undo();
      this.refresh();
    } else if (data.name === "redo") {
      this.fightLineController.redo();
      this.refresh();
    } else {
      this.fightLineController.execute(data);
    }
  }

  connectToSession() {
    const handlers: S.IConnectToSessionHandlers = {
      onCommand: ((data: M.IHubCommand) => this.handleRemoteCommand(JSON.parse(data.body), data.userId)).bind(this),
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
    this.visTimelineService.off(this.visTimeline, "click");
    this.visTimelineService.off(this.visTimeline, "doubleClick");
    this.visTimelineService.off(this.visTimelineBoss, "click");
    this.visTimelineService.off(this.visTimeline, "contextmenu");
    this.visTimelineService.off(this.visTimeline, "select");
    this.visTimelineService.off(this.visTimelineBoss, "select");
    this.visTimelineService.off(this.visTimeline, "timechanged");
    this.visTimelineService.off(this.visTimeline, "timechange");
    this.visTimelineService.off(this.visTimeline, "rangechange");
    this.visTimelineService.off(this.visTimelineBoss, "rangechange");

    this.stopSession();
    this.subs.forEach(e => e.unsubscribe());
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

  subs = [];


  private subscribeToDispatcher(dispatcher: S.DispatcherService) {
    this.subs.push(dispatcher.on("SidePanel Similar Click").subscribe(value => {
      this.visTimelineService.setSelectionToId(this.visTimelineBoss, value);
      this.setSelectionOfBossAttacks([value]);
      this.fightLineController.notifySelect("enemy", [value]);
      this.visTimelineService.focusOnId(this.visTimelineBoss, value, {animation: false});
      const w = this.visTimelineService.getWindow(this.visTimelineBoss);
      this.visTimelineService.setWindow(this.visTimeline, w.start, w.end, {animation: false});
      this.sidepanel.setItems(this.fightLineController.getItems([value]), this.fightLineController.getHolders());
    }));
    this.subs.push(dispatcher.on("SidePanel Similar All Click").subscribe(value => {
      this.visTimelineService.setSelectionToIds(this.visTimelineBoss, value);
      this.setSelectionOfBossAttacks(value);
      this.fightLineController.notifySelect("enemy", value);
      this.visTimelineService.focusOnIds(this.visTimelineBoss, value, {animation: false});
      const w = this.visTimelineService.getWindow(this.visTimelineBoss);
      this.visTimelineService.setWindow(this.visTimeline, w.start, w.end, {animation: false});
      this.sidepanel.setItems(this.fightLineController.getItems(value), this.fightLineController.getHolders());
    }));

    this.subs.push(dispatcher.on("SidePanel Ability Click").subscribe(value => {
      this.visTimelineService.setSelectionToId(this.visTimeline, value);
      this.visTimelineService.setSelectionToId(this.visTimelineBoss, value);
      this.setSelectionOfBossAttacks([]);
      this.fightLineController.notifySelect("friend", [value]);
      this.visTimelineService.focusOnId(this.visTimeline, value, {animation: false});
      const w = this.visTimelineService.getWindow(this.visTimeline);
      this.visTimelineService.setWindow(this.visTimelineBoss, w.start, w.end, {animation: false});
      this.sidepanel.setItems(this.fightLineController.getItems([value]), this.fightLineController.getHolders());
    }));

    this.subs.push(dispatcher.on("BossTemplates Save").subscribe(value => {
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
    }));

    this.subs.push(dispatcher.on("BossTemplates Save as new").subscribe(value => {
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

    }));

    this.subs.push(dispatcher.on("SettingsUpdate").subscribe(value => {
      this.fightLineController.colorSettings = this.settingsService.load().colors;
      this.refresh();
    }));

    this.subs.push(dispatcher.on("SidePanel Remove Job").subscribe(value => {
      this.fightLineController.removeJob(value);
      this.setSidePanel(null);
    }));

    this.subs.push(dispatcher.on("SidePanel Hide Job Ability").subscribe(value => {
      this.fightLineController.hideAbility(value);
      this.setSidePanel(null);
    }));
    this.subs.push(dispatcher.on("SidePanel Restore Job Ability").subscribe(value => {
      this.fightLineController.showAbility(value);
    }));

    this.subs.push(dispatcher.on("BossTemplates Load").subscribe(value => {
      const source = this.fightLineController.data.importedFrom;
      if (source) {
        const parts = source.split(":");
        this.gameService.dataService.getEvents(parts[0], Number(parts[1]), null).then(data => {
          const enemyAttacks = data.events.map(it => it as FF.AbilityEvent).filter(it => !it.sourceIsFriendly &&
            it.ability &&
            it.ability.name.toLowerCase() !== "attack" &&
            it.ability.name.trim() !== "" &&
            it.ability.name.indexOf("Unknown_") < 0);
          const g = _.groupBy(enemyAttacks, d => d.ability.name + "_" + Math.trunc(d.timestamp / 1000));
          const attacks = Object.keys(g).map((k: string) => {
            return g[k][0];
          });

          const bossData = JSON.parse(value.boss.data) as SerializeController.IBossSerializeData;
          const result = process(attacks, data.fight.start_time, bossData.attacks.map(it => it.ability));
          bossData.attacks = result.map(it => <SerializeController.IBossAbilityUsageData>{
            ability: it,
            id: this.idgen.getNextId(M.EntryType.BossAttack)
          });
          value.boss.data = JSON.stringify(bossData);
          this.fightLineController.loadBoss(value.boss);
          value.close();
        });
      } else {
        this.fightLineController.loadBoss(value.boss);
        value.close();
      }
    }));
  }
}
