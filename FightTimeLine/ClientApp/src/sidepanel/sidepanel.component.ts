import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ComponentFactoryResolver, Injector, ApplicationRef, ComponentRef } from "@angular/core";
import { ComponentPortal, Portal, TemplatePortal, CdkPortalOutlet, DomPortalOutlet, PortalOutlet } from "@angular/cdk/portal";
import { SingleAbilityComponent } from "./components/singleAbility/singleAbility.component";
import { SingleAttackComponent } from "./components/singleAttack/singleAttack.component";
import { MultipleAbilityComponent } from "./components/multipleAbility/multipleAbility.component";
import { MultipleAttackComponent } from "./components/multipleAttack/multipleAttack.component";
import { ISidePanelComponent } from "./components/ISidePanelComponent";
import { Holders } from "../core/DataHolders";



@Component({
  selector: "sidepanel",
  templateUrl: "./sidepanel.component.html",
  styleUrls: ["./sidepanel.component.css"],
})
export class SidepanelComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild("portalOutlet", { static: true })
  portalOutletRef: ElementRef;
  op: PortalOutlet;

  constructor(
    private injector: Injector,
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef
  ) {

  }

  items: any[];

  setItems(items: any[], holders: Holders): void {
    this.items = items;

    let component = null;
    if (items.length === 1) {
      if (items[0].ability) {
        component = new ComponentPortal(SingleAbilityComponent);
      } else {
        component = new ComponentPortal(SingleAttackComponent);
      }
    } else if (items.length > 1) {
      if (items[0].ability) {
        component = new ComponentPortal(MultipleAbilityComponent);
      } else {
        component = new ComponentPortal(MultipleAttackComponent);
      }
    }

    if (this.op.hasAttached()) {
      this.op.detach();
    }

    if (component) {
      const ref = this.op.attach(component) as ComponentRef<ISidePanelComponent>;
      ref.instance.setItems(this.items, holders);
    }
  }

  ngAfterViewInit(): void {
    this.op = new DomPortalOutlet(this.portalOutletRef.nativeElement, this.componentFactoryResolver, this.appRef, this.injector);
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

}
