import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ComponentFactoryResolver, Injector, ApplicationRef, ComponentRef } from "@angular/core";
import { ComponentPortal, DomPortalOutlet, PortalOutlet, PortalInjector } from "@angular/cdk/portal";
import { SingleAbilityComponent } from "./components/singleAbility/singleAbility.component";
import { SingleAttackComponent } from "./components/singleAttack/singleAttack.component";
import { MultipleAbilityComponent } from "./components/multipleAbility/multipleAbility.component";
import { MultipleAttackComponent } from "./components/multipleAttack/multipleAttack.component";
import { MultipleDownTimeComponent } from "./components/multipleDowntime/multipleDowntime.component";
import { ISidePanelComponent, SidepanelParams, SIDEPANEL_DATA } from "./components/ISidePanelComponent";
import * as Jobcomponent from "./components/job/job.component";
import * as JobAbilitycomponent from "./components/jobAbility/jobAbility.component";
import { DownTimeComponent } from "./components/downtime/downtime.component";
import * as BaseHolder from "../core/Holders/BaseHolder";
import { Holders } from "../core/Holders";


@Component({
  selector: "sidepanel",
  templateUrl: "./sidepanel.component.html",
  styleUrls: ["./sidepanel.component.css"],
})
export class SidepanelComponent implements OnInit, OnDestroy, AfterViewInit {
  refresh() {
    if (this.ref) {
      this.ref.instance.refresh();
      return this.holders.isIn(this.items.map(t => (t as any).id))
    }

    return false;
  }

  @ViewChild("portalOutlet", { static: false })
  portalOutletRef: ElementRef;
  op: PortalOutlet;

  constructor(
    private injector: Injector,
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef
  ) {

  }

  items: BaseHolder.IForSidePanel[];
  holders: Holders;
  ref: ComponentRef<ISidePanelComponent>;
  key: string;

  private calculateKey(its: BaseHolder.IForSidePanel[]) {
    return its.sort().reduce((p, c) => p + c.id, "");
  }

  setItems(items: BaseHolder.IForSidePanel[], holders: Holders, mode: string = "default"): void {
    this.items = items;
    const newKey = this.calculateKey(this.items);
    if (newKey === this.key && this.ref) {
      this.ref.instance.refresh();
      return;
    }
    this.key = newKey;
    this.holders = holders;
    const injector = this.createInjector({
      items: items,
      holders: holders,
      mode: mode
  });
    let component = null;
    if (this.items && this.items.length > 0) {
      switch (this.items[0].sidePanelComponentName) {
        case "ability":
          if (items.length === 1) {
            component = new ComponentPortal(SingleAbilityComponent, null, injector);
          } else if (items.length > 1) {
            component = new ComponentPortal(MultipleAbilityComponent, null, injector);
          }
          break;
        case "bossAbility":
          if (items.length === 1) {
            component = new ComponentPortal(SingleAttackComponent, null, injector);
          } else if (items.length > 1) {
            component = new ComponentPortal(MultipleAttackComponent, null, injector);
          }
          break;
        case "job":
          component = new ComponentPortal(Jobcomponent.JobComponent, null, injector);
          break;
        case "jobAbility":
          component = new ComponentPortal(JobAbilitycomponent.JobAbilityComponent, null, injector);
          break;
        case "downtime":
          if (items.length === 1) {
            component = new ComponentPortal(DownTimeComponent, null, injector);
          } else if (items.length > 1) {
            component = new ComponentPortal(MultipleDownTimeComponent, null, injector);
          }
          
          break;
      }
    }

    if (this.op.hasAttached()) {
      this.op.detach();
      this.ref.destroy();
      this.ref = null;
    }

    if (component) {
      this.ref = this.op.attach(component) as ComponentRef<ISidePanelComponent>;
    }
  }

  createInjector(dataToPass: SidepanelParams): PortalInjector {
    const injectorTokens = new WeakMap();
    injectorTokens.set(SIDEPANEL_DATA, dataToPass);
    return new PortalInjector(this.injector, injectorTokens);
  }

  ngAfterViewInit(): void {
    this.op = new DomPortalOutlet(this.portalOutletRef.nativeElement, this.componentFactoryResolver, this.appRef, this.injector);
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.op.dispose();
  }

}
