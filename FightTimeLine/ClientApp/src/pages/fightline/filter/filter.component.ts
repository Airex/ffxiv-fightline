import { Component, EventEmitter, OnInit, Input, Output } from "@angular/core";
import { IAbilityFilter, IPresetTemplate } from "src/core/Models";
import { LocalStorageService } from "src/services";
import { VisStorageService } from "src/services/VisStorageService";
import { PresenterManager } from "../../../core/PresentationManager";
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from "@ngx-translate/core";

type NewType = { [name in keyof IAbilityFilter]: [number, string] };

@Component({
  selector: "abilityFilter",
  templateUrl: "./filter.component.html",
  styleUrls: ["./filter.component.css"]
})
export class FilterComponent implements OnInit {
  public presenterManager: PresenterManager;
  tags: { text: string, checked: boolean }[];
  sources: { text: string, checked: boolean }[];
  checkAll = true;
  levels = [50, 60, 70, 80, 90];
  filters = this.loadFilters();
  openedSelect = false;

  @Output() public changed: EventEmitter<string> = new EventEmitter();
  @Output() public attachPresetEvent: EventEmitter<{ name: string, preset: IPresetTemplate }> = new EventEmitter();
  @Input() public fromFFlogs = false;

  constructor(
    private visStorage: VisStorageService,
    private storage: LocalStorageService,
    private trans: TranslateService
  ) {
    this.trans.onLangChange.subscribe(value => {
      this.filters = this.loadFilters();
    });
    this.presenterManager = this.visStorage.presenter;
    this.updateCheckAll();
  }

  loadFilters() {
    return Object.entries({
      selfDefence: [0, this.trans.instant(marker("abilityFilter.selfDefence"))],
      partyDefence: [1, this.trans.instant(marker("abilityFilter.partyDefence"))],
      selfDamageBuff: [2, this.trans.instant(marker("abilityFilter.selfDamageBuff"))],
      partyDamageBuff: [3, this.trans.instant(marker("abilityFilter.partyDamageBuff"))],
      damage: [4, this.trans.instant(marker("abilityFilter.ogcdDamage"))],
      healing: [5, this.trans.instant(marker("abilityFilter.healing"))],
      healingBuff: [6, this.trans.instant(marker("abilityFilter.healingBuff"))],
      utility: [7, this.trans.instant(marker("abilityFilter.utility"))],
      enmity: [8, this.trans.instant(marker("abilityFilter.enmity"))],
      unused: [10, this.trans.instant(marker("abilityFilter.showUnused"))],
      pet: [9, null],
    } as NewType)
      .filter(f => f[1][1])
      .sort((a, b) => a[1][0] - b[1][0])
      .map(a => ({ name: a[0], desc: a[1][1] }));
  }

  ngOnInit(): void {
    this.presenterManager.presets = this.storage.getObject("presets") || {};
    if (Array.isArray(this.presenterManager.presets)) {
      // lets fixupold format
      this.presenterManager.presets = {};
    }
  }


  change() {
    this.tags = this.presenterManager.activeTags;
    this.sources = this.presenterManager.activeSources;
    this.updateCheckAll();
    this.presenterManager.fightLevel = this.presenterManager.fightLevel;
    this.presenterManager.fflogsSource = this.presenterManager.filter.attacks?.fflogsSource === "cast";
  }

  checkAllFunc(value: boolean) {
    Object.keys(this.presenterManager.filter.abilities).forEach(key => {
      this.presenterManager.filter.abilities[key] = value;
    });
    setTimeout(() => {
      this.changed.emit('ability');
    });
  }

  updateCheckAll() {
    this.checkAll = undefined;
    if (Object.values(this.presenterManager.filter.abilities).every(e => e)) {
      this.checkAll = true;
    }
    if (Object.values(this.presenterManager.filter.abilities).every(e => !e)) {
      this.checkAll = false;
    }
  }

  attachPreset(){
    this.attachPresetEvent.emit({
      name: this.presenterManager.selectedPreset,
      preset: this.presenterManager.generatePresetTemplate(this.visStorage.holders)
    });
  }

  updateFilter(source: string, name?: string, value?: boolean): void {

    if (source === 'ability' && name) {
      this.presenterManager.filter.abilities[name] = value;
    }

    this.updateCheckAll();

    this.presenterManager.filter.attacks.tags = this.tags.filter(t => t.checked).map(t => t.text);
    this.presenterManager.filter.attacks.sources = this.sources.filter(t => t.checked).map(t => t.text);
    setTimeout(() => {
      this.changed.emit(source);
    });

  }

  savePreset(value: string) {
    const presetName = value?.trim();
    if (presetName) {
      const template = this.presenterManager.generatePresetTemplate(this.visStorage.holders);
      this.presenterManager.presets[presetName] = template;
      this.storage.setObject("presets", this.presenterManager.presets);
      this.presenterManager.selectedPreset = presetName;
    }
  }

  fflogsSourceChanged(value: boolean) {
    this.presenterManager.setFflogsSource(value ? "cast" : "damage");
    setTimeout(() => {
      this.changed.emit();
    });
  }

  levelChanged(l: number) {
    this.presenterManager.setFightLevel(l);
    setTimeout(() => {
      this.changed.emit();
    });
  }

  presetChanged(ev: string) {
    if (ev) {
      const template = this.presenterManager.presets[ev];
      this.presenterManager.loadTemplate(template, this.visStorage.holders);
      const abs = this.visStorage.holders.abilities.getAll();
      const jobs = this.visStorage.holders.jobs.getAll();
      const items = this.visStorage.holders.itemUsages.getAll();
      this.visStorage.holders.abilities.applyFilter((id) => items.some(ab => ab.ability.id === id));
      this.visStorage.holders.abilities.update(abs.map(ab => { ab.applyData(); return ab; }));
      this.visStorage.holders.jobs.update(jobs.map(j => { j.applyData(); return j; }));
      this.visStorage.holders.itemUsages.update(items.map(i => { i.applyData(); return i; }));
    }
  }
}

