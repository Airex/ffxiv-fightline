import { Component, OnInit, OnDestroy, Inject } from "@angular/core";
import * as M from "../../core/Models"
import * as S from "../../services/index"
import { Holders } from "../../core/Holders";
import { AbilityMap } from "../../core/Maps/index";
import { DomSanitizer } from "@angular/platform-browser";
import { FFXIVApiService } from "src/services/FFxivApiService";
import { VisStorageService } from "src/services/VisStorageService";
import { DispatcherPayloads } from "src/services/dispatcher.service";
import { Subscription } from "rxjs";
import { ISidePanelComponent, SIDEPANEL_DATA, SidepanelParams } from "../sidepanel/ISidePanelComponent";


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
  sub: Subscription;

  constructor(
    private visStorage: VisStorageService,
    private xivapi: FFXIVApiService,
    private sanitizer: DomSanitizer,
    @Inject("DispatcherPayloads") private dispatcher: S.DispatcherService<DispatcherPayloads>,
    @Inject(SIDEPANEL_DATA) public data: SidepanelParams
  ) {
    this.items = this.data.items;
    this.holders = this.visStorage.holders;
    this.sub = this.data.refresh.subscribe(()=>{
      this.refresh();
    });
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
      this.dispatcher.dispatch("toggleJobAbilityCompactView", this.it.id);
    }, 1);
  }

  hide(ab: AbilityMap) {
    this.dispatcher.dispatch("hideJobAbility", ab.id);
  }

  clear(ab: AbilityMap) {
    this.dispatcher.dispatch("clearJobAbility", ab.id);
  }

  fill(ab: AbilityMap) {
    this.dispatcher.dispatch("fillJobAbility", ab.id);
  }

  refresh() {
    this.compactView = this.it.isCompact;

    if (this.ability.xivDbId) {
      this.xivapi.loadDescription(this.ability.xivDbType, this.ability.xivDbId)
        .subscribe(a => {
          if (a?.Description) {
            const trimmed = a.Description.replace(new RegExp("\\n+", "g"), "<br />").replace(new RegExp("(<br />)+", "g"), "<br/>");
            this.description = this.sanitizer.bypassSecurityTrustHtml(trimmed);
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
    this.sub.unsubscribe();
  }

}
