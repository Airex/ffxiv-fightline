import { Component, Inject, EventEmitter, ViewChild, Output } from "@angular/core";
import { IFilter, DefaultTags } from "../../../core/Models"

@Component({
  selector: "settingsFilter",
  templateUrl: "./settingsFilter.component.html",
  styleUrls: ["./settingsFilter.component.css"]
})
export class SettingsFilterComponent {

  selfDefensive = true;
  partyDefensive = true;
  selfDamageBuff = true;
  partyDamageBuff = true;
  damage = true;
  healing = true;
  healingBuff = true;
  utility = true;
  enmity = true;
  pet = true;
  unused = true;
  isMagical = true;
  isPhysical = true;
  isUnaspected = true;

  public set(filter: IFilter): void {
    this.selfDefensive = filter.abilities.selfDefence;
    this.partyDefensive = filter.abilities.partyDefence;
    this.selfDamageBuff = filter.abilities.selfDamageBuff;
    this.partyDamageBuff = filter.abilities.partyDamageBuff;
    this.damage = filter.abilities.damage;
    this.healing = filter.abilities.healing;
    this.healingBuff = filter.abilities.healing;
    this.utility = filter.abilities.utility;
    this.enmity = filter.abilities.enmity;    
    this.unused = filter.abilities.unused;
    this.isMagical = filter.attacks.isMagical;
    this.isPhysical = filter.attacks.isPhysical;
    this.isUnaspected = filter.attacks.isUnaspected;
  }



  public get(): IFilter {
    return <IFilter>{
      abilities: {
        selfDefence: this.selfDefensive,
        partyDefence: this.partyDefensive,
        defensive: this.selfDefensive,
        selfDamageBuff: this.selfDamageBuff,
        partyDamageBuff: this.partyDamageBuff,
        damage: this.damage,
        healing: this.healing,
        healingBuff: this.healingBuff,
        utility: this.utility,
        enmity: this.enmity,        
        unused: this.unused
      },
      attacks: {
        tags: DefaultTags.concat(["Other"]),
        sources: ["Other"],
        isPhysical: this.isPhysical,
        isMagical: this.isMagical,
        isUnaspected: this.isUnaspected,
        keywords: []
      }
    };
  }
}

