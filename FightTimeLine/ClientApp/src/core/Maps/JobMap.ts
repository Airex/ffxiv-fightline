import { DataGroup } from "vis-timeline"
import * as BaseMap from "./BaseMap";
import * as BaseHolder from "../Holders/BaseHolder";
import * as Models from "../Models";
import { BaseEventFields } from "../FFLogs";
import { IJobStats } from "../Models";

export interface IJobMapData {
  actorName?: string;  
  stats?: IJobStats;  
}

export class JobMap extends BaseMap.BaseMap<string, DataGroup, IJobMapData> implements BaseHolder.IForSidePanel {
  sidePanelComponentName: string = "job";
  

  onDataUpdate(data: IJobMapData): void {
    this.setItem(this.createJob(this.job, this.id, data));
  }

  static jobIndex = 0;
  private index: number | undefined = JobMap.jobIndex++;
  job: Models.IJob;  
  pet: string;  
  settings: Models.ISettingData[];

  constructor(presenter: Models.IPresenterData, id: string, job: Models.IJob, data: IJobMapData, pet?: string) {
    super(presenter, id);
    this.job = job;
    this.pet = pet || job.defaultPet;
    this.applyData(data);
  }

  get isCompact(): boolean {
    return this.presenter.jobFilter(this.id).isCompact;
  }


  get filter(): Models.IAbilityFilter {
    const jf = this.presenter.jobFilter(this.id)
    jf.filter ||= {};
    return jf.filter;
  }

  get actorName(): string {
    return this.data.actorName || "";
  }

  get stats(): IJobStats {
    this.data.stats ||= {};
    return this.data.stats;
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

  getSettingData(name: string): Models.ISettingData {
    return this.settings && this.settings.find && this.settings.find(it => it.name === name);
  }

  getSetting(name: string): Models.IAbilitySetting {
    return this.job.settings?.find(it => it.name === name);
  }  

  createJob(job: Models.IJob, id: string, data: IJobMapData): DataGroup {
    const el = this.createElementFromHtml(
      `<span class="expand-sign">${this.collapsed ? "►" : "▼"}</span><img class='abilityIcon' src='${job.icon}'/><span class='jobName'>${job.name}<span>`);    

    return <DataGroup>{
      id: id,      
      content: el,      
      className: this.buildClass({ job: true }),
      value: this.index,
      title: data.actorName,
    }
  }  

  get collapsed(): boolean {
    return this.presenter.jobFilter(this.id).isCollapsed  || false;
  }
  
  detectAbility(event: BaseEventFields): { offset: number; name: string } {
    const data = this.job.abilities.map(a => a.detectStrategy.process(event)).filter(a => !!a);
    if (data.length > 1)
      throw Error("More then 1 ability");
    return data[0];
  }

  get showNested() { return this.item.showNested; }

  get order(): number {
    return (this.item as any).value;
  }
}
