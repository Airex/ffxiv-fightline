import * as BaseHolder from "./BaseHolder";
import { DataSetDataGroup, DataGroup } from "vis-timeline";
import { AbilityMap } from "../Maps/AbilityMap";
import * as Models from "../Models";

const filterMap: { [ab in keyof Models.IAbilityFilter]: Models.AbilityType | Models.AbilityType[] } =
{
  selfDefence: [Models.AbilityType.SelfDefense, Models.AbilityType.SelfShield],
  partyDefence: [Models.AbilityType.PartyDefense, Models.AbilityType.PartyShield, Models.AbilityType.TargetDefense],
  selfDamageBuff: Models.AbilityType.SelfDamageBuff,
  partyDamageBuff: Models.AbilityType.PartyDamageBuff,
  damage: Models.AbilityType.Damage,
  healingBuff: Models.AbilityType.HealingBuff,
  healing: Models.AbilityType.Healing,
  utility: Models.AbilityType.Utility,
  enmity: Models.AbilityType.Enmity,
};

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
      b.ability.settings.some(s => s.name === Models.settings.changesTarget.name) &&
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
      const visible = this.abilityFilter(
        value,
        jobMap.presenter.filter?.abilities,
        jobFilter?.filter,
        used,
        jobMap.presenter.fightLevel);
      value.applyData({ filtered: !visible });
    });
    this.update(this.values);
  }

  private abilityFilter(
    value: AbilityMap,
    filter: Models.IAbilityFilter,
    jobFilter: Models.IAbilityFilter,
    used: (a: string) => boolean,
    fightLevel: number): boolean {
    const filterUnit = (f: Models.IAbilityFilter, jf: Models.IAbilityFilter) =>
      (aType: Models.AbilityType | Models.AbilityType[], key: keyof Models.IAbilityFilter) => {
        let v = false;
        const valueArray = Array.isArray(aType) ? aType : [aType];
        if (valueArray.some(it => value.hasValue(it))) {
          v = f[key];
          if (jf[key] !== undefined) {
            v = jf[key];
          }
        }
        return v;
      };

    if (!filter || !value.ability) {
      return true;
    }

    if (value.ability.levelAcquired > fightLevel) {
      return false;
    }

    if (value.ability.levelRemoved <= fightLevel) {
      return false;
    }

    jobFilter = jobFilter || {};
    const filterFn = filterUnit(filter, jobFilter);

    let visible = false;

    for (const fm of Object.keys(filterMap)) {
      visible ||= filterFn(filterMap[fm], fm as keyof Models.IAbilityFilter);
      if (visible) { break; }
    }

    if (!filter.unused ||
      (jobFilter.unused !== undefined && !jobFilter.unused)) {
      if (!jobFilter.unused) {
        visible = visible && used(value.id);
      }
    }

    return visible;
  }


}
