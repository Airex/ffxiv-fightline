import { Component, EventEmitter, OnInit, Input, Output } from "@angular/core";
import { IAbilityFilter, IPresetTemplate } from "../../../core/Models";
import { LocalStorageService } from "../../../services";
import { VisStorageService } from "../../../services/VisStorageService";
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
  levels = [50, 60, 70, 80, 90, 100];
  filters = this.loadFilters();
  openedSelect = false;

  @Output() public filterChanged: EventEmitter<string> = new EventEmitter();
  @Output() public attachPresetEvent: EventEmitter<{ name: string, preset: IPresetTemplate }> = new EventEmitter();
  @Output() public presetChanged: EventEmitter<string> = new EventEmitter();
  @Input() public fromFFlogs = false;
  @Input() public fightId: string;

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
      partyHealing: [6, this.trans.instant(marker("abilityFilter.partyHealing"))],
      healingBuff: [7, this.trans.instant(marker("abilityFilter.healingBuff"))],
      partyHealingBuff: [8, this.trans.instant(marker("abilityFilter.partyHealingBuff"))],
      utility: [9, this.trans.instant(marker("abilityFilter.utility"))],
      enmity: [10, this.trans.instant(marker("abilityFilter.enmity"))],
      unused: [11, this.trans.instant(marker("abilityFilter.showUnused"))],
      pet: [12, null],
    } as NewType)
      .filter(f => f[1][1])
      .sort((a, b) => a[1][0] - b[1][0])
      .map(a => ({ name: a[0], desc: a[1][1] }));
  }

  ngOnInit(): void {
    // todo: fix this initilization
    this.presenterManager.presets = this.storage.getObject("presets") || {};
    if (Array.isArray(this.presenterManager.presets)) {
      // lets fixup old format
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
      this.filterChanged.emit('ability');
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

  attachPreset() {
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
      this.filterChanged.emit(source);
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
      this.filterChanged.emit();
    });
  }

  levelChanged(l: number) {
    this.presenterManager.setFightLevel(l);
    setTimeout(() => {
      this.filterChanged.emit("level");
    });
  }

  onPresetChanged(ev: string) {
    if (ev) {
      this.presetChanged.emit(ev);
    }
  }
}

