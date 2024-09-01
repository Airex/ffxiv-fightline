import {
  Component,
  Inject,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  Input,
  inject,
} from "@angular/core";
import { map, first } from "rxjs/operators";
import { Zone, Encounter } from "../../core/FFLogs";
import {
  IBoss,
  IBossSearchEntry,
  IBossAbility,
  DamageType,
} from "../../core/Models";
import { Utils, addMinutes } from "../../core/Utils";
import { ScreenNotificationsService } from "../../services/ScreenNotificationsService";
import {
  DispatcherPayloads,
  DispatcherService,
} from "../../services/dispatcher.service";
import { fightServiceToken } from "../../services/fight/fight.service-provider";
import { IFightService } from "../../services/fight/fight.service-interface";
import { IAuthenticationService } from "../../services/authentication/authentication.service-interface";
import { authenticationServiceToken } from "../../services/authentication/authentication.service-provider";
import { gameServiceToken } from "../../services/game.service-provider";
import { IGameService } from "../../services/game.service-interface";
import { NZ_MODAL_DATA, NzModalRef } from "ng-zorro-antd/modal";
import { DataSetDataGroup, DataSetDataItem } from "vis-timeline";
import { DataSet } from "vis-data";
import {
  DataGroup,
  DataItem,
  TimelineOptions,
  VisTimelineService,
} from "ngx-vis";
import { IBossAbilityUsageData } from "src/core/SerializeController";
import moment from "moment";

@Component({
  selector: "bossTemplatesDialog",
  templateUrl: "./bossTemplatesDialog.component.html",
  styleUrls: ["./bossTemplatesDialog.component.css"],
})
export class BossTemplatesDialogComponent implements OnInit, OnDestroy {
  visItems: DataSetDataItem = new DataSet<DataItem>([], {});
  visGroups: DataSetDataGroup = new DataSet<DataGroup>([], {});
  visTimelineBoss = "visTimelinebooooosss";
  startDate = new Date(new Date(2000, 1, 1, 0, 0, 0).valueOf() as number);
  @ViewChild("timeline", { static: true }) timeline: ElementRef;
  @ViewChild("listContainer", { static: true }) listContainer: ElementRef;
  data: { needSave: boolean; boss?: IBoss } = inject(NZ_MODAL_DATA);

  optionsBoss = {
    width: "100%",
    height: "100%",
    minHeight: "50px",
    autoResize: true,
    start: this.startDate,
    end: addMinutes(this.startDate, 30),
    max: addMinutes(this.startDate, 30),
    min: new Date(this.startDate),
    zoomable: true,
    zoomMin: 3 * 60 * 1000,
    zoomMax: 30 * 60 * 1000,
    zoomKey: "ctrlKey",
    moveable: true,
    format: Utils.format(),
    type: "box",
    multiselect: false,
    showCurrentTime: false,
    stack: true,
    orientation: "bottom",
    stackSubgroups: true,
    editable: { remove: false, updateTime: false, add: false },
    horizontalScroll: true,
    margin: { item: { horizontal: 0, vertical: 5 } },
    moment: (date: Date) => {
      return moment(date).utc();
    },
  } as TimelineOptions;
  isSpinning = true;
  isListLoading = false;
  searchString = "";
  searchFightString = "";
  zones: Zone[];
  filteredZones: Zone[];
  selectedZone: number | undefined;
  selectedEncounter: Encounter;
  selectedTemplate: IBossSearchEntry;
  templates: IBossSearchEntry[] = [];
  filteredTemplates: IBossSearchEntry[] = [];
  isTimelineLoading = false;

  constructor(
    public dialogRef: NzModalRef,
    @Inject(gameServiceToken) private gameService: IGameService,
    @Inject(fightServiceToken) private fightService: IFightService,
    private visTimelineService: VisTimelineService,
    @Inject("DispatcherPayloads")
    private dispatcher: DispatcherService<DispatcherPayloads>,
    @Inject(authenticationServiceToken)
    public authService: IAuthenticationService,
    private notification: ScreenNotificationsService
  ) {}

  getBossIcon(id: number) {
    return "https://assets.rpglogs.com/img/ff/bosses/" + id + "-icon.jpg";
  }

  getZoneIcon(id: number) {
    return "https://assets.rpglogs.com/img/ff/zones/zone-" + id + ".png";
  }

  ngOnInit(): void {
    this.gameService.dataService
      .getZones()
      .pipe(
        map((v) => {
          return v.filter(
            (x) =>
              x.brackets &&
              x.brackets.min >= 4 &&
              x.name.indexOf("Dungeons") !== 0 &&
              x.name.indexOf("(Story)") < 0
          );
        }),
        first()
      )
      .subscribe({
        next: (val) => {
          this.zones = val.sort((a: Zone, b: Zone) =>
            a.name.localeCompare(b.name)
          );
          this.filteredZones = this.zones;
          if (this.data && this.data.boss && this.zones) {
            const zone = this.zones.find((z) =>
              z.encounters.some((y) => y.id === this.data.boss.ref)
            );
            if (zone) {
              const enc = zone.encounters.find(
                (y) => y.id === this.data.boss.ref
              );
              this.onEncounterSelected(zone.id, enc, true);
              this.onSearchChange();
            }
          }
        },
        complete: () => {
          this.isSpinning = false;
        },
      });
    this.visTimelineService.createWithItems(
      this.visTimelineBoss,
      this.timeline.nativeElement,
      this.visItems,
      this.optionsBoss
    );
  }

