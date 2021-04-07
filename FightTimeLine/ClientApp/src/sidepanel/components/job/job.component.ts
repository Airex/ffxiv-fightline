import { Component, OnInit, OnDestroy, Inject } from "@angular/core";
import { ISidePanelComponent, SidepanelParams, SIDEPANEL_DATA } from "../ISidePanelComponent"
import * as M from "../../../core/Models"
import * as S from "../../../services/index"
import { Holders } from "../../../core/Holders";
import { JobMap, AbilityMap } from "../../../core/Maps/index";

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
    private dispatcher: S.DispatcherService,
    @Inject(SIDEPANEL_DATA) public data: SidepanelParams
  ) {
    this.items = this.data.items;
    this.holders = this.data.holders;
    this.refresh();

  }

  get it(): JobMap {
    return this.items[0];
  }

  getType(id: number): string {
    return M.DamageType[id];
  }

  compact(value) {
    this.dispatcher.dispatch({
      name: "SidePanel Toggle Job Compact View",
      payload: this.it.id
    });
  }


  fill(ab: JobMap) {
    this.dispatcher.dispatch({
      name: "SidePanel Fill Job",
      payload: ab.id
    });
  }

  refresh() {
    this.compactView = this.it.isCompact;

    this.jobFilter = this.it.filter;
    this.hiddenAbilities = this.holders.abilities.getByParentId(this.it.id).filter(t => t.hidden);
  }


  remove(job: JobMap) {
    this.dispatcher.dispatch({
      name: "SidePanel Remove Job",
      payload: job.id
    });
  }

  restore(ab: AbilityMap) {
    this.dispatcher.dispatch({
      name: "SidePanel Restore Job Ability",
      payload: ab.id
    });
    this.refresh();
  }

  resetJobFilter(name?: string) {
    //console.log("reset job filter requested");
    if (name) {
      Object.assign(this.jobFilter,
        {
          [name]: undefined          
        });
    }
    else {
      Object.assign(this.jobFilter,
        {
          unused: undefined,
          utility: undefined,
          damage: undefined,
          selfDefence: undefined,
          partyDefence: undefined,
          healing: undefined,
          healingBuff: undefined,
          partyDamageBuff: undefined,
          selfDamageBuff: undefined,
          enmity: undefined,
        });
    }
    this.dispatcher.dispatch({
      name: "Update Filter"
    });
  }

  updateFilter(data: boolean, prop: string): void {
    this.jobFilter[prop] = data;
    this.dispatcher.dispatch({
      name: "Update Filter"
    });
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

}
