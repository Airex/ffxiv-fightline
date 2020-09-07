import { Component, OnInit, OnDestroy, Inject } from "@angular/core";
import { ISidePanelComponent,SidepanelParams,SIDEPANEL_DATA } from "../ISidePanelComponent"
import * as M from "../../../core/Models"
import * as S from "../../../services/index"
import { Utils } from "../../../core/Utils"
import {Holders} from "../../../core/Holders";
import {BossAttackMap} from "../../../core/Maps/index";


@Component({
  selector: "singleAttack",
  templateUrl: "./singleAttack.component.html",
  styleUrls: ["./singleAttack.component.css"],
})
export class SingleAttackComponent implements OnInit, OnDestroy, ISidePanelComponent {

  defs: any[] = null;
  availDefs: any[] = null;
  similar: any[] = null;

  items: any[];
  holders: Holders;

  constructor(
    private dispatcher: S.DispatcherService,
    @Inject(SIDEPANEL_DATA) private data: SidepanelParams
  ) {
    this.items = this.data.items;
    this.holders = this.data.holders;
   this.refresh();
  }

  get it(): BossAttackMap {
    return this.items[0];
  }

  getType(id: number): string {
    return M.DamageType[id];
  }

  getTypeColor(id: number): string {
    const type = id as M.DamageType;
    switch (type) {
      case M.DamageType.Physical:
        return "red";
      case M.DamageType.Magical:
        return "blue";
    }
    return "default";
  }

  copy(value: BossAttackMap) {
    this.dispatcher.dispatch({
      name: "SidePanel Attack Copy",
      payload: [value.id]
    });
  }

  calculateDefs() {
    const bossAttackItems = this.holders.bossAttacks.get(this.it.id);

    if (!bossAttackItems) return [];

    const defAbilities = this.holders.itemUsages.filter((it) => {
      const ab = it.ability;
      return ab.isDef;
    });

    const intersected = defAbilities.filter((it) => {
      const end = new Date(it.startAsNumber + it.calculatedDuration * 1000);
      return it.start <= bossAttackItems.start && end >= bossAttackItems.start;
    });

    const values = intersected.map((it) => {
      const jobMap = it.ability.job;
      return { jobId: jobMap.id, jobName: jobMap.job.name, ability: it.ability.ability, id: it.id };
    });

    const grouped = Utils.groupBy(values, x => x.jobId);

    return Object.keys(grouped).map((value) => {
      return {
        job: this.holders.jobs.get(value).job,
        abilities: grouped[value]
      };
    }).sort((a, b) => a.job.role - b.job.role);

  }

  calculateAvailDefs() {
    const bossAttackItems = this.holders.bossAttacks.get(this.it.id);

    if (!bossAttackItems) return [];
    
    const defAbilities = this.holders.abilities.filter((it) => {
      return it.isDef;
    });

    const intersected = defAbilities.filter((it) => {
      const abilities = this.holders.itemUsages.getByAbility(it.id);
      return !abilities.some(ab => {
        const end = new Date(ab.startAsNumber + ab.ability.ability.cooldown * 1000);
        return ab.start <= bossAttackItems.start && end >= bossAttackItems.start;
      })
      
    });

    const values = intersected.map((it) => {
      const jobMap = it.job;
      return { jobId: jobMap.id, jobName: jobMap.job.name, ability: it.ability, id: it.id };
    });

    const grouped = Utils.groupBy(values, x => x.jobId);

    return Object.keys(grouped).map((value) => {
      return {
        job: this.holders.jobs.get(value).job,
        abilities: grouped[value]
      };
    }).sort((a, b) => a.job.role - b.job.role);

  }

  edit(it) {
    this.dispatcher.dispatch({
      name: "SidePanel Attack Edit Click",
      payload: it.id
    });
  }

  similarClick(attack: BossAttackMap) {
    this.dispatcher.dispatch({
      name: "SidePanel Similar Click",
      payload: attack.id
    });
  }

  similarAllClick() {
    this.dispatcher.dispatch({
      name: "SidePanel Similar All Click",
      payload: this.similar.map(it => it.id).concat([this.it.id])
    });
  }

  defenseClick(val: any) {
    this.dispatcher.dispatch({
      name: "SidePanel Ability Click",
      payload: val.id
    });
  }

  refresh() {
    this.defs = this.calculateDefs();
    this.availDefs = this.calculateAvailDefs();
    this.similar = this.holders.bossAttacks.filter(it => it.attack.name === this.it.attack.name && it.id !== this.it.id);
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

}
