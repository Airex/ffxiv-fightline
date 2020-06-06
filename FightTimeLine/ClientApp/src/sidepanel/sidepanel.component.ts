import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ComponentFactoryResolver, Injector, ApplicationRef, ComponentRef } from "@angular/core";
import { ComponentPortal, Portal, TemplatePortal, CdkPortalOutlet, DomPortalOutlet, PortalOutlet, DomPortalHost } from "@angular/cdk/portal";
import { SingleAbilityComponent } from "./components/singleAbility/singleAbility.component";
import { SingleAttackComponent } from "./components/singleAttack/singleAttack.component";
import { MultipleAbilityComponent } from "./components/multipleAbility/multipleAbility.component";
import { MultipleAttackComponent } from "./components/multipleAttack/multipleAttack.component";
import { ISidePanelComponent } from "./components/ISidePanelComponent";
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
      this.ref.instance.setItems(this.items, this.holders);
      return this.holders.isIn(this.items.map(t=>(t as any).id))
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

  setItems(items: BaseHolder.IForSidePanel[], holders: Holders): void {
    this.items = items;
    this.holders = holders;
    let component = null;
    if (this.items && this.items.length > 0) {
      switch (this.items[0].sidePanelComponentName) {
        case "ability":
          if (items.length === 1) {
            component = new ComponentPortal(SingleAbilityComponent);
          } else if (items.length > 1) {
            component = new ComponentPortal(MultipleAbilityComponent);
          }
          break;
        case "bossAbility":
          if (items.length === 1) {
            component = new ComponentPortal(SingleAttackComponent);
          } else if (items.length > 1) {
            component = new ComponentPortal(MultipleAttackComponent);
          }
          break;
        case "job":
          component = new ComponentPortal(Jobcomponent.JobComponent);
          break;
        case "jobAbility":
          component = new ComponentPortal(JobAbilitycomponent.JobAbilityComponent);
          break;
        case "downtime":
          component = new ComponentPortal(DownTimeComponent);
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
      this.ref.instance.setItems(this.items, this.holders);
    }
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
