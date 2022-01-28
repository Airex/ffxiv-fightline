import * as Models from "./Models";
import * as _ from "lodash"
import { FFLogsImportBossAttacksSource, ISettings } from "src/services/SettingsService";
import { IPresetTemplate, JobFilters } from "./Models";
import { Holders } from "./Holders";
import { Utils } from "./Utils";

export class PresenterManager implements Models.IPresenterData {

  loadTemplate(template: Models.IPresetTemplate, holders: Holders) {
    this.filter = template.filter;
    this.view = template.view;
    this.jobFilters = holders.jobs.getAll().reduce((acc, j) => {
      return { ...acc, [j.id]: template.jobFilters[j.job.name] || {} };
    }, {});

  }

  tags: string[] = Models.DefaultTags;
  sources: string[] = [];
  filter: Models.IFilter = Models.defaultFilter();
  view: Models.IView = Models.defaultView();
  fightLevel: number = 90;
  private jobFilters: JobFilters = {}

  reset() {
    this.tags = Models.DefaultTags;
    this.fightLevel = 90;
    this.sources = [];
    this.filter = Models.defaultFilter();
    this.view = Models.defaultView();
    this.jobFilters = {}

  }

  jobFilter(jobId: string): Models.JobFilter {
    this.jobFilters[jobId] ||= { abilityCompact: [], abilityHidden: [], filter: {} };
    return this.jobFilters[jobId];
  }

  public get activeTags(): { text: string, checked: boolean }[] {
    return this.tags.concat("Other").map(t => ({
      text: t,
      checked: this.filter?.attacks?.tags?.includes(t) || false
    }));
  }

  public get activeSources(): { text: string, checked: boolean }[] {
    return this.sources.concat("Other").map(t => ({
      text: t,
      checked: this.filter?.attacks?.sources?.includes(t) || false
    }));
  }

  addTags(t: string[]) {
    if (t) {
      const newtags = _.without(t, ...this.tags);
      this.tags = _.union(this.tags, t);
      this.filter.attacks.tags = _.union(this.filter.attacks.tags, newtags);
    }
  }

  addSource(s: string) {
    if (s) {
      const newsources = _.without([s], ...this.sources);
      this.sources = _.union(this.sources, [s]);
      this.filter.attacks.sources = _.union(this.filter.attacks.sources, newsources);
    }
  }

  setJobCompact(jobId: string, value: boolean) {
    this.jobFilter(jobId).isCompact = value;
  }

  setJobCollapsed(jobId: string, value: boolean) {
    this.jobFilter(jobId).isCollapsed = value;
  }

  setHiddenAbility(jobId: string, ability: string, value: boolean) {
    const hidden = this.jobFilter(jobId).abilityHidden;

    const index = hidden.indexOf(ability);
    if (value && index === -1) {
      hidden.push(ability);
    }
    if (!value && index >= 0) {
      hidden.splice(index, 1)
    }
  }

  setAbilityCompact(jobId: string, ability: string, value: boolean) {
    let f = this.jobFilter(jobId);
    f.abilityCompact ||= [];
    
    const compact = f.abilityCompact;

    const index = compact.indexOf(ability);
    if (value && index === -1) {
      compact.push(ability);
    }
    if (!value && index >= 0) {
      compact.splice(index, 1)
    }
  }

  setFightLevel(level: number) {
    this.fightLevel = level;
  }

  setFflogsSource(arg0: "cast" | "damage") {
    if (this.filter.attacks)
      this.filter.attacks.fflogsSource = arg0;
  }


  setSettings(iSettings: ISettings) {
    if (iSettings.main.defaultFilter)
      this.filter = iSettings.main.defaultFilter;
    if (iSettings.main.defaultView)
      this.view = iSettings.main.defaultView;

    if (this.filter && this.filter.attacks)
      this.filter.attacks.fflogsSource = iSettings.fflogsImport.bossAttacksSource == FFLogsImportBossAttacksSource.Cast ? "cast" : "damage";
  }

  save(storage: Models.IStorage, id: string) {
    storage.setObject("presenter_" + id, {
      filter: this.filter,
      view: this.view,
      jobFilters: this.jobFilters,
    })
  }

  load(storage: Models.IStorage, id: string): boolean {
    const data = storage.getObject<any>("presenter_" + id);
    if (data) {
      if (data.filter)
        this.filter = data.filter;
      if (data.view)
        this.view = data.view;
      if (data.jobFilters)
        this.jobFilters = data.jobFilters;
      if (data.fightLevel)
        this.fightLevel = data.fightLevel;
    }
    return !!data;
  }

  generatePresetTemplate(holders: Holders) {
    const template: IPresetTemplate = Utils.clone({
      filter: this.filter,
      view: this.view,
      jobFilters: Object.entries(this.jobFilters).reduce((acc, v) => {
        const jobMap = holders.jobs.get(v[0]);
        return { ...acc, [jobMap.job.name]: v[1] }
      }, {})
    });
    return template;
  }
}



