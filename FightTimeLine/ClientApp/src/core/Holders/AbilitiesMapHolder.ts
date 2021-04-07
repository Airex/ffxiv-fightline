import * as BaseHolder from "./BaseHolder";
import {DataSetDataGroup, DataGroup } from "vis-timeline"
import { AbilityMap }from "../Maps/AbilityMap";
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
    this.visItems.update(this.itemsOf(items));
  }

  applyFilter(filter: Models.IAbilityFilter, used: (a) => boolean) {
    this.values.forEach(value => {
      const jobMap = value.job;
      const visible = this.abilityFilter(value, filter, jobMap, used);
      value.applyData({ filtered: !visible });
    });
    this.update(this.values);
  }

  private abilityFilter(value: AbilityMap, filter: Models.IAbilityFilter, jobMap: JobMap, used: (a) => boolean): boolean {
    const jobFilter = jobMap.filter;
    const filterUnit = (aType: Models.AbilityType | Models.AbilityType[], globalFilter: boolean, jobFilter: boolean) => {
      let visible = false;
      const valueArray = Array.isArray(aType) ? aType : [aType];
      if (valueArray.some(it => value.hasValue(it))) {
        visible = globalFilter;
        if (jobFilter !== undefined)
          visible = jobFilter;
      }
      return visible;
    };
    let visible: boolean;
    if (!filter || !jobFilter || !value.ability) {
      visible = true;
    } else {
      if ((jobMap.pet || jobMap.job.defaultPet) && value.ability.pet && value.ability.pet !== (jobMap.pet || jobMap.job.defaultPet)) {
        visible = false;
      } else {
        visible = filterUnit([Models.AbilityType.SelfDefense, Models.AbilityType.SelfShield], filter.selfDefence, jobFilter.selfDefence);
        visible = visible || filterUnit([Models.AbilityType.PartyDefense, Models.AbilityType.PartyShield, Models.AbilityType.TargetDefense], filter.partyDefence, jobFilter.partyDefence);
        visible = visible || filterUnit(Models.AbilityType.SelfDamageBuff, filter.selfDamageBuff, jobFilter.selfDamageBuff);
        visible = visible || filterUnit(Models.AbilityType.PartyDamageBuff, filter.partyDamageBuff, jobFilter.partyDamageBuff);
        visible = visible || filterUnit(Models.AbilityType.Damage, filter.damage, jobFilter.damage);
        visible = visible || filterUnit(Models.AbilityType.HealingBuff, filter.healingBuff, jobFilter.healingBuff);
        visible = visible || filterUnit(Models.AbilityType.Healing, filter.healing, jobFilter.healing);
        // visible = visible || filterUnit(Models.AbilityType.Pet, filter.pet, jobFilter.pet);
        visible = visible || filterUnit(Models.AbilityType.Utility, filter.utility, jobFilter.utility);
        visible = visible || filterUnit(Models.AbilityType.Enmity, filter.enmity, jobFilter.enmity);

        if (!filter.unused ||
          (jobFilter.unused !== undefined && !jobFilter.unused)) {
          if (!jobFilter.unused)
            visible = visible && used(value.id);
        }
      }
    }

    visible = visible && !value.hidden;

    return visible;
  }


}
