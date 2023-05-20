import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  Input,
  Injector,
  NgZone,
} from "@angular/core";
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
import {
  SidePanelMode,
  SidepanelParams,
  SIDEPANEL_DATA,
} from "./ISidePanelComponent";
import { WarningsComponent } from "../warnings/warnings.component";

export type SidePanelInput =
  | { items: string[]; group?: string; what?: string }
  | string;

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
    ability: [SingleAbilityComponent, MultipleAbilityComponent],
    bossAbility: [SingleAttackComponent, MultipleAttackComponent],
    job: [Jobcomponent.JobComponent],
    jobAbility: [JobAbilitycomponent.JobAbilityComponent],
    downtime: [DownTimeComponent, MultipleDownTimeComponent],
    warnings: [WarningsComponent],
  };

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
      return false;
      //todo: check for ids in component return this.holders.isIn(this.items.map(t => (t as any).id))
    }

    if (this.sideNavOpened) this.sideNavOpened = false;

    return false;
  }

  public setSidePanel(eventData: SidePanelInput) {
    this.ngZone.run(() => {
      if (typeof eventData === "object") {
        if (
          eventData &&
          ((eventData.items && eventData.items.length > 0) ||
            (eventData.group && eventData.what === "group-label"))
        ) {
          const items = this.getItems(eventData.items || [eventData.group]);
          if (items && items.length > 0) {
            this.setItems(items, this.mode);
            if (!this.sideNavOpened) {
              this.sideNavOpened = true;
            }
            return;
          }
        }
      }
      if (typeof eventData === "string") {
        this.setItems(eventData, this.mode);
        if (!this.sideNavOpened) {
          this.sideNavOpened = true;
        }
        return;
      }
      this.setItems([], this.mode);
      if (this.sideNavOpened) this.sideNavOpened = false;
    });
  }

  getItems(items: any[]): any[] {
    return [
      ...this.holders.bossAttacks.getByIds(items),
      ...this.holders.itemUsages.getByIds(items),
      ...this.holders.stances.getByIds(items),
      ...this.holders.jobs.getByIds(items),
      ...this.holders.abilities.getByIds(items),
      ...this.holders.bossDownTime.getByIds(items),
    ];
  }

  setItems(
    data: BaseHolder.IForSidePanel[] | string,
    mode: SidePanelMode = "default"
  ): void {
    let componentName = "";
    let newKey = "";
    if (typeof data === "string") {
      componentName = data;
      this.items = [];
      newKey = data;
    } else {
      componentName = data[0]?.sidePanelComponentName;
      this.items = data;
      newKey = this.calculateKey(this.items);
    }

    if (newKey === this.key) {
      this.refresher.next();
      return;
    }

    this.key = newKey;

    const componentType = this.createComponent(
      componentName,
      this.items.length > 1
    );

    if (componentType) {
      const injector = this.createInjector({
        items: this.items,
        mode: mode,
        refresh: this.refresher,
      });

      let component = new ComponentPortal(componentType, null, injector);

      if (component) {
        this.selectedPortal = component;
      }
    }
  }

  createComponent(name: string, isMany: boolean = false) {
    if (name) {
      const [one, many] = this.componentMap[name];
      return isMany ? many : one;
    }
  }

  createInjector(dataToPass: SidepanelParams): Injector {
    return Injector.create({
      providers: [{ provide: SIDEPANEL_DATA, useValue: dataToPass }],
      parent: this.injector,
      name: "Sidepanel injector",
    });
  }
}
