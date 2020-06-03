import { DataGroup } from "vis-timeline"
import * as BaseMap from "./BaseMap";
import * as BaseHolder from "../Holders/BaseHolder";
import * as Models from "../Models";
import * as JobMap from "./JobMap";

export interface IAbilityMapData {
  hidden?: boolean;
  isCompact?: boolean;
  filtered?: boolean;
  selected?: boolean;
  collapsed?: boolean;
}

export class AbilityMap extends BaseMap.BaseMap<string, DataGroup, IAbilityMapData> implements BaseHolder.IForSidePanel {
  sidePanelComponentName: string = "jobAbility";

  onDataUpdate(data: IAbilityMapData): void {
    this.setItem(this.isStance ? this.createStances(this.id, data.hidden) : this.createJobAbility(this.ability, this.id, data));
  }

  constructor(id: string, job: JobMap.JobMap, ability: Models.IAbility, isStance: boolean, data?: IAbilityMapData) {
    super(id);
    this.job = job;
    this.ability = ability;
    this.isStance = isStance;

    this.applyData(Object.assign({ hidden: false, isCompact: false }, data) as IAbilityMapData);
  }

  job: JobMap.JobMap;
  ability: Models.IAbility;
  isStance: boolean;
  index: number | undefined = JobMap.JobMap.jobIndex--;


  public getSettingOfType(type: string): Models.IAbilitySetting {
    return this.ability.settings && this.ability.settings.find(it => it.type === type);
  }

  private hasValue(toCheck: Models.AbilityType): boolean {
    return (this.ability.abilityType & toCheck) === toCheck;
  }

  private hasAnyValue(...toCheck: Models.AbilityType[]): boolean {
    return toCheck.some(it => this.hasValue(it));
  }

  public get isDef(): boolean {
    return this.isPartyDef || this.isSelfDef;
  }

  public get isSelfDef(): boolean {
    return this.hasValue(Models.AbilityType.SelfDefense) || this.hasValue(Models.AbilityType.SelfShield) || this.hasValue(Models.AbilityType.TargetDefense);
  }

  public get isPartyDef(): boolean {
    return this.hasValue(Models.AbilityType.PartyDefense) || this.hasValue(Models.AbilityType.PartyShield);
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

  createStances(id: string, hidden: boolean): DataGroup {
    const key: any = { sgDummy: true };
    key[`sg${id}`] = false;

    return <DataGroup>{
      id: id,
      visible: !hidden,
      subgroupStack: key,
      content: "Stance",
      
    }
  }


  createElementFromHtml(htmlString): HTMLElement {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes
    return div;
  }

  createJobAbility(ability: Models.IAbility, id: string, data: IAbilityMapData): DataGroup {
    const key: any = { sgDummy: true };
    key[`sg${id}`] = false;

    const el = ability.icon
      ? this.createElementFromHtml(`<span><img class='abilityIcon' src='${ability.icon}'/><span class='abilityName'>${ability.name}</span></span>`)
      : this.createElementFromHtml(`<span>${ability.name}</span>`);

//    el.addEventListener("click", this.select.bind(this));

    return <DataGroup>{
      id: id,
      //      subgroupStack: key,
      className: this.buildClass({compact: data.isCompact, selected: data.selected}),
      visible: !(data.hidden || data.filtered || data.collapsed),
      content: el,
      value: this.index

  } as DataGroup;
  }

  get hidden(): boolean {
    return this.data.hidden;
  }

  get filtered(): boolean {
    return this.data.filtered;
  }

  get isCompact(): boolean {
    return this.data.isCompact;
  }
}
