import { Component, Inject, OnInit, ViewChild, ElementRef, OnDestroy, TemplateRef, Input } from "@angular/core";
import { map, first } from "rxjs/operators/"
import { Zone, Encounter } from "../../core/FFLogs"
import * as M from "../../core/Models"
import { Utils } from "../../core/Utils"
import { ScreenNotificationsService } from "../../services/ScreenNotificationsService"
import { DispatcherPayloads, DispatcherService } from "../../services/dispatcher.service"
import { fightServiceToken } from "../../services/fight.service-provider"
import { IFightService } from "../../services/fight.service-interface"
import { IAuthenticationService } from "../../services/authentication.service-interface"
import { authenticationServiceToken } from "../../services/authentication.service-provider"
import { VisTimelineService, DataSet } from "ngx-vis";
import { TimelineOptions, DataGroup, DataItem } from "vis-timeline";
import * as Gameserviceprovider from "../../services/game.service-provider";
import * as Gameserviceinterface from "../../services/game.service-interface";
import { NzModalRef } from "ng-zorro-antd/modal";

@Component({
  selector: "bossTemplatesDialog",
  templateUrl: "./bossTemplatesDialog.component.html",
  styleUrls: ["./bossTemplatesDialog.component.css"]
})

export class BossTemplatesDialog implements OnInit, OnDestroy {

  visItems: DataSet<DataItem, 'id'> = new DataSet<DataItem>([], {});
  visGroups: DataSet<DataGroup, 'id'> = new DataSet<DataGroup>([], {});
  visTimelineBoss: string = "visTimelinebooooosss";
  startDate = new Date(946677600000);
  @ViewChild("timeline", { static: true }) timeline: ElementRef;
  @ViewChild("listContainer", { static: true }) listContainer: ElementRef;
  @Input("data") data: { needSave: boolean, boss?: M.IBoss };

  optionsBoss = <TimelineOptions>{
    width: "100%",
    height: "100%",
    minHeight: "50px",
    autoResize: true,
    start: this.startDate,
    end: new Date(new Date(this.startDate).setMinutes(30)),
    max: new Date(new Date(this.startDate).setMinutes(30)),
    min: new Date(this.startDate),
    zoomable: true,
    zoomMin: 3 * 60 * 1000,
    zoomMax: 30 * 60 * 1000,
    zoomKey: "ctrlKey",
    moveable: true,
    format: Utils.format(this.startDate),
    type: "box",
    multiselect: false,
    showCurrentTime: false,
    stack: true,
    orientation: "bottom",
    stackSubgroups: true,
    editable: { remove: false, updateTime: false, add: false },
    horizontalScroll: true,
    margin: { item: { horizontal: 0, vertical: 5 } }
  };
  isSpinning: boolean = true;
  isListLoading: boolean = false;
  searchString: string = "";
  searchFightString: string = "";
  zones: Zone[];
  filteredZones: Zone[];
  selectedZone: string;
  selectedEncounter: Encounter;
  selectedTemplate: M.IBossSearchEntry;
  templates: M.IBossSearchEntry[] = [];
  filteredTemplates: M.IBossSearchEntry[] = [];
  isTimelineLoading: boolean = false;

  constructor(
    public dialogRef: NzModalRef,
    @Inject(Gameserviceprovider.gameServiceToken) private gameService: Gameserviceinterface.IGameService,
    @Inject(fightServiceToken) private fightService: IFightService,
    private visTimelineService: VisTimelineService,
    @Inject("DispatcherPayloads") private dispatcher: DispatcherService<DispatcherPayloads>,
    @Inject(authenticationServiceToken) public authService: IAuthenticationService,
    private notification: ScreenNotificationsService
  ) {

  }

  ngOnInit(): void {
    this.gameService.dataService.getZones()
      .pipe(
        map((v) => {
          return v.filter(x => x.brackets && x.brackets.min >= 4 && x.name.indexOf("Dungeons") !== 0 && x.name.indexOf("(Story)") < 0);
        }),
        first()
      )
      .subscribe(val => {
        this.zones = (val as any as Zone[]).sort((a: Zone, b: Zone) => a.name.localeCompare(b.name));
        this.filteredZones = this.zones;
        if (this.data && this.data.boss && this.zones) {
          const zone = this.zones.find((z) => z.encounters.some((y => y.id === this.data.boss.ref) as any));
          if (zone) {
            const enc = zone.encounters.find(y => y.id === this.data.boss.ref);
            this.onEncounterSelected(zone.id, enc, true);
            this.onSearchChange(null);
          }
        }
      }, null, () => {
        this.isSpinning = false;
      });
    this.visTimelineService.createWithItems(this.visTimelineBoss, this.timeline.nativeElement, this.visItems, this.optionsBoss);

  }

  onSearchChange(event: any) {
    this.filteredZones =
      this.zones.
        filter(
          (zone: Zone) => {
            return (!this.searchString || zone.encounters.some((x => x.name.toLowerCase().indexOf(this.searchString.toLowerCase()) >= 0) as any) && (!this.data.boss || zone.encounters.some((x => x.id === this.data.boss.ref) as any)));
          }
        );
  }

