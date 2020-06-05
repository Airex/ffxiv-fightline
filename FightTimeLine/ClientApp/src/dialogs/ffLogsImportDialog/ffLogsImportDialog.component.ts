import { Component, Inject, ViewChild, Input, OnInit, TemplateRef } from "@angular/core";
import { Router } from "@angular/router";
import { RecentActivityService } from "../../services/RecentActivitiesService"
import { SettingsService } from "../../services/SettingsService"
import { Utils } from "../../core/Utils"
import { ReportFightsResponse } from "../../core/FFLogs"
import { NzModalRef } from "ng-zorro-antd";
import * as Gameserviceprovider from "../../services/game.service-provider";
import * as Gameserviceinterface from "../../services/game.service-interface";

@Component({
  selector: "ffLogsImportDialog",
  templateUrl: "./ffLogsImportDialog.component.html",
  styleUrls: ["./ffLogsImportDialog.component.css"],
})

export class FFLogsImportDialog implements OnInit {

  ngOnInit(): void {
    if (this.code)
      this.reportValue = "https://www.fflogs.com/reports/" + this.code;
    this.onSearch(this.reportValue);
  }

  reportValue: string;

  zones = [];
  parsesList = [];
  @Input() code: string;
  searchAreaDisplay = "none";
  listAreaDisplay = "none";
  dialogContentHeight = "60px";
  recent: any;
  prevSearch: string = null;


  constructor(
    public dialogRef: NzModalRef,
    @Inject(Gameserviceprovider.gameServiceToken) public service: Gameserviceinterface.IGameService,
    public recentService: RecentActivityService,
    public settingsService: SettingsService,
    private router: Router) {

  }

  onSearch(data: string): void {
    if (this.prevSearch === data) return;
    this.prevSearch = data;
    const r = /reports\/([a-zA-Z0-9]{16})\/?(?:(?:#.*fight=([^&]*))|$)/igm;
    const res = r.exec(data) as any;
    if (res && res.length > 1) {
      if (res[1]) {
        this.code = res[1];
        if (res[2]) {
          if (res[2] !== "last") {
            this.dialogRef.afterClose.subscribe(() => {
              this.router.navigateByUrl("fflogs/" + this.code + "/" + res[2]);
            });
            this.dialogRef.close();
            return;
          } else {
            this.service.dataService.getFight(res[1])
              .then((it: ReportFightsResponse) => {
                const id = it.fights[it.fights.length - 1].id;
                this.onClick("" + id);
                return;
              });
          }
        } else {
          this.service.dataService.getFight(res[1])
            .then((it: ReportFightsResponse) => {
             
              const groupBy = key => array =>
                array.reduce((objectsByKeyValue, obj) => {
                  const value = obj[key];
                  objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
                  return objectsByKeyValue;
                },
                  {});

              var gr = groupBy('zoneName');

              var zones = gr(it.fights);

              this.zones = Object.keys(zones).map((value, index, array) => <any>{ key: value, value: zones[value] });
              this.dialogContentHeight = "360px";
              this.searchAreaDisplay = "block";
              this.listAreaDisplay = "none";
            });
        }
      }
    }
    else {
      if (!data) {
        const settings = this.settingsService.load();
        if (settings.fflogsImport.characterName &&
          settings.fflogsImport.characterRegion &&
          settings.fflogsImport.characterServer) {
          this.service.dataService
            .getParses(settings.fflogsImport.characterName,
              settings.fflogsImport.characterServer,
              settings.fflogsImport.characterRegion)
            .subscribe(parses => {
                if (parses) {
                  this.parsesList = parses.sort((a, b) => b.startTime - a.startTime);
                  this.dialogContentHeight = "360px";
                  this.searchAreaDisplay = "none";
                  this.listAreaDisplay = "block";
                }
              },
              error => {
                this.hideExtraAreas();
              })
        }
      } else {
        this.hideExtraAreas();
      }
    }
  }

  private hideExtraAreas() {
    this.dialogContentHeight = "60px";
    this.searchAreaDisplay = "none";
    this.listAreaDisplay = "none"
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


  formatTime(start: number, end: number): string {
    const diff = (end - start);
    const date = new Date(946677600000 + diff);
    return Utils.formatTime(date);
  }

  onParseClick(item: any) {
    this.dialogRef.afterClose.subscribe(() => {
      this.router.navigateByUrl("fflogs/" + item.reportID + "/" + item.fightID);
    });
    this.dialogRef.close();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    //    const fight = this.fights.selectedOptions.selected[0].value;
    //    this.dialogRef.afterClose.subscribe(() => {
    //      this.router.navigateByUrl("fflogs/" + this.code + "/" + fight);
    //    });
    //    this.dialogRef.close();
  }
}
