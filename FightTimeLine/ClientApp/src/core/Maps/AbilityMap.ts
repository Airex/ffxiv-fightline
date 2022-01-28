import { DataGroup } from "vis-timeline"
import * as BaseMap from "./BaseMap";
import * as BaseHolder from "../Holders/BaseHolder";
import * as Models from "../Models";
import * as JobMap from "./JobMap";

export interface IAbilityMapData {
  filtered?: boolean;
}

export class AbilityMap extends BaseMap.BaseMap<string, DataGroup, IAbilityMapData> implements BaseHolder.IForSidePanel {

  sidePanelComponentName: string = "jobAbility";

  onDataUpdate(data: IAbilityMapData): void {
    this.setItem(this.isStance ? this.createStances(this.id, data) : this.createJobAbility(this.ability, this.id, data));
  }

  constructor(presenter: Models.IPresenterData, id: string, job: JobMap.JobMap, ability: Models.IAbility, isStance: boolean, data?: IAbilityMapData) {
    super(presenter, id);
    this.job = job;
    this.ability = ability;
    this.isStance = isStance;
    this.index = this.job.order + (++AbilityMap.abilityIndex)/10000;

    this.applyData(Object.assign({ }, data) as IAbilityMapData);
  }

  static abilityIndex = 0;
  job: JobMap.JobMap;
  ability: Models.IAbility;
  isStance: boolean;
  index: number | undefined;


  public getSettingOfType(type: string): Models.IAbilitySetting {
    return this.ability.settings && this.ability.settings.find(it => it.type === type);
  }

  public hasValue(toCheck: Models.AbilityType): boolean {
    return (this.ability.abilityType & toCheck) === toCheck;
  }

  public hasAnyValue(...toCheck: Models.AbilityType[]): boolean {
    return toCheck.some(it => this.hasValue(it));
  }

  public get isDef(): boolean {
    return this.isPartyDef || this.isSelfDef;
  }

  public get isSelfDef(): boolean {
    return this.hasValue(Models.AbilityType.SelfDefense) || this.hasValue(Models.AbilityType.SelfShield) || this.hasValue(Models.AbilityType.TargetDefense);
  }

  public get isOgcd(): boolean {
    return this.hasValue(Models.AbilityType.Damage);
  }

  public get isPartyDef(): boolean {
    return this.hasValue(Models.AbilityType.PartyDefense) || this.hasValue(Models.AbilityType.PartyShield);
  }

  public get isHeal(): boolean {
    return this.hasValue(Models.AbilityType.Healing) || this.hasValue(Models.AbilityType.HealingBuff);
  }

  public get isDamage(): boolean {
    return this.isSelfDamage || this.isPartyDamage;
  }

  public get isSelfDamage(): boolean {
    return this.hasValue(Models.AbilityType.SelfDamageBuff);
  }

  public get isPartyDamage(): boolean {
    return this.hasValue(Models.AbilityType.PartyDamageBuff);
  }

  createStances(id: string, data: IAbilityMapData): DataGroup {
    const key: any = { sgDummy: true };
    key[`sg${id}`] = false;

    return <DataGroup>{
      id: id,
      visible: !this.hidden,
      subgroupStack: key,
      content: "Stance",

    }
  }


  createElementFromHtml(htmlString): HTMLElement {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div;
  }

  createJobAbility(ability: Models.IAbility, id: string, data: IAbilityMapData): DataGroup {
    const key: any = { sgDummy: true };
    key[`sg${id}`] = false;

    const el = ability.icon
      ? this.createElementFromHtml(`<span><img class='abilityIcon' src='${ability.icon}'/><span class='abilityName'>${ability.name}</span></span>`)
      : this.createElementFromHtml(`<span>${ability.name}</span>`);

    // console.log(this.job.id+" "+this.ability.name+" "+this.job.isCompact) 
    return {
      id: id,
      className: this.buildClass({ compact: this.isCompact || this.job.isCompact || this.presenter.view.compactView }),
      visible: !(this.hidden || data.filtered || this.job.collapsed),
      content: el,
      value: this.index
    } as DataGroup;
  }

  get hidden(): boolean {
    return this.presenter.jobFilter(this.job.id).abilityHidden?.indexOf(this.ability.name) >= 0 || false;
  }

  get filtered(): boolean {
    return this.data.filtered;
  }

  get isCompact(): boolean {
    return this.presenter.jobFilter(this.job.id).abilityCompact?.indexOf(this.ability.name) >= 0 || false;
  }

  


}
