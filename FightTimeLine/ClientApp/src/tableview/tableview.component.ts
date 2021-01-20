import { Component, OnInit, OnDestroy, Inject, ViewChild, NgZone } from "@angular/core";
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
import { IExportResultSet, IExportColumn, IExportCell, IExportRow } from "../core/BaseExportTemplate"
import * as Gameserviceprovider from "../services/game.service-provider";
import * as Gameserviceinterface from "../services/game.service-interface";

import { VisStorageService } from "../services";
import * as FightTimeLineController from "../core/FightTimeLineController";
import * as Generators from "../core/Generators";
import * as ToolsManager from "../core/ToolsManager";
import * as PresentationManager from "../core/PresentationManager";


@Component({
  selector: "tableview",
  templateUrl: "./tableview.component.html",
  styleUrls: ["./tableview.component.css"],
})
export class TableViewComponent implements OnInit, OnDestroy {
  startDate = new Date(946677600000);

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
    "defence": new BossAttackDefensiveTemplate(),
    "defencecover": new BossAttackDefensiveTemplate(true),
    "onesecond": new EachRowOneSecondTemplate()
  };


  public constructor(
    @Inject(S.fightServiceToken) private fightService: S.IFightService,
    private visStorage: VisStorageService,
    private notification: S.ScreenNotificationsService,
    private route: ActivatedRoute,
    private dialogService: S.DialogService,
    private ngZone: NgZone,
    @Inject(S.authenticationServiceToken) public authenticationService: S.IAuthenticationService,
    private router: Router,
    private dispatcher: S.DispatcherService,
    @Inject(Gameserviceprovider.gameServiceToken) private gameService: Gameserviceinterface.IGameService,
    private settingsService: SettingsService) {
  }

  fightLineController: FightTimeLineController.FightTimeLineController;
  private idgen = new Generators.IdGenerator();
  toolsManager = new ToolsManager.ToolsManager();
  presenterManager = new PresentationManager.PresenterManager();
  sideNavOpened: boolean = false;

  home() {
    this.router.navigateByUrl("/");
  }

  select(id, $event) {
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
          this.sidepanel.setItems(items, this.fightLineController.getHolders(), "table");
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

  filterData = {};

  filterChange(event: any, column: string) {
    if (column) {
      this.filterData[column] = event;
    }
    const cellFilter = this.filterCell();
    this.filtered = this.set.rows.filter(row => {
      const visible = this.set.columns.every(c => {
        return !c.filterFn || !this.filterData[c.name] || c.filterFn(this.filterData[c.name], row, c)
      });

      if (visible)
        row.cells.forEach(cell => cellFilter(cell));

      return visible;
    });    
  }


  filterCell() {
    let unique = new Set();
    const fn = (cell: IExportCell) => {
      if (cell.disableUnique) return;
      cell.items.forEach(it => {
        if (!it.refId) return;
        if (unique.has(it.refId)) {
          it.visible = false;
        } else {
          it.visible = true;
          unique.add(it.refId)
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
      this.visStorage.playerContainer,
      this.visStorage.bossContainer,
      {
        openBossAttackAddDialog: () => { },
        openAbilityEditDialog: () => { },
        openStanceSelector: () => { }
      },
      this.gameService,
      this.settingsService,
      this.toolsManager,
      this.presenterManager
    );

    this.subscribeToDispatcher(this.dispatcher);


    this.route.params.subscribe(r => {
      const id = r["fightId"] as string;
      const template = r["template"] as string;
      if (id && template) {
        this.load(id, template);
      }
    });
  }

  private subscribeToDispatcher(dispatcher: S.DispatcherService) {
    dispatcher.on("SidePanel Similar Click").subscribe(value => {
      this.sidepanel.setItems(this.fightLineController.getItems([value]), this.fightLineController.getHolders());
    });

    dispatcher.on("SidePanel Similar All Click").subscribe(value => {
      this.sidepanel.setItems(this.fightLineController.getItems(value), this.fightLineController.getHolders());
    });

    dispatcher.on("SidePanel Ability Click").subscribe(value => {
      this.sidepanel.setItems(this.fightLineController.getItems([value]), this.fightLineController.getHolders());
    });
  }

  load(id, template) {
    this.dialogService.executeWithLoading(ref => {
      this.fightService.getFight(id).subscribe((fight: M.IFight) => {
        if (fight) {
          this.fightService.getCommands(id, new Date(fight.dateModified).valueOf()).subscribe(value => {
            this.fightLineController.loadFight(fight, value.map(cmd => JSON.parse(cmd.data)));

            const serializer = this.fightLineController.createSerializer()
            const exported = serializer.serializeForExport();
            this.set = this.templates[template.toLowerCase()].build(exported, this.presenterManager) as IExportResultSet;
            this.filterChange(null, null);

            ref.close();
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

  getWidth(text: string, hasIcon) {
    if (hasIcon)
      return "auto";
    switch (text) {
      case "time":
        return "50px";
      case "boss":
        return "200px";
      case "target":
        return "65px";
    }
    return "";
  }



  trackByName(_: number, item: IExportColumn): string {
    return item.text;
  }

  getTitle(text: string) {
    switch (text) {
      case "time":
        return "Time";
      case "boss":
        return "Attack name";
      case "target":
        return "Target";
    }
    return text;
  }

  ngOnDestroy(): void {

  }
}
