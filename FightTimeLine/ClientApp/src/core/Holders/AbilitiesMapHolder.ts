import * as BaseHolder from "./BaseHolder";
import { DataSetDataGroup, DataGroup } from "vis-timeline"
import { AbilityMap } from "../Maps/AbilityMap";
import * as Models from "../Models";
import { JobMap } from "../Maps/JobMap";
import { settings } from "../Jobs/FFXIV/shared";

export class AbilitiesMapHolder extends BaseHolder.BaseHolder<string, DataGroup, AbilityMap> {

  constructor(private visItems: DataSetDataGroup) {
    super();
  }

  add(i: AbilityMap): void {
    super.add(i);
    this.visItems.add(this.itemOf(i));
  }

  remove(ids: string[]): void {
    super.remove(ids);
    this.visItems.remove(ids);
  }

  clear(): void {
    this.visItems.remove(this.getIds());
    super.clear();

  }

  getByParentId(parentId: string): AbilityMap[] {
    return this.filter((b: AbilityMap) => b.job.id === parentId);
  }

  isBossTargetForGroup(group: string): boolean {
    return this.values.some((b: AbilityMap) =>
      group === b.id &&
      b.ability.settings &&
      b.ability.settings.some(s => s.name === settings.changesTarget.name) &&
      b.job.id !== "boss");
  }

  getParent(group: string): string {
    return this.get(group).job.id;
  }

  getByParentAndAbility(jobId: string, ability: string): AbilityMap {
    return this.values.find((b: AbilityMap) =>
      b.job.id === jobId &&
      b.ability &&
      b.ability.name.toUpperCase() === ability.toUpperCase());
  }

  getStancesAbility(jobGroup: string): AbilityMap {
    return this.values.find((b: AbilityMap) => b.job.id === jobGroup && b.isStance);
  }

  getNonStancesAbilities(): AbilityMap[] {
    return this.filter(it => !it.isStance);
  }


  update(items: AbilityMap[]): void {
    // console.log("update AbilityMap")
    this.visItems.update(this.itemsOf(items));
  }

  applyFilter(used: (a) => boolean) {
    // console.log("AbilitiesMapHolder ApplyFilter")
    this.values.forEach(value => {
      const jobMap = value.job;
      const jobFilter = jobMap.presenter.jobFilter(jobMap.id);
      const visible = this.abilityFilter(value, jobMap.presenter.filter?.abilities, jobFilter?.filter, jobMap, used, jobMap.presenter.fightLevel);
      value.applyData({ filtered: !visible });
    });
    this.update(this.values);
  }

  private abilityFilter(value: AbilityMap, filter: Models.IAbilityFilter, jobFilter: Models.IAbilityFilter, jobMap: JobMap, used: (a) => boolean, fightLevel: number): boolean {
    const filterUnit = (aType: Models.AbilityType | Models.AbilityType[], gf: boolean, jf: boolean) => {
      let visible = false;
      const valueArray = Array.isArray(aType) ? aType : [aType];
      if (valueArray.some(it => value.hasValue(it))) {
        visible = gf;
        if (jf !== undefined)
          visible = jf;
      }
      return visible;
    };
    let visible: boolean;
    jobFilter = jobFilter || {};
    if (!filter || !value.ability) {
      visible = true;
    } else {
      if (value.ability.levelAcquired > fightLevel)
        return false;

      visible = filterUnit([Models.AbilityType.SelfDefense, Models.AbilityType.SelfShield], filter.selfDefence, jobFilter.selfDefence);
      visible ||= filterUnit([Models.AbilityType.PartyDefense, Models.AbilityType.PartyShield, Models.AbilityType.TargetDefense], filter.partyDefence, jobFilter.partyDefence);
      visible ||= filterUnit(Models.AbilityType.SelfDamageBuff, filter.selfDamageBuff, jobFilter.selfDamageBuff);
      visible ||= filterUnit(Models.AbilityType.PartyDamageBuff, filter.partyDamageBuff, jobFilter.partyDamageBuff);
      visible ||= filterUnit(Models.AbilityType.Damage, filter.damage, jobFilter.damage);
      visible ||= filterUnit(Models.AbilityType.HealingBuff, filter.healingBuff, jobFilter.healingBuff);
      visible ||= filterUnit(Models.AbilityType.Healing, filter.healing, jobFilter.healing);      
      visible ||= filterUnit(Models.AbilityType.Utility, filter.utility, jobFilter.utility);
      visible ||= filterUnit(Models.AbilityType.Enmity, filter.enmity, jobFilter.enmity);

      if (!filter.unused ||
        (jobFilter.unused !== undefined && !jobFilter.unused)) {
        if (!jobFilter.unused)
          visible = visible && used(value.id);
      }

    }

    // visible = visible && !value.hidden;

    return visible;
  }


}