  onSearchFightChange(event: any) {
    this.filteredTemplates =
      this.templates.filter(
        (t: M.IBossSearchEntry) => {
          return (!this.searchFightString || t.name.toLowerCase().indexOf(this.searchFightString.toLowerCase()) >= 0);
        }
      );
  }

  clear() {
    this.searchString = "";
    this.onSearchChange("");
  }

  filterEncounters(items: any[]) {
    if (!items) return [];
    return items.filter(x => (!this.searchString || x.name.toLowerCase().indexOf(this.searchString.toLowerCase()) >= 0) && (!this.data || !this.data.boss || x.id === this.data.boss.ref));

  }

  onEncounterSelected(zone, enc: any, skipCheck?: boolean) {
    if (this.data.boss && this.data.boss.ref && !skipCheck)
      return;
    // console.log(enc.name);
    this.selectedTemplate = null;
    this.visItems.clear();
    this.selectedZone = zone;
    this.selectedEncounter = enc;
    this.isListLoading = true;

    this.loadBosses(enc, skipCheck);

  }

  loadBosses(enc: any, skipCheck?: boolean) {
    this.fightService.getBosses(enc.id, this.data.boss && this.data.boss.name || "", false).subscribe((data) => {
      if (this.data.boss) {
        this.select({ id: this.data.boss.id, name: "", canRemove: false }, skipCheck);
      }
      this.templates = data.filter(x => !this.data.boss || x.id.toLowerCase() === this.data.boss.id.toLowerCase());
      this.onSearchFightChange(null);
    }, null,
      () => {
        this.isListLoading = false;
        this.listContainer.nativeElement.scrollTop = 0;
      });
  }

  remove(item: any, event: any) {
    this.fightService.removeBosses([item.id]).subscribe(() => {
      this.notification.success("Template has been removed.");
      this.selectedTemplate = null;
    }, (error) => {
      this.notification.success("Unable to remove tempalte");
    }, () => {
      this.loadBosses(this.selectedEncounter, true);
    });
  }

  onNoClick(): void {
    this.dialogRef.destroy();
  }

  select(item: M.IBossSearchEntry, skipCheck?: boolean) {
    if (this.data.boss && this.data.boss.ref && !skipCheck)
      return;
    this.isTimelineLoading = true;
    this.selectedTemplate = item;
    this.fightService.getBoss(this.selectedTemplate.id).subscribe((boss) => {
      const data = JSON.parse(boss.data);
      this.visItems.clear();
      this.visItems.add(data.attacks.map(a => this.createBossAttack(a.id, a.ability as M.IBossAbility, false)));
      this.visItems.add(data.downTimes.map(a => this.createDownTime(a.id, Utils.getDateFromOffset(a.start), Utils.getDateFromOffset(a.end), a.color)));
      this.visTimelineService.fit(this.visTimelineBoss);
    },
      null,
      () => {
        this.isTimelineLoading = false;
      });
  }

  createDownTime(id: string, start: Date, end: Date, color: string): DataItem {
    return {
      start: start,
      end: end,
      id: id,
      content: "",
      type: "background",
      style: "background-color:" + color,
      className: "downtime"
    }
  }

  createBossAttack(id: string, attack: M.IBossAbility, vertical: boolean): DataItem {
    const data = {
      id: id,
      content: this.createBossAttackElement(attack),
      start: Utils.getDateFromOffset(attack.offset),
      type: "box",
      className: "bossAttack " + M.DamageType[attack.type]
    }
    return data;
  }

  private createBossAttackElement(ability: M.IBossAbility): string {
    return `<div><div class='marker'></div><div class='name'>${Utils.escapeHtml(ability.name)}</div></div>`;
  }

  clearTemplates() {
    this.searchFightString = "";
  }

  ngOnDestroy(): void {
    this.visTimelineService.destroy(this.visTimelineBoss);
  }

  save() {
    this.dispatcher.dispatch("bossTemplateSave", {
      name: this.data.boss && this.data.boss.name || this.selectedEncounter && this.selectedEncounter.name || "",
      reference: this.selectedEncounter && this.selectedEncounter.id || 0,
      isPrivate: false,
      close: () => this.dialogRef.destroy()
    });
  }

  saveAsNew() {
    this.dispatcher.dispatch("bossTemplateSaveAsNew", {
      name: this.selectedEncounter && this.selectedEncounter.name || "",
      reference: this.selectedEncounter && this.selectedEncounter.id || 0,
      isPrivate: false,
      close: () => this.dialogRef.destroy()
    });
  }

  load() {
    this.fightService.getBoss(this.selectedTemplate.id).subscribe((data) => {
      this.dispatcher.dispatch("bossTemplatesLoad", {
        boss: data,
        encounter: this.selectedEncounter.id,
        close: () => this.dialogRef.destroy()
      }
      );
    });

  }
}
