import { ITimelineContainer } from "./Holders/BaseHolder";
import { Warning } from "./Defensives/types";
import { AbilitiesMapHolder } from "./Holders/AbilitiesMapHolder";
import { AbilityAvailablityHolder } from "./Holders/AbilityAvailablityHolder";
import { AbilityUsageHolder } from "./Holders/AbilityUsageHolder";
import { BossAttacksHolder } from "./Holders/BossAttacksHolder";
import { BossDownTimeHolder } from "./Holders/BossDownTimeHolder";
import { BossTargetHolder } from "./Holders/BossTargetHolder";
import { BuffHeatmapHolder } from "./Holders/BuffHeatmapHolder";
import { JobsMapHolder } from "./Holders/JobsMapHolder";
import { StancesHolder } from "./Holders/StancesHolder";

export class Holders {
  itemUsages: AbilityUsageHolder;
  abilities: AbilitiesMapHolder;
  jobs: JobsMapHolder;
  bossAttacks: BossAttacksHolder;
  bossDownTime: BossDownTimeHolder;
  heatMaps: BuffHeatmapHolder;
  bossTargets: BossTargetHolder;
  stances: StancesHolder;
  abilityAvailability: AbilityAvailablityHolder;
  warnings: Warning[] = [];
  level: number = 100;

  constructor(
    mainTimeLine: ITimelineContainer,
    bossTimeLine: ITimelineContainer
  ) {
    this.itemUsages = new AbilityUsageHolder(mainTimeLine.items);
    this.abilities = new AbilitiesMapHolder(mainTimeLine.groups);
    this.jobs = new JobsMapHolder(mainTimeLine.groups);
    this.bossAttacks = new BossAttacksHolder(
      bossTimeLine.items,
      mainTimeLine.items
    );
    this.bossDownTime = new BossDownTimeHolder(
      bossTimeLine.items,
      mainTimeLine.items
    );
    this.heatMaps = new BuffHeatmapHolder(mainTimeLine.items);
    this.bossTargets = new BossTargetHolder(mainTimeLine.items, "boss");
    this.stances = new StancesHolder(mainTimeLine.items);
    this.abilityAvailability = new AbilityAvailablityHolder(mainTimeLine.items);
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
      this.itemUsages,
      this.abilities,
      this.jobs,
      this.bossAttacks,
      this.bossDownTime,
    ].some((x) => x.getByIds(ids).length > 0);
  }

  setHighLightLoadedView(highlightLoaded: boolean): void {
    this.itemUsages.setHighlightLoaded(highlightLoaded);
    this.stances.setHighlightLoaded(highlightLoaded);
  }
}
