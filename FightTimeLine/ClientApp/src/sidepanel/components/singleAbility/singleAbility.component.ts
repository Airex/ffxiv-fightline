import { Component, OnInit, OnDestroy, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import { ISidePanelComponent, SidepanelParams, SIDEPANEL_DATA } from "../ISidePanelComponent"
import * as M from "../../../core/Models"
import * as X from "@xivapi/angular-client"
import { Utils } from "../../../core/Utils"
import { DomSanitizer } from "@angular/platform-browser";
import * as S from "../../../services/index"
import * as Shared from "../../../core/Jobs/FFXIV/shared";
import { AbilityUsageMap, JobStanceMap } from "../../../core/Maps/index";


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
  constructor(
    private xivapi: X.XivapiService,
    private sanitizer: DomSanitizer,
    private dispatcher: S.DispatcherService,
    @Inject(SIDEPANEL_DATA) private data: SidepanelParams
  ) {

    this.items = this.data.items;

    const groups = {};

    if (this.ability.xivDbId) {
      this.xivapi.get(this.getEndpoint(this.ability.xivDbType), Number(this.ability.xivDbId)).subscribe(a => {
        if (a && a.Description) {
          this.description =
            this.sanitizer.bypassSecurityTrustHtml(a.Description.replace(new RegExp("\\n+", "g"), "<br/>"));
        } else {
          this.description = "";
        }
      });
    }


    if (this.it.ability.ability.settings) {
      for (let d of this.it.ability.ability.settings) {
        const value = this.it.settings && this.it.settings.find((it) => it.name === d.name);
        groups[d.name] = new FormControl(value ? value.value : d.default)
      }
      this.jobs = this.data.holders.jobs.getAll();
    }

    this.form = new FormGroup(groups);

    this.refresh();
  }

  items: any[];

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
    const setting = !this.it.ability.isStance && this.it.getSetting(Shared.settings.target.name);
    if (setting) {
      this.ptyMemUsages = this.data.holders.itemUsages
        .getByAbility(this.it.ability.id)
        .sort((a, b) => a.startAsNumber - b.startAsNumber)
        .map(it => {
          const s = it.getSettingData(setting.name);
          const jobMap = s && s.value && this.data.holders.jobs.get(s.value);
          const string = jobMap && jobMap.actorName;
          return {
            id: it.id,
            offset: Utils.formatTime(it.start),
            icon: jobMap && jobMap.job && jobMap.job.icon,
            target: string
          };
        });
    }

    if (this.it.ability.ability.settings) {
      for (let d of this.it.ability.ability.settings) {
        const value = this.it.settings && this.it.settings.find((it) => it.name === d.name);
        this.form.controls[d.name].setValue(value ? value.value : d.default);
      }
      this.jobs = this.data.holders.jobs.getAll();
      this.modified = false;
    }

    if (this.it.ability.isDef) {
      this.covered = this.data.holders.bossAttacks.getAll().filter((it) => {
        return it.start >= this.it.start && it.start <= new Date(this.it.startAsNumber + this.it.calculatedDuration * 1000)
      }).sort((a, b) => a.startAsNumber - b.startAsNumber);
    }

  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

}
