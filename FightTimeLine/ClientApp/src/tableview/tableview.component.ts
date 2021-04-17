import { Component, OnInit, OnDestroy, Inject, ViewChild, NgZone, HostListener } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SettingsService } from "../services/SettingsService"
import * as S from "../services/index"
import * as M from "../core/Models";

import { ToolbarComponent } from "../toolbar/toolbar.component"
import { SidepanelComponent } from "../sidepanel/sidepanel.component"
import { NgProgressComponent } from "ngx-progressbar"

import { EachRowOneSecondTemplate } from "../core/ExportTemplates/EachRowOneSecondTemplate"
import { BossAttackDefensiveTemplate } from "../core/ExportTemplates/BossAttackDefensiveTemplate"
import { ExportTemplate } from "../core/BaseExportTemplate"
import * as Gameserviceprovider from "../services/game.service-provider";
import * as Gameserviceinterface from "../services/game.service-interface";

import * as FightTimeLineController from "../core/FightTimeLineController";
import * as Generators from "../core/Generators";
import * as PresentationManager from "../core/PresentationManager";
import { ICommandData } from "src/core/UndoRedo";
import { DescriptiveTemplate } from "src/core/ExportTemplates/DescriptiveTemplate";
import { IExportCell, IExportColumn, IExportResultSet, IExportRow } from "src/core/ExportModels";
import { VisStorageService } from "src/services/VisStorageService";
import { IFightSerializeData } from "src/core/SerializeController";




@Component({
  selector: "tableview",
  templateUrl: "./tableview.component.html",
  styleUrls: ["./tableview.component.css"],
})
export class TableViewComponent implements OnInit, OnDestroy {
  startDate = new Date(946677600000);

  fightId: string;
  template: string;
  fightLineController: FightTimeLineController.FightTimeLineController;
  private idgen = new Generators.IdGenerator();
  presenterManager = new PresentationManager.PresenterManager();
  sideNavOpened: boolean = false;

  @ViewChild("sidepanel", { static: true })
  sidepanel: SidepanelComponent;
  @ViewChild("toolbar", { static: true })
  toolbar: ToolbarComponent;
  @ViewChild("progressBar", { static: true })
  progressBar: NgProgressComponent;

  set: IExportResultSet = {
    columns: [],
    rows: [],
    title: "",
    filterByFirstEntry: false
  };

  filtered: IExportRow[] = [];
  pagesize = Number.MAX_VALUE;

  templates: { [name: string]: ExportTemplate } = {
    "defence": new BossAttackDefensiveTemplate(false, false),
    "defencecover": new BossAttackDefensiveTemplate(true, false),
    "defenceaf": new BossAttackDefensiveTemplate(false, true),
    "defencecoveraf": new BossAttackDefensiveTemplate(true, true),
    "onesecond": new EachRowOneSecondTemplate(),
    "descriptive": new DescriptiveTemplate()
  };


  public constructor(
    @Inject(S.fightServiceToken) private fightService: S.IFightService,
    @Inject(S.authenticationServiceToken) public authenticationService: S.IAuthenticationService,
    @Inject(Gameserviceprovider.gameServiceToken) private gameService: Gameserviceinterface.IGameService,
    private visStorage: VisStorageService,
    private notification: S.ScreenNotificationsService,
    private route: ActivatedRoute,
    private dialogService: S.DialogService,
    private ngZone: NgZone,
    private router: Router,
    private dispatcher: S.DispatcherService,
    public fightHubService: S.FightHubService,
    private settingsService: SettingsService) {
  }



  home() {
    this.router.navigateByUrl("/");
  }

  select(id: any, $event?: any) {
    if ($event) {
      $event.stopPropagation();
      $event.preventDefault();
    }
    this.setSidePanel(id);
  }

