import * as Models from "./Models";
import * as _ from "lodash"
import { ISettings } from "src/services/SettingsService";
import { JobFilters } from "./Models";

export class PresenterManager {
  tags: string[] = Models.DefaultTags;
  sources: string[] = [];
  filter: Models.IFilter = Models.defaultFilter;
  view: Models.IView = Models.defaultView;
  jobFilters: JobFilters = {}

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

  setSettings(iSettings: ISettings) {
    this.filter = iSettings.main.defaultFilter;
    this.view = iSettings.main.defaultView;
  }
}



