import { Component, Inject, EventEmitter, ViewChild, Output, Input } from "@angular/core";
import { IFilter, DefaultTags } from "../../core/Models"
import * as H from "../../core/Holders"


@Component({
  selector: "abilityFilter",
  templateUrl: "./filter.component.html",
  styleUrls: ["./filter.component.css"]
})
export class FilterComponent {

  visible = false;

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

  tags: { text: string, checked: boolean }[];

  filter: IFilter;
  holders: H.Holders


  @Output() public changed: EventEmitter<IFilter> = new EventEmitter();

  clickMe(): void {
    this.visible = false;
  }

  public set(filter: IFilter, holders: H.Holders): void {
    this.filter = filter;
    this.holders = holders;
    this.selfDefensive = filter.abilities.selfDefence;
    this.partyDefensive = filter.abilities.partyDefence;
    this.selfDamageBuff = filter.abilities.selfDamageBuff;
    this.partyDamageBuff = filter.abilities.partyDamageBuff;
    this.damage = filter.abilities.damage;
    this.healing = filter.abilities.healing;
    this.healingBuff = filter.abilities.healing;
    this.utility = filter.abilities.utility;
    this.enmity = filter.abilities.enmity;
    this.pet = filter.abilities.pet;
    this.unused = filter.abilities.unused;
    
    this.isMagical = filter.attacks.isMagical;
    this.isPhysical = filter.attacks.isPhysical;
    this.isUnaspected = filter.attacks.isUnaspected;
  }

  change(value: boolean) {
    const newTags = this.holders.bossAttacks.uniqueTags.filter(t => !this.tags || !this.tags.some(t1=>t1.text === t));

    this.tags = this.holders.bossAttacks.uniqueTags.concat("Other").map(t => ({
      text: t,
      checked: !this.filter.attacks.tags || newTags.includes(t) || this.filter.attacks.tags.includes(t)
    }));
    this.filter.attacks.tags = this.tags.filter(t => t.checked).map(t => t.text)
  }

  updateFilter(): void {
    this.filter = <IFilter>{
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
        pet: this.pet,
        unused: this.unused
      },
      attacks: {
        tags: this.tags.filter(t => t.checked).map(t => t.text),
        isPhysical: this.isPhysical,
        isMagical: this.isMagical,
        isUnaspected: this.isUnaspected,
        keywords: []
      }
    };

    setTimeout(() => {
      this.changed.emit(this.filter);
    });
    ;
  }
}

