import { DataGroup } from "vis-timeline"
import * as BaseMap from "./BaseMap";
import * as BaseHolder from "../Holders/BaseHolder";
import * as Models from "../Models";
import * as AbilityMap from "./AbilityMap";
import { Utils } from "../Utils";

export interface IJobMapData {
  actorName?: string;
  collapsed?: boolean;
}

export const defaultFilter: Models.IAbilityFilter = {
  damage: undefined,
  selfDefence: undefined,
  partyDefence: undefined,
  healing: undefined,
  healingBuff: undefined,
  partyDamageBuff: undefined,
  selfDamageBuff: undefined,
  unused: undefined,  
  utility: undefined
}

export class JobMap extends BaseMap.BaseMap<string, DataGroup, IJobMapData> implements BaseHolder.IForSidePanel {
  sidePanelComponentName: string = "job";

  onDataUpdate(data: IJobMapData): void {
    //    if (this.abilityIds)
    this.setItem(this.createJob(this.job, this.id, data));
  }

  static jobIndex = Number.MAX_SAFE_INTEGER;
  index: number | undefined = JobMap.jobIndex--;

  constructor(id: string, job: Models.IJob, data: IJobMapData, filter?: Models.IAbilityFilter, pet?: string) {
    super(id);
    this.job = job;
    this.filter = filter || Utils.clone(defaultFilter);
    this.pet = pet || job.defaultPet;
    this.applyData(data);
  }

  job: Models.IJob;
  filter?: Models.IAbilityFilter;
  pet: string;
  isCompact: boolean = false;
  settings: Models.IAbilitySettingData[];

  get actorName(): string {
    return this.data.actorName || "";
  }

  getDisplayName(): string {
    return this.job.name + " " + this.data.actorName;
  }

  createElementFromHtml(htmlString): HTMLElement {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes
    return div;
  }

  getSettingData(name: string): Models.IAbilitySettingData {
    return this.settings && this.settings.find && this.settings.find(it => it.name === name);
  }

  getSetting(name: string): Models.IAbilitySetting {
    return this.job.settings?.find(it => it.name === name);
  }

  toggleExpand(e): void {
    this.applyData({ collapsed: !this.collapsed });

    this.abilityIds.forEach((value) => {
      value.applyData({ hidden: this.collapsed });
      //      value.update();
    });
  }

  createJob(job: Models.IJob, id: string, data: IJobMapData): DataGroup {

    const el = this.createElementFromHtml(
      `<span class="expand-sign">${data.collapsed ? "►" : "▼"}</span><img class='abilityIcon' src='${job.icon}'/><span class='jobName'>${job.name}<span>`);

    //    el.addEventListener("dblclick", this.toggleExpand.bind(this));
    //    el.addEventListener("click", this.select.bind(this));

    return <DataGroup>{
      id: id,
      //      subgroupStack: false,
      //      nestedGroups: abilityIds,
      content: el,
      //      showNested: !collapsed,
      className: this.buildClass({ job: true }),
      value: this.index,
      title: data.actorName,
    }
  }

  get collapsed(): boolean {
    return this.data.collapsed || false;
  }

  private abilityIds: AbilityMap.AbilityMap[];

  useAbilities(abilityIds: AbilityMap.AbilityMap[]) {
    this.abilityIds = abilityIds;
  }

  detectAbility(event: any): { offset: number; name: string } {
    const data = this.job.abilities.map(a => a.detectStrategy.process(event)).filter(a => !!a);
    if (data.length > 1)
      throw Error("More then 1 ability");
    return data[0];
  }

  getShowNested() { return this.item.showNested; }

  get order(): string {
    return (this.item as any).value;
  }
}
