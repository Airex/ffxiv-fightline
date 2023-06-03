import {
  Component,
  Inject,
  EventEmitter,
  ViewChild,
  Output,
} from "@angular/core";
import { IFilter, DefaultTags } from "../../../core/Models";

@Component({
  selector: "settingsFilter",
  templateUrl: "./settingsFilter.component.html",
  styleUrls: ["./settingsFilter.component.css"],
})
export class SettingsFilterComponent {
  public selfDefensive = true;
  public partyDefensive = true;
  public selfDamageBuff = true;
  public partyDamageBuff = true;
  public damage = true;
  public healing = true;
  public partyHealing = true;
  public healingBuff = true;
  public partyHealingBuff = true;
  public utility = true;
  public enmity = true;
  public pet = true;
  public unused = true;
  public isMagical = true;
  public isPhysical = true;
  public isUnaspected = true;

  public set(filter: IFilter): void {
    this.selfDefensive = filter.abilities.selfDefence;
    this.partyDefensive = filter.abilities.partyDefence;
    this.selfDamageBuff = filter.abilities.selfDamageBuff;
    this.partyDamageBuff = filter.abilities.partyDamageBuff;
    this.damage = filter.abilities.damage;
    this.healing = filter.abilities.healing;
    this.partyHealing = filter.abilities.partyHealing;
    this.healingBuff = filter.abilities.healing;
    this.partyHealingBuff = filter.abilities.partyHealing;
    this.utility = filter.abilities.utility;
    this.enmity = filter.abilities.enmity;
    this.unused = filter.abilities.unused;
    this.isMagical = filter.attacks.isMagical;
    this.isPhysical = filter.attacks.isPhysical;
    this.isUnaspected = filter.attacks.isUnaspected;
  }

  public get(): IFilter {
    return {
      abilities: {
        selfDefence: this.selfDefensive,
        partyDefence: this.partyDefensive,
        defensive: this.selfDefensive,
        selfDamageBuff: this.selfDamageBuff,
        partyDamageBuff: this.partyDamageBuff,
        damage: this.damage,
        healing: this.healing,
        partyHealing: this.partyHealing,
        healingBuff: this.healingBuff,
        partyHealingBuff: this.partyHealingBuff,
        utility: this.utility,
        enmity: this.enmity,
        unused: this.unused,
      },
      attacks: {
        tags: DefaultTags.concat(["Other"]),
        sources: ["Other"],
        isPhysical: this.isPhysical,
        isMagical: this.isMagical,
        isUnaspected: this.isUnaspected,
        keywords: [],
      },
    } as IFilter;
  }
}
