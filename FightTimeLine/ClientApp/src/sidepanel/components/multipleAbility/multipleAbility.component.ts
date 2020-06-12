import { Component, OnInit, OnDestroy } from "@angular/core";
import { ISidePanelComponent } from "../ISidePanelComponent"

@Component({
  selector: "multipleAbility",
  templateUrl: "./multipleAbility.component.html",
  styleUrls: ["./multipleAbility.component.css"],
})
export class MultipleAbilityComponent implements OnInit, OnDestroy, ISidePanelComponent {


  constructor() {

  }

  isSameGroup: boolean;

  items: any[];

  get ability(): any {
    return this.items[0];
  }  

  setItems(items: any[]): void {
    this.items = items;
    const distinct = (value, index, self) => {
      return self.indexOf(value) === index;
    }
    this.isSameGroup = this.items.map((value) => value.item.group).filter(distinct).length <= 1;
  }

  refresh() {

  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

}