  private setSidePanel(id: string) {
    this.ngZone.run(() => {
      if (id) {
        const items = this.fightLineController.getItems([id]);
        if (items && items.length > 0) {
          this.sidepanel.setItems(items, "table");
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

  filterData: { [name: string]: string[] } = {};

  filterChange(event: any, column: string) {
    if (column) {
      this.filterData[column] = event;
    }
    const cellFilter = this.filterCell();
    this.filtered = this.set.rows.filter(row => {
      const visible = this.set.columns.every(c => {
        const v = !c.filterFn || !this.filterData[c.name] || c.filterFn(this.filterData[c.name], row, c)
        return v;
      });

      if (visible)
        row.cells.forEach((cell, index) => cellFilter(cell, this.filterData[this.set.columns[index].name]));

      return visible;
    });
  }


  filterCell() {
    let unique = new Set();
    const fn = (cell: IExportCell, data: string[]) => {
      cell.items.forEach(it => {
        it.visible = true;
        if (it.filterFn && data && !it.filterFn(data)) {
          it.visible = false;
          return;
        }
        else {
          if (cell.disableUnique) return;
          if (it.refId && unique.has(it.refId)) {
            it.visible = false;
          } else {
            it.visible = true;
            unique.add(it.refId)
          }
        }
      });
    };
    return fn;
  }

  ngOnInit(): void {
    this.visStorage.clear();
    this.fightLineController = new FightTimeLineController.FightTimeLineController(
      this.startDate,
      this.idgen,
      this.visStorage.holders,
      {
        openBossAttackAddDialog: () => { },
        // openAbilityEditDialog: () => { },
        // openStanceSelector: () => { }
      },
      this.gameService,
      this.settingsService,
      this.presenterManager
    );

    this.subscribeToDispatcher(this.dispatcher);


    this.route.params.subscribe(r => {
      const id = r["fightId"] as string;
      const template = r["template"] as string;
      if (id && template) {
        this.template = template;
        this.fightId = id;
        this.load(id, template);
      }
    });
  }

  private subscribeToDispatcher(dispatcher: S.DispatcherService) {
    dispatcher.on("SidePanel Similar Click").subscribe(value => {
      this.sidepanel.setItems(this.fightLineController.getItems([value]));
    });

    dispatcher.on("SidePanel Similar All Click").subscribe(value => {
      this.sidepanel.setItems(this.fightLineController.getItems(value));
    });

    dispatcher.on("SidePanel Ability Click").subscribe(value => {
      this.sidepanel.setItems(this.fightLineController.getItems([value]));
    });
  }

  load(id, template) {
    this.dialogService.executeWithLoading(ref => {
      this.fightService.getFight(id).subscribe((fight: M.IFight) => {
        if (fight) {
          this.fightService.getCommands(id, new Date(fight.dateModified).valueOf()).subscribe(value => {
            const loadedData = fight.data && JSON.parse(fight.data) as IFightSerializeData;
            this.fightLineController.loadFight(fight, loadedData, value.map(cmd => JSON.parse(cmd.data)));
            this.connectToSession()
              .finally(() => {
                this.loadTable();
                ref.close();
              });
          }, error => {
            console.error(error);
            ref.close();
            this.notification.error("Unable to load data");
          });
        } else {
          ref.close();
          this.notification.showUnableToLoadFight(() => { });
        }
      }, (error) => {
        console.error(error);
        this.notification.showUnableToLoadFight(() => { });
        ref.close();
      });
    });
  }

  private loadTable() {
    const serializer = this.fightLineController.createSerializer()
    const exported = serializer.serializeForExport();
    this.set = this.templates[this.template.toLowerCase()].build(exported, this.presenterManager, this.gameService.jobRegistry);
    this.filterChange(null, null);
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
    } else if (data.name === "redo") {
      this.fightLineController.redo();
    } else {
      this.fightLineController.execute(data);
    }
    this.loadTable();
  }

  @HostListener("window:unload", ["$event"])
  unloadHandler(event: any) {
    this.stopSession();
  }

  trackByName(_: number, item: IExportColumn): string {
    return item.text;
  }



  ngOnDestroy(): void {

  }
}
