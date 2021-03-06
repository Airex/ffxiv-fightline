import { Component, OnInit, OnDestroy, Inject } from "@angular/core";
import { ISidePanelComponent, SidepanelParams, SIDEPANEL_DATA } from "../ISidePanelComponent"
import * as M from "../../../core/Models"
import * as S from "../../../services/index"
import { Holders } from "../../../core/Holders";
import { BossAttackMap } from "../../../core/Maps/index";
import { calculateAvailDefsForAttack, calculateDefsForAttack, calculateMitigationForAttack } from "src/core/Defensives";
import { SettingsEnum } from "src/core/Jobs/FFXIV/shared";
import { VisStorageService } from "src/services/VisStorageService";

@Component({
  selector: "singleAttack",
  templateUrl: "./singleAttack.component.html",
  styleUrls: ["./singleAttack.component.css"],
})
export class SingleAttackComponent implements OnInit, OnDestroy, ISidePanelComponent {

  defs: any[] = null;
  availDefs: any[] = null;
  similar: any[] = null;
  defStats: any[] = [];

  items: any[];
  holders: Holders;
  defSolo = true;
  defParty = true;
  defSoloAv = true;
  defPartyAv = true;

  constructor(
    private visStorage: VisStorageService,
    private dispatcher: S.DispatcherService,
    @Inject(SIDEPANEL_DATA) public data: SidepanelParams
  ) {
    this.items = this.data.items;
    this.holders = this.visStorage.holders;
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
    const newLocal = calculateDefsForAttack(this.holders, this.it.id);
    return newLocal;
  }

  calculateAvailDefs() {
    return calculateAvailDefsForAttack(this.holders, this.it.id);
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

  getTargetIcon(ab): string {
    const us = this.holders.itemUsages.get(ab.id);
    const target = us?.getSettingData(SettingsEnum.Target);
    if (target) {
      const jobMap = this.holders.jobs.get(target.value);
      return jobMap?.job?.icon;
    }
    return null;
  }



  refresh() {
    this.defs = this.calculateDefs();
    this.availDefs = this.calculateAvailDefs();
    this.similar = this.holders.bossAttacks
      .filter(it => it.attack.name === this.it.attack.name && it.id !== this.it.id)
      .sort((a,b) => a.startAsNumber - b.startAsNumber);
    this.defStats = calculateMitigationForAttack(this.holders, this.defs, this.it.attack)
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

}
