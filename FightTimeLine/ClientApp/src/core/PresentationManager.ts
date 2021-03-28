import * as Models from "./Models";
import * as _ from "lodash"
import * as SettingsService from "../services/SettingsService";

export class PresenterManager {
  tags: string[] = Models.DefaultTags;
  sources: string[] = [];
  filter = Models.defaultFilter;
  view = Models.defaultView;


  public get activeTags(): {text: string, checked: boolean}[] {
    return this.tags.concat("Other").map(t => ({
      text: t,
      checked:  this.filter.attacks && this.filter.attacks.tags && this.filter.attacks.tags.includes(t)
    }));
  }

  public get activeSources(): { text: string, checked: boolean }[] {
    return this.sources.concat("Other").map(t => ({
      text: t,
      checked: this.filter.attacks && this.filter.attacks.sources && this.filter.attacks.sources.includes(t)
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

  setSettings(iSettings: SettingsService.ISettings) {
    this.filter = iSettings.main.defaultFilter;
    this.view = iSettings.main.defaultView;
  }
}



