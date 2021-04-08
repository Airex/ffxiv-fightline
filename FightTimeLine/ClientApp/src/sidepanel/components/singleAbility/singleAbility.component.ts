import { Component, OnInit, OnDestroy, Inject } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms"
import { ISidePanelComponent, SidepanelParams, SIDEPANEL_DATA } from "../ISidePanelComponent"
import * as M from "../../../core/Models"
import * as X from "@xivapi/angular-client"
import { Utils } from "../../../core/Utils"
import { DomSanitizer } from "@angular/platform-browser";
import * as S from "../../../services/index"
import { AbilityUsageMap, JobStanceMap } from "../../../core/Maps/index";
import { settings, SettingsEnum } from "src/core/Jobs/FFXIV/shared";


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

  constructor(
    private xivapi: X.XivapiService,
    private sanitizer: DomSanitizer,
    private dispatcher: S.DispatcherService,
    @Inject(SIDEPANEL_DATA) public data: SidepanelParams
  ) {

    this.items = this.data.items;

    const groups = {};

    if (this.ability.xivDbId) {
      this.xivapi.get(this.getEndpoint(this.ability.xivDbType), Number(this.ability.xivDbId)).subscribe(a => {
        if (a?.Description) {
          this.description =
            this.sanitizer.bypassSecurityTrustHtml(a.Description.replace(/\n+/g, "<br/>"));
        } else {
          this.description = "";
        }
      });
    }


    if (this.it.ability.ability.settings) {
      for (let d of this.it.ability.ability.settings) {
        const value = this.it.getSettingData(d.name);
        groups[d.name] = new FormControl(value ? value.value : d.default)
      }
      this.jobs = this.data.holders.jobs.getAll();
    }

    this.form = new FormGroup(groups);

    this.refresh();
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
    this.dispatcher.dispatch({
      name: "SidePanel Ability Click",
      payload: val.id
    });
  }

  formatTime(time) {
    return Utils.formatTime(time);
  }

  saveSettings() {

    const settings = new Array<M.IAbilitySettingData>();

    const controls = this.form.controls;
    for (let d in controls) {
      if (controls.hasOwnProperty(d)) {
        const control = controls[d];
        settings.push({ name: d, value: control.value });
      }
    }

    this.dispatcher.dispatch({
      name: "SidePanel Ability Save Settings",
      payload: {
        id: this.it.id,
        settings: settings
      }
    });

    this.modified = false;
  }

  private getEndpoint(type: string): X.XivapiEndpoint {
    switch (type) {
      case "item":
        return X.XivapiEndpoint.Item;
      default:
    }
    return X.XivapiEndpoint.Action;
  }

  refresh() {
    const ab = this.it.ability;
    const setting = !ab.isStance && this.it.getSetting(SettingsEnum.Target);
    if (setting) {
      this.ptyMemUsages = this.data.holders.itemUsages
        .getByAbility(this.it.ability.id)
        .sort((a, b) => a.startAsNumber - b.startAsNumber)
        .map(ab => {
          const s = ab.getSettingData(setting.name);
          const jobMap = s?.value && this.data.holders.jobs.get(s.value) || ab.ability.job;
          const actor = jobMap?.actorName;
          return {
            id: ab.id,
            offset: Utils.formatTime(ab.start),
            icon: jobMap?.job?.icon,
            target: actor
          };
        });
    }

    if (this.it.ability.ability.settings) {
      for (let d of this.it.ability.ability.settings) {
        const value = this.it.getSettingData(d.name);
        this.form.controls[d.name].setValue(value ? value.value : d.default);
      }
      this.jobs = this.data.holders.jobs.getAll();
      this.modified = false;
    }

    if (this.it.ability.isDef || this.it.ability.isHeal) {
      this.covered = this.data.holders.bossAttacks.getAll().filter((it) => {
        return it.start >= this.it.start && it.start <= new Date(this.it.startAsNumber + this.it.calculatedDuration * 1000)
      }).sort((a, b) => a.startAsNumber - b.startAsNumber);
    }

    if (this.it.ability.isSelfDamage || this.it.ability.isPartyDamage) {
      const jobs = this.it.ability.isSelfDamage
        ? [this.it.ability.job]
        : this.data.holders.jobs.getAll();
        
      this.coveredOgcds = jobs.map(j => {
        const ogcds = this.data.holders.abilities.getByParentId(j.id).filter(ab => ab.isOgcd);
        var list: AbilityUsageMap[] = [];
        ogcds.forEach(ab => {
          var cov = this.data.holders.itemUsages.getByAbility(ab.id).filter(ab => this.it.checkCoversDate(ab.start));
          list.push(...cov);
        });

        if (list.length == 0) return null;

        return {
          jobName: j.job.name,
          jobIcon: j.job.icon,
          abilities: list.sort((a, b) => a.startAsNumber - b.startAsNumber)
        }
      }).filter(a => !!a);
    }

  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

}
