import { Component, OnInit, OnDestroy, Inject } from "@angular/core";
import { ISidePanelComponent, SidepanelParams, SIDEPANEL_DATA } from "../ISidePanelComponent"
import * as M from "../../../core/Models"
import * as S from "../../../services/index"
import { Holders } from "../../../core/Holders";
import { AbilityMap } from "../../../core/Maps/index";
import { DomSanitizer } from "@angular/platform-browser";
import { FFXIVApiService } from "src/services/FFxivApiService";
import { VisStorageService } from "src/services/VisStorageService";


@Component({
  selector: "job-ability",
  templateUrl: "./jobAbility.component.html",
  styleUrls: ["./jobAbility.component.css"],
})
export class JobAbilityComponent implements OnInit, OnDestroy, ISidePanelComponent {

  description: any = "";
  compactView: boolean;
  items: any[];
  holders: Holders;

  constructor(
    private visStorage: VisStorageService,
    private xivapi: FFXIVApiService,
    private sanitizer: DomSanitizer,
    private dispatcher: S.DispatcherService,
    @Inject(SIDEPANEL_DATA) public data: SidepanelParams
  ) {
    this.items = this.data.items;
    this.holders = this.visStorage.holders;
    this.refresh();

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





  compact() {
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

  clear(ab: AbilityMap) {
    this.dispatcher.dispatch({
      name: "SidePanel Clear Job Ability",
      payload: ab.id
    });
  }

  fill(ab: AbilityMap) {
    this.dispatcher.dispatch({
      name: "SidePanel Fill Job Ability",
      payload: ab.id
    });
  }

  refresh() {
    this.compactView = this.it.isCompact;

    if (this.ability.xivDbId) {
      this.xivapi.loadDescription(this.ability.xivDbType,this.ability.xivDbId)
        .subscribe(a => {
          if (a && a.Description) {
            this.description =
              this.sanitizer.bypassSecurityTrustHtml(a.Description.replace(new RegExp("\\n+", "g"), "<br/>"));
          } else {
            this.description = "";
          }
        });
    }
  }

  calculateDefs() {
    //const usages = this.holders.itemUsages.getByAbility(this.it.id);
    //calculateDefsForAttack(this.holders, this.it.id);
  }


  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

}
