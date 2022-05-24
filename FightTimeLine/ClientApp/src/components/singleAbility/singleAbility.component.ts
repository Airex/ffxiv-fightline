import { Component, OnInit, OnDestroy, Inject } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import * as M from "../../core/Models";
import { Utils } from "../../core/Utils";
import { DomSanitizer } from "@angular/platform-browser";
import * as S from "../../services/index";
import { AbilityUsageMap, JobStanceMap } from "../../core/Maps/index";
import { FFXIVApiService } from "src/services/FFxivApiService";
import { VisStorageService } from "src/services/VisStorageService";
import { DispatcherPayloads } from "src/services/dispatcher.service";
import { Subscription } from "rxjs";
import { ISidePanelComponent, SIDEPANEL_DATA, SidepanelParams } from "../sidepanel/ISidePanelComponent";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "singleAbility",
  templateUrl: "./singleAbility.component.html",
  styleUrls: ["./singleAbility.component.css"],
})
export class SingleAbilityComponent implements OnInit, OnDestroy, ISidePanelComponent {

  form: FormGroup;
  description: any;
  ptyMemUsages: any[];
  jobs;
  modified = false;
  covered: any[];
  coveredOgcds: any[];
  items: any[];
  sub: Subscription;

  constructor(

    private visStorage: VisStorageService,
    private xivapi: FFXIVApiService,
    private sanitizer: DomSanitizer,
    @Inject("DispatcherPayloads") private dispatcher: S.DispatcherService<DispatcherPayloads>,
    @Inject(SIDEPANEL_DATA) public data: SidepanelParams,
    private trans: TranslateService
  ) {

    this.trans.onLangChange.subscribe(() => {
      this.refresh();
    });

    this.items = this.data.items;




    const groups = {};
    if (this.it.ability.ability.settings) {
      for (const d of this.it.ability.ability.settings) {
        const value = this.it.getSettingData(d.name);
        groups[d.name] = new FormControl(value ? value.value : d.default);
      }
      this.jobs = this.visStorage.holders.jobs.getAll();
    }

    this.form = new FormGroup(groups);

    this.sub = this.data.refresh.subscribe(() => {
      this.refresh();
    });

    this.refresh();
  }

  getTranslationProperty(lang: M.SupportedLanguages) {
    switch (lang) {
      case M.SupportedLanguages.en:
        return "Description_en";
      case M.SupportedLanguages.de:
        return "Description_de";
      case M.SupportedLanguages.fr:
        return "Description_fr";
      case M.SupportedLanguages.jp:
        return "Description_ja";
      default:
        return "Description";
    }
  }

  get it(): AbilityUsageMap {
    return this.items[0] as AbilityUsageMap;
  }

  get ability(): M.IAbility {
    const ability = this.it.ability.isStance
      ? (this.it as any as JobStanceMap).stanceAbility
      : this.it.ability.ability;
    return ability;
  }

  similarClick(val: any) {
    this.dispatcher.dispatch("abilityClick", val.id);
  }

  formatTime(time) {
    return Utils.formatTime(time);
  }

  saveSettings() {

    const settings = new Array<M.ISettingData>();

    const controls = this.form.controls;
    for (const d in controls) {
      if (controls.hasOwnProperty(d)) {
        const control = controls[d];
        settings.push({ name: d, value: control.value });
      }
    }

    this.dispatcher.dispatch("abilitySaveSettings", {
      id: this.it.id,
      settings
    });

    this.modified = false;
  }

  refresh() {

    if (this.ability.xivDbId) {
      this.xivapi.loadDescription(this.ability.xivDbType, this.ability.xivDbId).subscribe(a => {
        if (!a) { return; }
        const propName = this.getTranslationProperty(this.visStorage.presenter.language);
        const description = a[propName];
        if (description) {
          const trimmed = description.replace(new RegExp("\\n+", "g"), "<br />").replace(new RegExp("(<br />)+", "g"), "<br/>");
          this.description = this.sanitizer.bypassSecurityTrustHtml(trimmed);
        } else {
          this.description = "";
        }
      });
    }

    const ab = this.it.ability;
    const setting = !ab.isStance && this.it.getSetting(M.SettingsEnum.Target);
    if (setting) {
      this.ptyMemUsages = this.visStorage.holders.itemUsages
        .getByAbility(this.it.ability.id)
        .sort((a, b) => a.startAsNumber - b.startAsNumber)
        .map(abc => {
          const s = abc.getSettingData(setting.name);
          const jobMap = s?.value && this.visStorage.holders.jobs.get(s.value) || abc.ability.job;
          const actor = jobMap?.actorName;
          return {
            id: abc.id,
            offset: Utils.formatTime(abc.start),
            icon: jobMap?.job?.icon,
            target: actor
          };
        });
    }

    if (this.it.ability.ability.settings) {
      for (const d of this.it.ability.ability.settings) {
        const value = this.it.getSettingData(d.name);
        this.form.controls[d.name].setValue(value ? value.value : d.default);
      }
      this.jobs = this.visStorage.holders.jobs.getAll();
      this.modified = false;
    }

    if (this.it.ability.isDef || this.it.ability.isHeal) {
      this.covered = this.visStorage.holders.bossAttacks.getAll().filter((it) => {
        return it.start >= this.it.start && it.start <= new Date(this.it.startAsNumber + this.it.calculatedDuration * 1000);
      }).sort((a, b) => a.startAsNumber - b.startAsNumber);
    }

    if (this.it.ability.isSelfDamage || this.it.ability.isPartyDamage) {
      const jobs = this.it.ability.isSelfDamage
        ? [this.it.ability.job]
        : this.visStorage.holders.jobs.getAll();

      this.coveredOgcds = jobs.reduce((oacc, j) => {
        const list = this.visStorage.holders.abilities
          .getByParentId(j.id)
          .filter(abc => abc.isOgcd)
          .reduce((acc, abc) => {
            const cov = this.visStorage.holders.itemUsages
              .getByAbility(abc.id)
              .filter(abcd => this.it.checkCoversDate(abcd.start));
            return acc.concat(cov);
          }, []);

        if (list.length > 0) {
          oacc.push({
            jobName: j.job.name,
            jobIcon: j.job.icon,
            abilities: list.sort((a, b) => a.startAsNumber - b.startAsNumber)
          });
        }
        return oacc;
      }, []);
    }
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

}
