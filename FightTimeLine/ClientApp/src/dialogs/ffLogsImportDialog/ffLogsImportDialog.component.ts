import { Component, Inject, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { RecentActivityService } from "../../services/RecentActivitiesService";
import { SettingsService } from "../../services/SettingsService";
import { Utils } from "../../core/Utils";
import { Fight, Parse, ReportFightsResponse, Zone } from "../../core/FFLogs";
import { gameServiceToken } from "../../services/game.service-provider";
import { IGameService } from "../../services/game.service-interface";
import { NzModalRef } from "ng-zorro-antd/modal";

@Component({
  selector: "ffLogsImportDialog",
  templateUrl: "./ffLogsImportDialog.component.html",
  styleUrls: ["./ffLogsImportDialog.component.css"],
})

export class FFLogsImportDialog implements OnInit {


  constructor(
    public dialogRef: NzModalRef,
    @Inject(gameServiceToken)
    public service: IGameService,
    public recentService: RecentActivityService,
    public settingsService: SettingsService,
    private router: Router) {
  }

  reportValue: string;
  haveFFlogsChar: boolean;
  zones:{ key: string, value: Fight[] }[] = [];
  parsesList: Parse[] = [];
  @Input() code: string;
  searchAreaDisplay = "none";
  listAreaDisplay = "none";
  dialogContentHeight = "60px";
  prevSearch: string = null;
  killsOnly = true;
  loadingParses = false;
  matchValue = "reports\\/([a-zA-Z0-9]{16})\\/?(?:(?:#.*fight=([^&]*))|$)";

  ngOnInit(): void {
    const importSettings = this.settingsService.load().fflogsImport;
    this.haveFFlogsChar =
      importSettings &&
      importSettings.characterName &&
      importSettings.characterRegion &&
      importSettings.characterServer;

    if (this.haveFFlogsChar) {
      this.showSearchArea();
    }

    if (this.code) {
      this.reportValue = "https://www.fflogs.com/reports/" + this.code;
    }
    this.onSearch(this.reportValue);
  }

  round(v) {
    return Math.round(v);
  }

  loadByFight(code: string, fight: string) {
    if (fight !== "last") {
      this.dialogRef.afterClose.subscribe(() => {
        this.router.navigateByUrl("fflogs/" + this.code + "/" + fight);
      });
      this.dialogRef.close();
      return;
    } else {
      this.service.dataService
        .getFight(code)
        .then((it: ReportFightsResponse) => {
          const id = it.fights[it.fights.length - 1].id;
          this.onClick("" + id);
          return;
        });
    }
  }

  searchByCode(code: string) {
    this.loadingParses = true;
    this.service.dataService
      .getFight(code)
      .then((it: ReportFightsResponse) => {
        if (it.fights.length === 0) { return; }
        const groupBy = (key: string) => <T>(array:T[]) =>
          array.reduce((objectsByKeyValue, obj) => {
            const value = obj[key];
            objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
            return objectsByKeyValue;
          }, {} as Record<string, T[]>);

        const zones = groupBy('zoneName')(it.fights);
        this.zones = Object.keys(zones).map((value) => ({ key: value, value: zones[value] }));
        this.showListArea();
      })
      .finally(() => {
        this.loadingParses = false;
      });
  }

  loadParses() {
    const settings = this.settingsService.load();
    const importSettings = settings.fflogsImport;
    if (this.haveFFlogsChar) {
      this.loadingParses = true;
      this.service.dataService
        .getParses(
          importSettings.characterName,
          importSettings.characterServer,
          importSettings.characterRegion)
        .subscribe(
          parses => {
            if (parses && parses.length > 0) {
              this.parsesList = parses.sort((a, b) => b.startTime - a.startTime);
              this.showSearchArea();
            }
          },
          error => {
            console.error(error);
            this.hideExtraAreas();
          },
          () => {
            this.loadingParses = false;
          });
    }
  }

  onSearch(data: string): void {
    if (this.prevSearch === data) { return; }
    if (data === "") {
      this.code = "";
      this.hideExtraAreas();
    }
    this.prevSearch = data;
    const r = new RegExp(this.matchValue, "igm");
    const [_, code, fight] = r.exec(data) || [];
    if (code) {
      this.code = code;
      if (fight) {
        this.loadByFight(code, fight);
      } else {
        this.searchByCode(code);
      }
    }
    else {
      if (!data) {
        this.loadParses();
      } else {
        this.hideExtraAreas();
      }
    }
  }

  private hideExtraAreas() {
    this.dialogContentHeight = "60px";
    this.searchAreaDisplay = "none";
    this.listAreaDisplay = "none";
  }

  private showSearchArea() {
    this.dialogContentHeight = "360px";
    this.searchAreaDisplay = "none";
    this.listAreaDisplay = "block";
  }

  private showListArea() {
    this.dialogContentHeight = "360px";
    this.searchAreaDisplay = "block";
    this.listAreaDisplay = "none";
  }

  onClick(id: string) {
    this.dialogRef.afterClose.subscribe(() => {
      this.router.navigateByUrl("fflogs/" + this.code + "/" + id);
    });
    this.dialogRef.close();
  }

  onMatch(data: string) {
    this.onSearch(data);
  }

  getIcon(spec) {
    return this.service.jobRegistry.getJobs().find(j => j.fullName === spec).icon;
  }

  getBossIcon(id) {
    return "https://assets.rpglogs.com/img/ff/bosses/" + id + "-icon.jpg"
  }


  formatTime(start: number, end: number): string {
    const diff = (end - start);
    const date = new Date(946677600000 + diff);
    return Utils.formatTime(date);
  }

  onParseClick(item: any) {
    this.dialogRef.close({
      reportId: item.reportID,
      fightId: item.fightID
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
