import { Component, OnInit, OnDestroy, Inject } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms"
import { ISidePanelComponent, SidepanelParams, SIDEPANEL_DATA } from "../ISidePanelComponent"
import * as M from "../../../core/Models"
import * as X from "@xivapi/angular-client"
import { Utils } from "../../../core/Utils"
import { DomSanitizer } from "@angular/platform-browser";
import * as S from "../../../services/index"
import { AbilityUsageMap, JobStanceMap } from "../../../core/Maps/index";
import { SettingsEnum } from "src/core/Jobs/FFXIV/shared";
import { FFXIVApiService } from "src/services/FFxivApiService";
import { VisStorageService } from "src/services/VisStorageService";


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

    private visStorage: VisStorageService,
    private xivapi: FFXIVApiService,
    private sanitizer: DomSanitizer,
    private dispatcher: S.DispatcherService,
    @Inject(SIDEPANEL_DATA) public data: SidepanelParams
  ) {

    this.items = this.data.items;

    
    if (this.ability.xivDbId) {
      this.xivapi.loadDescription(this.ability.xivDbType, this.ability.xivDbId).subscribe(a => {
        if (a?.Description) {
          this.description =
          this.sanitizer.bypassSecurityTrustHtml(a.Description.replace(/\n+/g, "<br/>"));
        } else {
          this.description = "";
        }
      });
    }
    
    const groups = {};

    if (this.it.ability.ability.settings) {
      for (let d of this.it.ability.ability.settings) {
        const value = this.it.getSettingData(d.name);
        groups[d.name] = new FormControl(value ? value.value : d.default)
      }
      this.jobs = this.visStorage.holders.jobs.getAll();
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

    const settings = new Array<M.ISettingData>();

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

  refresh() {
    const ab = this.it.ability;
    const setting = !ab.isStance && this.it.getSetting(SettingsEnum.Target);
    if (setting) {
      this.ptyMemUsages = this.visStorage.holders.itemUsages
        .getByAbility(this.it.ability.id)
        .sort((a, b) => a.startAsNumber - b.startAsNumber)
        .map(ab => {
          const s = ab.getSettingData(setting.name);
          const jobMap = s?.value && this.visStorage.holders.jobs.get(s.value) || ab.ability.job;
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
      this.jobs = this.visStorage.holders.jobs.getAll();
      this.modified = false;
    }

    if (this.it.ability.isDef || this.it.ability.isHeal) {
      this.covered = this.visStorage.holders.bossAttacks.getAll().filter((it) => {
        return it.start >= this.it.start && it.start <= new Date(this.it.startAsNumber + this.it.calculatedDuration * 1000)
      }).sort((a, b) => a.startAsNumber - b.startAsNumber);
    }

    if (this.it.ability.isSelfDamage || this.it.ability.isPartyDamage) {
      const jobs = this.it.ability.isSelfDamage
        ? [this.it.ability.job]
        : this.visStorage.holders.jobs.getAll();

      this.coveredOgcds = jobs.reduce((oacc, j) => {
        const list = this.visStorage.holders.abilities
          .getByParentId(j.id)
          .filter(ab => ab.isOgcd)
          .reduce((acc, ab) => {
            var cov = this.visStorage.holders.itemUsages
              .getByAbility(ab.id)
              .filter(ab => this.it.checkCoversDate(ab.start));
            return acc.concat(cov);
          }, []);

        if (list.length > 0) {
          oacc.push({
            jobName: j.job.name,
            jobIcon: j.job.icon,
            abilities: list.sort((a, b) => a.startAsNumber - b.startAsNumber)
          })
        }
        return oacc;
      }, []);
    }

  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

}
