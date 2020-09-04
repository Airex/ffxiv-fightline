import { Component, OnInit, OnDestroy, Inject, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { SettingsService } from "../services/SettingsService"
import { LocalStorageService } from "../services/LocalStorageService"
import * as S from "../services/index"
import * as M from "../core/Models";

import { ToolbarComponent } from "../toolbar/toolbar.component"
import { SidepanelComponent } from "../sidepanel/sidepanel.component"
import { NgProgressComponent } from "ngx-progressbar"

import { EachRowOneSecondTemplate } from "../core/ExportTemplates/EachRowOneSecondTemplate"
import { BossAttackDefensiveTemplate } from "../core/ExportTemplates/BossAttackDefensiveTemplate"
import { ExportTemplate, ExportData } from "../core/BaseExportTemplate"
import { IExportResultSet } from "../core/BaseExportTemplate"
import * as Gameserviceprovider from "../services/game.service-provider";
import * as Gameserviceinterface from "../services/game.service-interface";
import * as SerializeController from "../core/SerializeController";

import { VisStorageService } from "../services";
import * as UndoRedo from "../core/UndoRedo";
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
    title : ""
  };
  columnNames: string[];
  templates: { [name: string] : ExportTemplate} ={
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
    @Inject(S.authenticationServiceToken) public authenticationService: S.IAuthenticationService,
    private router: Router,
    private storage: LocalStorageService,
    @Inject(Gameserviceprovider.gameServiceToken) private gameService: Gameserviceinterface.IGameService,
    private settingsService: SettingsService) {
  }

  fightLineController: FightTimeLineController.FightTimeLineController;
  private idgen = new Generators.IdGenerator();
  toolsManager = new ToolsManager.ToolsManager();
  presenterManager = new PresentationManager.PresenterManager();

  home() {
    this.router.navigateByUrl("/");
  }

  ngOnInit(): void {
    this.visStorage.clear();
    this.fightLineController = new FightTimeLineController.FightTimeLineController(
      this.startDate,
      this.idgen,
      this.visStorage.playerContainer,
      this.visStorage.bossContainer,
      {
        openBossAttackAddDialog: () => {},
        openAbilityEditDialog: () => {},
        openStanceSelector: () => {}
      },
      this.gameService,
      this.settingsService,
      this.toolsManager,
      this.presenterManager
    );


    this.route.params.subscribe(r => {
      const id = r["fightId"] as string;
      const template = r["template"] as string;
      if (id && template) {
//        const settings = this.settingsService.load();
        this.load(id, template);
      }
    });
  }

  initTable() {

  }

  load(id, template) {
    this.dialogService.executeWithLoading(ref => {
      this.fightService
        .getFight(id)
        .subscribe((fight: M.IFight) => {
          if (fight) {
            //this.recent.register(fight.name, "/" + id.toLowerCase());

//            const settings = this.settingsService.load();
//            this.toolbar.setSettings(settings);

            this.fightService.getCommands(id, new Date(fight.dateModified).valueOf())
              .subscribe(value => {
                for (var cmd of value) {
                  const parsed = JSON.parse(cmd.data) as UndoRedo.ICommandData;
                  this.fightLineController.execute(parsed);
                  const sr = this.fightLineController.createSerializer()
                  const exported = sr.serializeForExport();
                  const d = this.templates[template.toLowerCase()].build(exported);
                  this.columnNames = d.columns.map(it => it.text);
                  this.set = d;
                  ref.close();
                }
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
      return "120px";
    case "target":
      return "50px";
    }
    return "";
  }

  getExportData(fight: M.IFight): ExportData {
    const data = JSON.parse(fight.data) as SerializeController.IFightSerializeData;
    const bossData = JSON.parse(data.boss.data);
    const bossAttacks = bossData.attacks as SerializeController.IBossAbilityUsageData[];
    return {
      userName: fight.userName,
      name: fight.name,
      data: {
        boss: {
          attacks: bossAttacks.map((it) => <any>{
            name: it.ability.name,
            type: it.ability.type,
            tags: it.ability.tags,
            offset: it.ability.offset
          }),
          downTimes: bossData.downTimes.map(it => <any>{
            start: it.start,
            end: it.end
          })
        },
        initialTarget: data.initialTarget,
        bossTargets: [], //todo: parse boss targets
        jobs: data.jobs.map(it => {
          const jb = this.gameService.jobRegistry.getJob(it.name);
          return <any>{
            id: it.id,
            name: it.name,
            role: jb.role,
            order: it.order,
            pet: it.pet,
            icon: jb.icon
          };
        }),
        abilities: data.abilities.map(it => {
          const jb = data.jobs.find(j => j.id === it.job);
          const ab = this.gameService.jobRegistry.getAbilityForJob(jb.name, it.ability);
          return <any>{
            job: it.job,
            ability: it.ability,
            type: ab.abilityType,
            duration: ab.duration,
            start: it.start,
            icon: ab.icon
          };
        })
      }
    };
  }

  ngOnDestroy(): void {

  }
}
