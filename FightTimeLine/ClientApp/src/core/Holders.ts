import * as AbilityUsageHolder from "./Holders/AbilityUsageHolder";
import * as AbilitiesMapHolder from "./Holders/AbilitiesMapHolder";
import * as JobsMapHolder from "./Holders/JobsMapHolder";
import * as BossAttacksHolder from "./Holders/BossAttacksHolder";
import * as BossDownTimeHolder from "./Holders/BossDownTimeHolder";
import * as BuffHeatmapHolder from "./Holders/BuffHeatmapHolder";
import * as BossTargetHolder from "./Holders/BossTargetHolder";
import * as StancesHolder from "./Holders/StancesHolder";
import * as AbilityAvailablityHolder from "./Holders/AbilityAvailablityHolder";

import { ITimelineContainer } from "./Holders/BaseHolder";
import { Warning } from "./Defensives/types";

export class Holders {
  itemUsages: AbilityUsageHolder.AbilityUsageHolder;
  abilities: AbilitiesMapHolder.AbilitiesMapHolder;
  jobs: JobsMapHolder.JobsMapHolder;
  bossAttacks: BossAttacksHolder.BossAttacksHolder;
  bossDownTime: BossDownTimeHolder.BossDownTimeHolder;
  heatMaps: BuffHeatmapHolder.BuffHeatmapHolder;
  bossTargets: BossTargetHolder.BossTargetHolder;
  stances: StancesHolder.StancesHolder;
  abilityAvailability: AbilityAvailablityHolder.AbilityAvailablityHolder;
  warnings: Warning[] = [];
  level: number = 90;

  constructor(mainTimeLine: ITimelineContainer, bossTimeLine: ITimelineContainer) {
    this.itemUsages = new AbilityUsageHolder.AbilityUsageHolder(mainTimeLine.items);
    this.abilities = new AbilitiesMapHolder.AbilitiesMapHolder(mainTimeLine.groups);
    this.jobs = new JobsMapHolder.JobsMapHolder(mainTimeLine.groups);
    this.bossAttacks = new BossAttacksHolder.BossAttacksHolder(bossTimeLine.items, mainTimeLine.items);
    this.bossDownTime = new BossDownTimeHolder.BossDownTimeHolder(bossTimeLine.items, mainTimeLine.items);
    this.heatMaps = new BuffHeatmapHolder.BuffHeatmapHolder(mainTimeLine.items);
    this.bossTargets = new BossTargetHolder.BossTargetHolder(mainTimeLine.items, "boss");
    this.stances = new StancesHolder.StancesHolder(mainTimeLine.items);
    this.abilityAvailability = new AbilityAvailablityHolder.AbilityAvailablityHolder(mainTimeLine.items);
  }

  clear() {
    this.itemUsages.clear();
    this.abilities.clear();
    this.jobs.clear();
    this.bossAttacks.clear();
    this.bossDownTime.clear();
    this.heatMaps.clear();
    this.bossTargets.clear();
    this.stances.clear();
    this.abilityAvailability.clear();
  }

  isIn(ids: string[]) {
    return [
      ...this.itemUsages.getByIds(ids),
      ...this.abilities.getByIds(ids),
      ...this.jobs.getByIds(ids),
      ...this.bossAttacks.getByIds(ids),
      ...this.bossDownTime.getByIds(ids)
    ].length > 0;
  }

  setHighLightLoadedView(highlightLoaded: boolean): void {
    this.itemUsages.setHighlightLoaded(highlightLoaded);
    this.stances.setHighlightLoaded(highlightLoaded);
  }

}
