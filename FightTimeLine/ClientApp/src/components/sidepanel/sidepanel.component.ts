import { Component, OnInit, OnDestroy, AfterViewInit, Input, Injector, NgZone } from "@angular/core";
import { ComponentPortal, Portal } from "@angular/cdk/portal";
import { SingleAbilityComponent } from "../../components/singleAbility/singleAbility.component";
import { SingleAttackComponent } from "../../components/singleAttack/singleAttack.component";
import { MultipleAbilityComponent } from "../../components/multipleAbility/multipleAbility.component";
import { MultipleAttackComponent } from "../../components/multipleAttack/multipleAttack.component";
import { MultipleDownTimeComponent } from "../../components/multipleDowntime/multipleDowntime.component";
import * as Jobcomponent from "../../components/job/job.component";
import * as JobAbilitycomponent from "../../components/jobAbility/jobAbility.component";
import { DownTimeComponent } from "../../components/downtime/downtime.component";
import * as BaseHolder from "../../core/Holders/BaseHolder";
import { Holders } from "../../core/Holders";
import { VisStorageService } from "src/services/VisStorageService";
import { NzResizeEvent } from "ng-zorro-antd/resizable";
import { Subject } from "rxjs";
import { SidePanelMode, SidepanelParams, SIDEPANEL_DATA } from "./ISidePanelComponent";


@Component({
  selector: "sidepanel",
  templateUrl: "./sidepanel.component.html",
  styleUrls: ["./sidepanel.component.css"],
})
export class SidepanelComponent {

  sideNavOpened: boolean = false;
  items: BaseHolder.IForSidePanel[];
  holders: Holders;
  selectedPortal: Portal<any>;
  key: string;
  refresher: Subject<void> = new Subject<void>();
  width = 300;
  id = -1;

  componentMap = {
    "ability": [SingleAbilityComponent, MultipleAbilityComponent],
    "bossAbility": [SingleAttackComponent, MultipleAttackComponent],
    "job": [Jobcomponent.JobComponent],
    "jobAbility": [JobAbilitycomponent.JobAbilityComponent],
    "downtime": [DownTimeComponent, MultipleDownTimeComponent]
  }

  @Input() mode: SidePanelMode = "default";

  constructor(
    private visStorage: VisStorageService,
    private injector: Injector,
    private ngZone: NgZone
  ) {
    this.holders = this.visStorage.holders;
  }

  onResize({ width }: NzResizeEvent): void {
    cancelAnimationFrame(this.id);
    this.id = requestAnimationFrame(() => {
      this.width = width!;
    });
  }

  private calculateKey(its: BaseHolder.IForSidePanel[]) {
    return its.sort().reduce((p, c) => p + c.id, "");
  }

  refresh() {

    if (this.sideNavOpened && this.refresher) {
      this.refresher.next();
      return false;//todo: check for ids in component return this.holders.isIn(this.items.map(t => (t as any).id))
    }

    if (this.sideNavOpened)
      this.sideNavOpened = false;

    return false;
  }

  public setSidePanel(eventData) {
    this.ngZone.run(() => {
      if (eventData && (eventData.items && eventData.items.length > 0 || (eventData.group && eventData.what === "group-label"))) {
        const items = this.getItems(eventData.items || [eventData.group]);
        if (items && items.length > 0) {

          this.setItems(items, this.mode);
          if (!this.sideNavOpened) {
            this.sideNavOpened = true;
          }
          return;
        }
      }
      this.setItems([], this.mode);
      if (this.sideNavOpened)
        this.sideNavOpened = false;
    });
  }

  getItems(items: any[]): any[] {
    return [
      ...this.holders.bossAttacks.getByIds(items),
      ...this.holders.itemUsages.getByIds(items),
      ...this.holders.stances.getByIds(items),
      ...this.holders.jobs.getByIds(items),
      ...this.holders.abilities.getByIds(items),
      ...this.holders.bossDownTime.getByIds(items)
    ];
  }

  setItems(items: BaseHolder.IForSidePanel[], mode: SidePanelMode = "default"): void {
    this.items = items;

    const newKey = this.calculateKey(this.items);
    if (newKey === this.key) {
      this.refresher.next();
      return;
    }

    this.key = newKey;

    const componentType = this.componentFactory();

    if (componentType) {
      const injector = this.createInjector({
        items: items,
        mode: mode,
        refresh: this.refresher
      });

      let component = new ComponentPortal(componentType, null, injector);

      if (component) {
        this.selectedPortal = component;
      }
    }
  }

  componentFactory() {
    if (this.items && this.items.length > 0) {
      const [one, many] = this.componentMap[this.items[0].sidePanelComponentName];
      if (this.items.length === 1) {
        return one;
      } else if (this.items.length > 1) {
        return many;
      }
    }
  }

  createInjector(dataToPass: SidepanelParams): Injector {
    return Injector.create({
      providers: [{ provide: SIDEPANEL_DATA, useValue: dataToPass }],
      parent: this.injector,
      name: "Sidepanel injector"
    });
  }

}
