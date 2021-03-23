import { Component, OnInit, OnDestroy, Inject } from "@angular/core";
import { ISidePanelComponent, SidepanelParams, SIDEPANEL_DATA } from "../ISidePanelComponent"
import * as M from "../../../core/Models"
import * as S from "../../../services/index"
import { Holders } from "../../../core/Holders";
import { BossAttackMap } from "../../../core/Maps/index";
import { calculateAvailDefsForAttack, calculateDefsForAttack } from "src/core/Defensives";
import { settings } from "src/core/Jobs/FFXIV";
import { SettingsEnum } from "src/core/Jobs/FFXIV/shared";
import { sum } from "ng-zorro-antd/core/util";


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

  constructor(
    private dispatcher: S.DispatcherService,
    @Inject(SIDEPANEL_DATA) public data: SidepanelParams
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

  abilityMatch(input:M.AbilityType, toMatch: M.AbilityType){
    return (input & toMatch) === toMatch
  }

  refresh() {
    this.defs = this.calculateDefs();
    this.availDefs = this.calculateAvailDefs();
    this.similar = this.holders.bossAttacks.filter(it => it.attack.name === this.it.attack.name && it.id !== this.it.id);

    var partyMitigation = -1;
    var partyShield = 0;
    var sums = {};
    var abs = this.defs.reduce((ac, j) => {
      return [...ac, ...j.abilities]
    }, []);
    var used = new Set();
    abs.forEach((a: { ability: M.IAbility, jobId: string, id: string }) => {
      if (used.has(a.ability.name) || used.has(a.ability.defensiveStats?.shareGroup)) return;

      used.add(a.ability.name);
      if (a.ability.defensiveStats?.shareGroup)
        used.add(a.ability.defensiveStats?.shareGroup);

      if (this.abilityMatch(a.ability.abilityType, M.AbilityType.PartyDefense)) {
        if (partyMitigation === -1) partyMitigation = 1;
        partyMitigation *= 1 - (a.ability.defensiveStats?.mitigationPercent || 0) / 100
      }

      if (this.abilityMatch(a.ability.abilityType, M.AbilityType.PartyShield)) {
        if (partyShield === -1) partyShield = 0;
        partyShield += a.ability.defensiveStats?.shieldPercent || 0
      }

      if (a.ability.abilityType === M.AbilityType.SelfShield) {
        const settingData = this.holders.itemUsages.get(a.id).getSettingData(SettingsEnum.Target);
        var jobId = settingData?.value || a.jobId;
        if (jobId) {
          if (!sums[jobId]) sums[jobId] = {shield: 0, mitigation : -1};
          sums[jobId].shield += a.ability.defensiveStats?.shieldPercent || 0
        }        
      }

      if (this.abilityMatch(a.ability.abilityType, M.AbilityType.SelfDefense) || this.abilityMatch(a.ability.abilityType, M.AbilityType.TargetDefense)) {
        const settingData = this.holders.itemUsages.get(a.id).getSettingData(SettingsEnum.Target);
        var jobId = settingData?.value || a.jobId;
        if (jobId) {
          if (!sums[jobId]) sums[jobId] = {shield: 0, mitigation : -1};
          if (sums[jobId].mitigation === -1) sums[jobId].mitigation = 1;
          sums[jobId].mitigation *= 1 - (a.ability.defensiveStats?.mitigationPercent || 0) / 100
        }        
      }
    });

    this.defStats = Object.keys(sums).map(s =>
    ({
      name: this.holders.jobs.get(s).job.name,
      mitigation: 1 - Math.abs(sums[s].mitigation * partyMitigation),
      shield: sums[s].shield + partyShield,
      icon: this.holders.jobs.get(s).job.icon
    })
    );
    this.defStats.push({
      name: "Party",
      mitigation: 1 - Math.abs(partyMitigation),
      shield: partyShield
    })

  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

}