  onSearchChange(event?: any) {
    if (!this.searchString) {
      this.filteredZones = this.zones;
    } else {
      this.filteredZones = this.zones.filter((zone: Zone) => {
        return (
          (!this.data.boss ||
            !this.data.boss.ref ||
            zone.encounters.some((x) => x.id === this.data.boss.ref)) &&
          zone.encounters.some((x) =>
            x.name.toLowerCase().includes(this.searchString.toLowerCase())
          )
        );
      });
    }
  }

  onSearchFightChange(event: any) {
    if (!this.searchFightString) {
      this.filteredTemplates = this.templates;
    } else {
      this.filteredTemplates = this.templates.filter((t: IBossSearchEntry) =>
        t.name.toLowerCase().includes(this.searchFightString.toLowerCase())
      );
    }
  }

  clear() {
    this.searchString = "";
    this.onSearchChange();
  }

  filterEncounters(items: Encounter[] | undefined) {
    if (!items) {
      return [];
    }

    return items.filter(
      (x) =>
        (!this.data ||
          !this.data.boss ||
          !this.data.boss.ref ||
          x.id === this.data.boss.ref) &&
        (!this.searchString ||
          x.name.toLowerCase().includes(this.searchString.toLowerCase()))
    );
  }

  onEncounterSelected(
    zone: number | undefined,
    enc: Encounter,
    skipCheck?: boolean
  ) {
    if (this.data?.boss?.ref && !skipCheck) {
      return;
    }

    this.selectedTemplate = null;
    this.visItems.clear();
    this.selectedZone = zone;
    this.selectedEncounter = enc;

    if (enc) {
      this.loadBosses(enc, skipCheck);
    }
  }

  loadBosses(enc: Encounter, skipCheck?: boolean) {
    this.isListLoading = true;
    this.fightService
      .getBosses(enc.id, this.data?.boss?.name || "", false)
      .subscribe({
        next: (data) => {
          if (this.data?.boss) {
            this.select(
              { id: this.data.boss.id, name: "", canRemove: false },
              skipCheck
            );
          }
          this.templates = data.filter(
            (x) =>
              !this.data.boss ||
              x.id.toLowerCase() === this.data.boss.id.toLowerCase()
          );
          this.onSearchFightChange(null);
        },
        complete: () => {
          this.isListLoading = false;
          this.listContainer.nativeElement.scrollTop = 0;
        },
      });
  }

  remove(item: any, event: any) {
    this.fightService.removeBosses([item.id]).subscribe({
      next: () => {
        this.notification.success("Template has been removed.");
        this.selectedTemplate = null;
      },
      error: (error) => {
        this.notification.success("Unable to remove template");
      },
      complete: () => {
        this.loadBosses(this.selectedEncounter, true);
      },
    });
  }

  onNoClick(): void {
    this.dialogRef.destroy();
  }

  select(item: IBossSearchEntry, skipCheck?: boolean) {
    if (this.data?.boss?.ref && !skipCheck) {
      return;
    }
    if (!item || !item.id) {
      return;
    }

    this.isTimelineLoading = true;
    this.selectedTemplate = item;
    this.fightService.getBoss(this.selectedTemplate.id).subscribe({
      next: (boss) => {
        const data = JSON.parse(boss.data) as {
          attacks: IBossAbilityUsageData[];
          downTimes: any[];
        };
        this.visItems.clear();
        this.visItems.add(
          data.attacks.map((a) => this.createBossAttack(a.id, a.ability, false))
        );
        this.visItems.add(
          data.downTimes.map((a) =>
            this.createDownTime(
              a.id,
              Utils.getDateFromOffset(a.start),
              Utils.getDateFromOffset(a.end),
              a.color
            )
          )
        );
        this.visTimelineService.fit(this.visTimelineBoss);
      },
      complete: () => {
        this.isTimelineLoading = false;
      },
    });
  }

  createDownTime(id: string, start: Date, end: Date, color: string): DataItem {
    return {
      start,
      end,
      id,
      content: "",
      type: "background",
      style: "background-color:" + color,
      className: "downtime",
    };
  }

  createBossAttack(
    id: string,
    attack: IBossAbility,
    vertical: boolean
  ): DataItem {
    const data = {
      id,
      content: this.createBossAttackElement(attack),
      start: Utils.getDateFromOffset(attack.offset),
      type: "box",
      className: "bossAttack " + DamageType[attack.type] + " " + attack.color,
    };
    return data;
  }

  private createBossAttackElement(ability: IBossAbility): string {
    return `<div><div class='marker'></div><div class='name'>${Utils.escapeHtml(
      ability.name
    )}</div></div>`;
  }

  clearTemplates() {
    this.searchFightString = "";
  }

  ngOnDestroy(): void {
    this.visTimelineService.destroy(this.visTimelineBoss);
  }

  save() {
    this.dispatcher.dispatch("bossTemplateSave", {
      name:
        (this.data.boss && this.data.boss.name) ||
        (this.selectedEncounter && this.selectedEncounter.name) ||
        "",
      reference: (this.selectedEncounter && this.selectedEncounter.id) || 0,
      isPrivate: false,
      close: () => this.dialogRef.destroy(),
    });
  }

  saveAsNew() {
    this.dispatcher.dispatch("bossTemplateSaveAsNew", {
      name: (this.selectedEncounter && this.selectedEncounter.name) || "",
      reference: (this.selectedEncounter && this.selectedEncounter.id) || 0,
      isPrivate: false,
      close: () => this.dialogRef.destroy(),
    });
  }

  load() {
    this.fightService.getBoss(this.selectedTemplate.id).subscribe((data) => {
      this.dispatcher.dispatch("bossTemplatesLoad", {
        boss: data,
        encounter: this.selectedEncounter.id,
        close: () => this.dialogRef.destroy(),
      });
    });
  }
}
