import { Component, OnInit, OnDestroy, Inject } from "@angular/core";
import * as M from "../../core/Models"
import * as S from "../../services/index"
import { Holders } from "../../core/Holders";
import { JobMap, AbilityMap } from "../../core/Maps/index";
import { VisStorageService } from "src/services/VisStorageService";
import { DispatcherPayloads } from "src/services/dispatcher.service";
import { Subscription } from "rxjs";
import { ISidePanelComponent, SIDEPANEL_DATA, SidepanelParams } from "../sidepanel/ISidePanelComponent";

@Component({
  selector: "job-area",
  templateUrl: "./job.component.html",
  styleUrls: ["./job.component.css"],
})
export class JobComponent implements OnInit, OnDestroy, ISidePanelComponent {

  items: any[];
  holders: Holders;
  hiddenAbilities: any[] = null;
  compactView: boolean;
  jobFilter: M.IAbilityFilter;
  sub:Subscription;


  filters = Object.entries(<{ [name: string]: [number, string] }>{
    selfDefence: [0, "Self Defense"],
    partyDefence: [1, "Party Defense"],
    selfDamageBuff: [2, "Self Damage Buff"],
    partyDamageBuff: [3, "Party Damage Buff"],
    damage: [4, "OGCD Damage"],
    healing: [5, "Healing"],
    healingBuff: [6, "Healing Buff"],
    utility: [7, "Utility"],
    enmity: [8, "Enmity"],
    unused: [10, "Show Unused"],
    pet: [9, null],
  })
    .filter(f => f[1][1])
    .sort((a, b) => a[1][0] - b[1][0])
    .map(a => ({ name: a[0], desc: a[1][1] }));


  constructor(
    @Inject("DispatcherPayloads") private dispatcher: S.DispatcherService<DispatcherPayloads>,
    visStorage: VisStorageService,
    private ds: S.DialogService,
    @Inject(SIDEPANEL_DATA) public data: SidepanelParams
  ) {
    this.items = this.data.items;
    this.holders = visStorage.holders;
    this.sub = this.data.refresh.subscribe(()=>{
      this.refresh();
    });
    this.refresh();

  }

  get it(): JobMap {
    return this.items[0];
  }

  getType(id: number): string {
    return M.DamageType[id];
  }
  stats() {
    this.ds.openCharacterDialog({ ...this.it.stats }, (value) => {
      if (value) {
        this.dispatcher.dispatch("changeJobStats", {
          id: this.it.id,
          data: value.data
        })
      }
    });
  }

  compact() {
    this.dispatcher.dispatch("toggleJobCompactView", this.it.id);
  }


  fill(ab: JobMap) {
    this.dispatcher.dispatch("fillJob", ab.id);
  }

  refresh() {
    this.compactView = this.it.isCompact;
    this.jobFilter = this.it.filter;
    this.hiddenAbilities = this.holders.abilities.getByParentId(this.it.id).filter(t => t.hidden);
  }


  remove(job: JobMap) {
    this.dispatcher.dispatch("removeJob", job.id);
  }

  restore(ab: AbilityMap) {
    this.dispatcher.dispatch("jobAbilityRestore", ab.id);
    this.refresh();
  }

  restoreAll() {
    this.dispatcher.dispatch("jobAbilityRestoreAll", this.it.id);
    this.refresh();
  }

  resetJobFilter(name?: string) {
    (name ? [name] : Object.keys(this.jobFilter)).forEach(k => {
      delete this.jobFilter[k];
    });

    this.dispatcher.dispatch("updateFilter");
  }

  updateFilter(data: boolean, prop: string): void {
    this.jobFilter[prop] = data;
    this.dispatcher.dispatch("updateFilter");
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

}
