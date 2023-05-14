import { Component, OnDestroy, Inject } from "@angular/core";
import * as M from "../../core/Models";
import * as S from "../../services/index";
import { Holders } from "../../core/Holders";
import { BossAttackMap } from "../../core/Maps/index";
import {
  calculateAvailDefsForAttack,
  calculateDefsForAttack,
  calculateMitigationForAttack,
} from "src/core/Defensives/functions";
import { VisStorageService } from "src/services/VisStorageService";
import { IForSidePanel } from "src/core/Holders/BaseHolder";
import { DispatcherPayloads } from "src/services/dispatcher.service";
import { Subscription } from "rxjs";
import {
  ISidePanelComponent,
  SIDEPANEL_DATA,
  SidepanelParams,
} from "../sidepanel/ISidePanelComponent";
import { DefsCalcResult, MitigationsResult, DefsCalcResultAbility } from "src/core/Defensives/types";

@Component({
  selector: "[singleAttack]",
  templateUrl: "./singleAttack.component.html",
  styleUrls: ["./singleAttack.component.css"],
})
export class SingleAttackComponent implements OnDestroy, ISidePanelComponent {
  defs: DefsCalcResult = null;
  availDefs: DefsCalcResult = null;
  similar: BossAttackMap[] = null;
  defStats: MitigationsResult = null;
  ff: {
    icon: string;
    name: string;
    data: { name: string; value: string }[];
  }[] = [];

  items: IForSidePanel[];
  holders: Holders;
  defSolo = true;
  defParty = true;
  defSoloAv = true;
  defPartyAv = true;
  sub: Subscription;

  constructor(
    private visStorage: VisStorageService,
    @Inject("DispatcherPayloads")
    private dispatcher: S.DispatcherService<DispatcherPayloads>,
    @Inject(SIDEPANEL_DATA) public data: SidepanelParams
  ) {
    this.items = this.data.items;
    this.holders = visStorage.holders;
    this.sub = this.data.refresh.subscribe(() => {
      this.refresh();
    });
    this.refresh();
  }

  get it(): BossAttackMap {
    return this.items[0] as BossAttackMap;
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
    this.dispatcher.dispatch("attackCopy", [value.id]);
  }

  calculateDefs(): DefsCalcResult {
    const newLocal = calculateDefsForAttack(this.holders, this.it.id);
    return newLocal;
  }

  calculateAvailDefs(): DefsCalcResult {
    const abilities = calculateAvailDefsForAttack(this.holders, this.it.id);
    return abilities;
  }

  edit(it) {
    this.dispatcher.dispatch("attackEdit", it.id);
  }

  similarClick(attack: BossAttackMap) {
    this.dispatcher.dispatch("similarClick", attack.id);
  }

  similarAllClick() {
    this.dispatcher.dispatch(
      "similarAllClick",
      this.similar.map((it) => it.id).concat([this.it.id])
    );
  }

  defenseClick(val: any) {
    this.dispatcher.dispatch("abilityClick", val.id);
  }

  availDefenseClick(val: DefsCalcResultAbility) {
    const abilityMap = this.holders.abilities.getByParentAndAbility(
      val.jobId,
      val.ability.name
    );
    this.dispatcher.dispatch("availAbilityClick", {
      abilityMap,
      attackId: this.it.id,
    });
  }

  pinnedChanged(val: boolean) {
    this.dispatcher.dispatch("toggleAttackPin", this.it.id);
  }

  getTargetIcon(ab): string {
    const us = this.holders.itemUsages.get(ab.id);
    const target = us?.getSettingData(M.SettingsEnum.Target);
    if (target) {
      const jobMap = this.holders.jobs.get(target.value);
      return jobMap?.job?.icon;
    }
    return null;
  }

  avAbilitiVisible(item: DefsCalcResultAbility[]) {
    return item.filter((i) => {
      if (i.ability.levelAcquired > this.visStorage.presenter.fightLevel) {
        return false;
      }

      if (i.ability.levelRemoved <= this.visStorage.presenter.fightLevel) {
        return false;
      }
      return true;
    });
  }

  refresh() {
    this.defs = this.calculateDefs();
    this.availDefs = this.calculateAvailDefs();
    this.similar = this.holders.bossAttacks
      .filter(
        (it) =>
          it.isForFfLogs(
            this.visStorage.presenter.filter.attacks.fflogsSource
          ) &&
          it.attack.name === this.it.attack.name &&
          it.id !== this.it.id
      )
      .sort((a, b) => a.startAsNumber - b.startAsNumber);
    this.defStats = calculateMitigationForAttack(
      this.holders,
      this.defs
    );
    this.ff = Object.keys(this.it.attack.fflogsData || {}).map((k) => ({
      icon: this.holders.jobs.get(k)?.job?.icon || "",
      name:
        this.holders.jobs.get(k)?.actorName ||
        this.holders.jobs.get(k)?.job?.name,
      data: Object.keys(this.it.attack.fflogsData[k])
        .filter((t) => this.it.attack.fflogsData[k][t])
        .map((t) => ({
          name: t,
          value: this.it.attack.fflogsData[k][t],
        })),
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
