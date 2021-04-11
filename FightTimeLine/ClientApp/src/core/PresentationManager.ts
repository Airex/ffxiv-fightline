import * as Models from "./Models";
import * as _ from "lodash"
import { ISettings } from "src/services/SettingsService";
import { JobFilters } from "./Models";
import { isEmpty } from "rxjs/operators";

export class PresenterManager implements Models.IPresenterData {

  tags: string[] = Models.DefaultTags;
  sources: string[] = [];
  filter: Models.IFilter = Models.defaultFilter();
  view: Models.IView = Models.defaultView;
  private jobFilters: JobFilters = {}

  reset() {
    this.tags = Models.DefaultTags;
    this.sources = [];
    this.filter = Models.defaultFilter();
    this.view = Models.defaultView;
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
    const compact = this.jobFilter(jobId).abilityCompact;

    const index = compact.indexOf(ability);
    if (value && index === -1) {
      compact.push(ability);
    }
    if (!value && index >= 0) {
      compact.splice(index, 1)
    }
  }

  setSettings(iSettings: ISettings) {
    if (iSettings.main.defaultFilter)
      this.filter = iSettings.main.defaultFilter;
    if (iSettings.main.defaultView)
      this.view = iSettings.main.defaultView;
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
    }
    return !!data;
  }
}



