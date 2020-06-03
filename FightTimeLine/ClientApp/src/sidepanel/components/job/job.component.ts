import { Component, OnInit, OnDestroy } from "@angular/core";
import { ISidePanelComponent } from "../ISidePanelComponent"
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


  constructor(private dispatcher: S.DispatcherService) {

  }

  get it(): JobMap {
    return this.items[0];
  }

  getType(id: number): string {
    return M.DamageType[id];
  }

  setItems(items: any[], holders: Holders): void {
    this.items = items;
    this.holders = holders;

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


  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

}
