import { Component, EventEmitter, OnInit, Input, Output } from "@angular/core";
import { IAbilityFilter, IPresetTemplate } from "src/core/Models";
import { LocalStorageService } from "src/services";
import { VisStorageService } from "src/services/VisStorageService";
import { PresenterManager } from "../../../core/PresentationManager"


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
  presets = [];
  currentLevel: number;
  levels = [50,60,70,80,90];  
  fflogsSource = true;
  currentPreset;

  @Output() public changed: EventEmitter<string> = new EventEmitter();
  @Input() public fromFFlogs: boolean= false;

  constructor(
    private visStorage: VisStorageService,
    private storage: LocalStorageService
  ) {
    this.presenterManager = this.visStorage.presenter;
    this.updateCheckAll();
  }
  ngOnInit(): void {
    this.presets = this.storage.getObject("presets") || [];
  }

  filters = Object.entries(<{ [name in keyof IAbilityFilter]: [number, string] }>{
    selfDefence: [0, "Self Defense"],
    partyDefence: [1, "Party Defense"],
    selfDamageBuff: [2, "Self Damage Buff"],
    partyDamageBuff: [3, "Party Damage Buff"],
    damage: [4, "OGCD Damage"],
    healing: [5, "Healing"],
    healingBuff: [6, "Healing Buff"],
    utility: [7, "Utility"],
    enmity: [8, "Enmity"],
    unused: [10, "Show Unused"],
    pet: [9, null],
  })
    .filter(f => f[1][1])
    .sort((a, b) => a[1][0] - b[1][0])
    .map(a => ({ name: a[0], desc: a[1][1] }));

  change() {
    this.tags = this.presenterManager.activeTags;
    this.sources = this.presenterManager.activeSources;
    this.updateCheckAll();
    this.currentLevel = this.presenterManager.fightLevel;
    this.fflogsSource = this.presenterManager.filter.attacks?.fflogsSource === "cast";
  }

  checkAllFunc(value: boolean) {
    Object.keys(this.presenterManager.filter.abilities).forEach(key => {
      this.presenterManager.filter.abilities[key] = value;
    })
    setTimeout(() => {
      this.changed.emit('ability');
    });
  }

  updateCheckAll() {
    this.checkAll = undefined;
    if (Object.values(this.presenterManager.filter.abilities).every(e => e))
      this.checkAll = true;
    if (Object.values(this.presenterManager.filter.abilities).every(e => !e))
      this.checkAll = false;
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

  addPreset(input: HTMLInputElement) {
    if (input.value?.trim()) {
      const template = this.presenterManager.generatePresetTemplate(this.visStorage.holders);
      this.presets = [...this.presets, {
        name: input.value,
        template
      }];

      this.storage.setObject("presets", this.presets);
    }
  }

  fflogsSourceChanged(value: boolean){
    this.presenterManager.setFflogsSource(value?"cast":"damage");
    setTimeout(() => {
      this.changed.emit();
    });
  }

  levelChanged(l: number){
    this.presenterManager.setFightLevel(l);
    setTimeout(() => {
      this.changed.emit();
    });
  }

  presetChanged(ev: any) {
    if (ev) {
      const template = ev.template as IPresetTemplate;
      this.presenterManager.loadTemplate(template, this.visStorage.holders);
      const abs = this.visStorage.holders.abilities.getAll();
      const jobs = this.visStorage.holders.jobs.getAll();
      const items = this.visStorage.holders.itemUsages.getAll();
      this.visStorage.holders.abilities.applyFilter(() => true);
      this.visStorage.holders.abilities.update(abs.map(ab => { ab.applyData(); return ab; }))
      this.visStorage.holders.jobs.update(jobs.map(j => { j.applyData(); return j; }))
      this.visStorage.holders.itemUsages.update(items.map(i => { i.applyData(); return i; }))
    }

  }
}

