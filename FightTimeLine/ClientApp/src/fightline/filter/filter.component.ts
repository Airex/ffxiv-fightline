import { Component, EventEmitter, Output } from "@angular/core";
import { IAbilityFilter } from "src/core/Models";
import { VisStorageService } from "src/services/VisStorageService";
import { PresenterManager } from "../../core/PresentationManager"


@Component({
  selector: "abilityFilter",
  templateUrl: "./filter.component.html",
  styleUrls: ["./filter.component.css"]
})
export class FilterComponent {
  public presenterManager: PresenterManager;
  tags: { text: string, checked: boolean }[];
  sources: { text: string, checked: boolean }[];
  checkAll = true;

  @Output() public changed: EventEmitter<string> = new EventEmitter();

  constructor(
    private visStorage: VisStorageService
  ){
    this.presenterManager = this.visStorage.presenter;
    this.updateCheckAll();
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
  }

  checkAllFunc(value: boolean) {
    Object.keys(this.presenterManager.filter.abilities).forEach(key => {
      this.presenterManager.filter.abilities[key] = value;
    })
    setTimeout(() => {
      this.changed.emit('ability');
    });
  }

  updateCheckAll(){
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
}

