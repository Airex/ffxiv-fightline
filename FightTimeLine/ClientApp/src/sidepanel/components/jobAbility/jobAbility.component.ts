import { Component, OnInit, OnDestroy } from "@angular/core";
import { ISidePanelComponent } from "../ISidePanelComponent"
import * as M from "../../../core/Models"
import * as S from "../../../services/index"
import { Utils } from "../../../core/Utils"
import { Holders } from "../../../core/Holders";
import { AbilityMap } from "../../../core/Maps/index";
import { DomSanitizer } from "@angular/platform-browser";
import * as X from "@xivapi/angular-client"


@Component({
  selector: "job-ability",
  templateUrl: "./jobAbility.component.html",
  styleUrls: ["./jobAbility.component.css"],
})
export class JobAbilityComponent implements OnInit, OnDestroy, ISidePanelComponent {

  description:any = "";
  compactView:boolean;
  items: any[];
  holders: Holders;

  constructor(private xivapi: X.XivapiService, private sanitizer: DomSanitizer, private dispatcher: S.DispatcherService) {

  }

  get it(): AbilityMap {
    return this.items[0];
  }


  get ability(): M.IAbility {
    return this.it.ability;
  }

  getType(id: number): string {
    return M.DamageType[id];
  }

  private getEndpoint(type: string): X.XivapiEndpoint {
    switch (type) {
    case "item":
      return X.XivapiEndpoint.Item;
    default:
    }
    return X.XivapiEndpoint.Action;
  }

  setItems(items: any[], holders: Holders): void {
    this.items = items;
    this.holders = holders;

    this.compactView = this.it.isCompact;

    if (this.ability.xivDbId) {
      this.xivapi.get(this.getEndpoint(this.ability.xivDbType), Number(this.ability.xivDbId)).subscribe(a => {
        if (a && a.Description) {
          this.description =
            this.sanitizer.bypassSecurityTrustHtml(a.Description.replace(new RegExp("\\n+", "g"), "<br/>"));
        } else {
          this.description = "";
        }
      });
    }
  }

  compact(value) {
    setTimeout(() => {
        this.dispatcher.dispatch({
          name: "SidePanel Toggle Job Ability Compact View",
          payload: this.it.id
        });
      },
      1);
  }

  hide(ab: AbilityMap) {
    this.dispatcher.dispatch({
      name: "SidePanel Hide Job Ability",
      payload: ab.id
  });
  }

  fill(ab: AbilityMap) {
    this.dispatcher.dispatch({
      name: "SidePanel Fill Job Ability",
      payload: ab.id
    });
  }




  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

}
