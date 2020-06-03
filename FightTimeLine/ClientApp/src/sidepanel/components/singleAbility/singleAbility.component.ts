import { Component, OnInit, OnDestroy } from "@angular/core";
import { ISidePanelComponent } from "../ISidePanelComponent"
import * as M from "../../../core/Models"
import * as X from "@xivapi/angular-client"
import { Utils } from "../../../core/Utils"
import { DomSanitizer } from "@angular/platform-browser";
import * as S from "../../../services/index"
import * as Shared from "../../../core/Jobs/FFXIV/shared";
import {AbilityUsageMap, JobStanceMap} from "../../../core/Maps/index";
import { Holders } from "../../../core/Holders";


@Component({
  selector: "singleAbility",
  templateUrl: "./singleAbility.component.html",
  styleUrls: ["./singleAbility.component.css"],
})
export class SingleAbilityComponent implements OnInit, OnDestroy, ISidePanelComponent {

  description: any;
  ptyMemUsages: any[];
  constructor(private xivapi: X.XivapiService, private sanitizer: DomSanitizer, private dispatcher: S.DispatcherService) {

  }

  items: any[];

  get it(): AbilityUsageMap {
    return this.items[0] as AbilityUsageMap;
  }

  get ability(): M.IAbility {
    const ability = this.it.ability.isStance
      ? (this.it as any as JobStanceMap).stanceAbility
      : this.it.ability.ability;
    return ability;
  }

  setItems(items: any[], holders: Holders): void {
    this.items = items;


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

    const setting = !this.it.ability.isStance && this.it.getSetting(Shared.settings.target.name);
    if (setting) {
      this.ptyMemUsages = holders.itemUsages.getByAbility(this.it.ability.id).map(it => {
        const data = it.getSettingData(setting.name);
        const job = data && data.value && holders.jobs.get(data.value);
        const string = job && job.actorName;
        return {
          id: it.id,
          offset: Utils.formatTime(it.start),
          icon: job && job.job && job.job.icon,
          target: string
        };
      });
    }
  }

  similarClick(val: any) {
    this.dispatcher.dispatch({
      name: "SidePanel Ability Click",
      payload: val.id
    });
  }

  private getEndpoint(type: string): X.XivapiEndpoint {
    switch (type) {
      case "item":
        return X.XivapiEndpoint.Item;
      default:
    }
    return X.XivapiEndpoint.Action;
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

}
