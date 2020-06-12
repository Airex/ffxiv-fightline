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


  constructor(
    private dispatcher: S.DispatcherService,
    @Inject(SIDEPANEL_DATA) private data: SidepanelParams
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
  }

  resetJobFilter() {
    console.log("reset job filter requested");
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
    this.dispatcher.dispatch({
      name: "Update Filter"
    });
  }

  updateFilter(data: M.IAbilityFilter, prop: string): void {
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
