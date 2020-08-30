import { Component, OnInit, OnDestroy, Inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { IFight } from "../core/Models";

import { IFightService, fightServiceToken } from "../services/index"
import { SettingsService } from "../services/SettingsService"
import { LocalStorageService } from "../services/LocalStorageService"

import { FirstTemplate } from "../core/ExportTemplates/FirstTemplate"
import { EachRowOneSecondTemplate } from "../core/ExportTemplates/EachRowOneSecondTemplate"
import { BossAttackDefensiveTemplate } from "../core/ExportTemplates/BossAttackDefensiveTemplate"
import { ExportTemplate, ExportData } from "../core/BaseExportTemplate"
import { IExportResultSet } from "../core/BaseExportTemplate"
import * as Gameserviceprovider from "../services/game.service-provider";
import * as Gameserviceinterface from "../services/game.service-interface";
import * as SerializeController from "../core/SerializeController";


@Component({
  selector: "tableview",
  templateUrl: "./tableview.component.html",
  styleUrls: ["./tableview.component.css"],
})
export class TableViewComponent implements OnInit, OnDestroy {
  startDate = new Date(946677600000);

  set: IExportResultSet;
  columnNames: string[];
  templates: ExportTemplate[] =
    [new FirstTemplate(), new EachRowOneSecondTemplate(), new BossAttackDefensiveTemplate()];

  public constructor(
    @Inject(fightServiceToken) private fightService: IFightService,
    private route: ActivatedRoute,
    private router: Router,
    private storage: LocalStorageService,
    @Inject(Gameserviceprovider.gameServiceToken) private gameService: Gameserviceinterface.IGameService,
    private settingsService: SettingsService) {
  }

  home() {
    this.router.navigateByUrl("/");
  }

  ngOnInit(): void {
    this.route.params.subscribe(r => {
      const id = r["fightId"] as string;
      const template = r["template"] as string;
      if (id && template) {
//        const settings = this.settingsService.load();
        this.fightService
          .getFight(id)
          .subscribe(fight => {
            const exportData = this.getExportData(fight);
            const d = this.templates.find(it => it.name.toLowerCase() === template.toLowerCase()).build(exportData);
            this.columnNames = d.columns.map(it => it.text);
            this.set = d;
          });
      }
    });
  }

  getExportData(fight: IFight): ExportData {
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
