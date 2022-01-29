import { Component, OnInit, OnDestroy, Inject, ViewChild, HostListener, QueryList, ViewChildren } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SettingsService } from "../../services/SettingsService"
import * as S from "../../services/index"
import * as M from "../../core/Models";
import { NgProgressComponent } from "ngx-progressbar"

import { EachRowOneSecondTemplate } from "../../core/ExportTemplates/EachRowOneSecondTemplate"
import { BossAttackDefensiveTemplateV2 } from "../../core/ExportTemplates/BossAttackDefensiveTemplate"
import { ExportTemplate } from "../../core/BaseExportTemplate"
import * as Gameserviceprovider from "../../services/game.service-provider";
import * as Gameserviceinterface from "../../services/game.service-interface";

import * as FightTimeLineController from "../../core/FightTimeLineController";
import * as Generators from "../../core/Generators";
import * as PresentationManager from "../../core/PresentationManager";
import { ICommandData } from "src/core/UndoRedo";
import { DescriptiveTemplate } from "src/core/ExportTemplates/DescriptiveTemplate";
import { ExportData, IExportCell, IExportColumn, IExportResultSet, IExportRow, ITableOptions, ITableOptionSettings, NumberRangeOptionsSetting, TableOptionSettingType, TagsOptionsSetting } from "src/core/ExportModels";
import { VisStorageService } from "src/services/VisStorageService";
import { IFightSerializeData } from "src/core/SerializeController";
import { MitigationsTemplate } from "src/core/ExportTemplates/MitigationsTemplate";
import { PingComponent } from "src/components/ping/ping.component";
import { DispatcherPayloads } from "src/services/dispatcher.service";
import { Utils, startOffset } from "src/core/Utils";
import { Location } from "@angular/common";
import { SidepanelComponent } from "src/components/sidepanel/sidepanel.component";

@Component({
  selector: "tableview",
  templateUrl: "./tableview.component.html",
  styleUrls: ["./tableview.component.css"],
})
export class TableViewComponent implements OnInit, OnDestroy {
  startDate = new Date(startOffset);

  fightId: string;
  template: string;
  tableHeight: string = (window.innerHeight - 100)+"px";
  fightLineController: FightTimeLineController.FightTimeLineController;
  private idgen = new Generators.IdGenerator();
  presenterManager = new PresentationManager.PresenterManager();
  options: ITableOptionSettings;
  currentOptions: ITableOptions;
  filterData: { [name: string]: string[] } = {};

  @ViewChild("sidepanel", { static: true }) sidepanel: SidepanelComponent;
  @ViewChild("progressBar", { static: true }) progressBar: NgProgressComponent;
  @ViewChildren(PingComponent) pings: QueryList<PingComponent>;

  set: IExportResultSet = {
    columns: [],
    rows: [],
    title: "",
    filterByFirstEntry: false
  };

  filtered: IExportRow[] = [];
  pagesize = Number.MAX_VALUE;

  get showicon(): boolean {
    return this.currentOptions["co"].indexOf("icon") >= 0;
  };
  get showoffset(): boolean {
    return this.currentOptions["co"].indexOf("offset") >= 0;
  }

  get showtext(): boolean {
    return this.currentOptions["co"].indexOf("text") >= 0;
  }

  get showtarget(): boolean {
    return this.currentOptions["co"].indexOf("target") >= 0;
  }

  get iconSize(): number {
    return this.currentOptions["is"];
  }

  templates: { [name: string]: ExportTemplate } = {
    "defence": new BossAttackDefensiveTemplateV2(),        
    "onesecond": new EachRowOneSecondTemplate(),
    "descriptive": new DescriptiveTemplate(),
    "mitigations": new MitigationsTemplate()
  };


  public constructor(
    @Inject(S.fightServiceToken) private fightService: S.IFightService,
    @Inject(S.authenticationServiceToken) public authenticationService: S.IAuthenticationService,
    @Inject(Gameserviceprovider.gameServiceToken) private gameService: Gameserviceinterface.IGameService,
    private visStorage: VisStorageService,
    private notification: S.ScreenNotificationsService,
    private route: ActivatedRoute,
    private dialogService: S.DialogService,
    private location: Location,
    private router: Router,
    @Inject("DispatcherPayloads") private dispatcher: S.DispatcherService<DispatcherPayloads>,
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
    this.sidepanel.setSidePanel({ items: [id] });
  }


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

  ping(id: string, owner: boolean): void {
    const pingComponent = this.pings.find(it => it.id === id || (owner && it.owner === owner));
    if (pingComponent)
      pingComponent.ping();
  }


  ngOnInit(): void {
    this.visStorage.clear();
    this.fightLineController = new FightTimeLineController.FightTimeLineController(
      this.startDate,
      this.idgen,
      this.visStorage.holders,
      {
        openBossAttackAddDialog: () => { }
      },
      this.gameService,
      this.settingsService,
      this.presenterManager
    );


    this.location.path

    this.subscribeToDispatcher(this.dispatcher);

    this.route.params.subscribe(r => {
      const id = r["fightId"] as string;
      const template = r["template"] as string;
      if (id && template) {
        this.template = template;
        this.fightId = id;
        this.load(id);
      }
    });
  }

  private subscribeToDispatcher(dispatcher: S.DispatcherService<DispatcherPayloads>) {
    dispatcher.on("similarClick").subscribe(value => {
      this.sidepanel.setItems(this.fightLineController.getItems([value]));
    });

    dispatcher.on("similarAllClick").subscribe(value => {
      this.sidepanel.setItems(this.fightLineController.getItems(value));
    });

    dispatcher.on("abilityClick").subscribe(value => {
      this.sidepanel.setItems(this.fightLineController.getItems([value]));
    });
  }
  exported: ExportData;
  tpl: ExportTemplate;

  load(id) {
    this.dialogService.executeWithLoading("Loading...", ref => {
      this.fightService.getFight(id).subscribe((fight: M.IFight) => {
        if (fight) {
          this.fightService.getCommands(id, new Date(fight.dateModified).valueOf()).subscribe(value => {
            const loadedData = fight.data && JSON.parse(fight.data) as IFightSerializeData;
            this.fightLineController.loadFight(fight, loadedData, value.map(cmd => JSON.parse(cmd.data)));
            this.connectToSession()
              .finally(() => {
                const serializer = this.fightLineController.createSerializer()
                this.exported = serializer.serializeForExport();
                this.tpl = this.templates[this.template.toLowerCase()];
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
    if (!this.tpl) {
      this.notification.error("Table template not found");
      return;
    }

    if (!this.options) {
      const cellOptions: TagsOptionsSetting = {
        name: "co",
        "defaultValue": ["icon", "text", "target"],
        displayName: "Cell Options",
        type: TableOptionSettingType.Tags,
        description: "",
        options: {
          items: [
            { id: "icon", checked: true, text: "Icon" },
            { id: "text", checked: true, text: "Text" },
            { id: "offset", checked: false, text: "Offset" },
            { id: "target", checked: true, text: "Target" }
          ]
        }
      };

      const iconSize: NumberRangeOptionsSetting = {
        name: "is",
        "defaultValue": 16,
        displayName: "Icon Size",
        type: TableOptionSettingType.NumberRange,
        description: "Changes size of icons",
        options: {
          min: 16,
          max: 48
        }
      };

      this.options = [...(this.tpl.loadOptions(this.exported) || []), cellOptions, iconSize];

      const [_, search] = this.location.path().split("?")
      const params = new URLSearchParams(search);
      this.options.forEach(opts => {
        const p = params.get(opts.name);
        if (p != null) {
          opts.initialValue = parseOptions(opts.type, p);
          if (opts.type == TableOptionSettingType.Tags) {
            opts.options.items.forEach(opt => {
              opt.checked = opts.initialValue.indexOf(opt.id) >= 0
            })
          }
        }
      })

      this.currentOptions = this.options.reduce((acc, c) => {
        acc[c.name] = c.initialValue || c.defaultValue;
        return acc;
      }, {})

    }
    const context = { data: this.exported, presenter: this.presenterManager, jobRegistry: this.gameService.jobRegistry, options: this.currentOptions, holders: this.visStorage.holders };
    this.set = this.tpl.buildTable(context);

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
    this.ping(userId, false);

    this.fightService.getCommand(+id).subscribe((data: ICommandData) => {
      this.handleRemoteCommandData(data);
    },
      error => {
        console.log(error);
      });
  }

  handleRemoteCommandData(data: ICommandData) {
    this.fightLineController.execute(data);
    this.loadTable();
  }

  @HostListener("window:unload", ["$event"])
  unloadHandler(event: any) {
    this.stopSession();
  }

  @HostListener("window:resize", ["$event"])
  resizeHandler(event: any) {    
    this.tableHeight = (event.target.innerHeight-100)+"px"
  }

  trackByName(_: number, item: IExportColumn): string {
    return item.text;
  }

  optionsChanged(values: ITableOptions) {
    this.currentOptions = values;
    const serialized = Utils.serializeOptions(values, this.options);    
    const [path] = this.location.path().split("?");
    this.location.replaceState(path + "?" + serialized);
    this.loadTable();
  }

  ngOnDestroy(): void {
    this.dispatcher.destroy();
  }
}
function parseOptions(type: TableOptionSettingType, p: string): any {
  switch (type) {
    case TableOptionSettingType.Boolean:
      return p === "true";
    case TableOptionSettingType.NumberRange:
      return +p;
    case TableOptionSettingType.Tags:
      return p.split(",");
  }
}