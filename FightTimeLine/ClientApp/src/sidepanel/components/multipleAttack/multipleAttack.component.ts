import { Component, OnInit, OnDestroy } from "@angular/core";
import { ISidePanelComponent} from "../ISidePanelComponent"

@Component({
  selector: "multipleAttack",
  templateUrl: "./multipleAttack.component.html",
  styleUrls: ["./multipleAttack.component.css"],
})
export class MultipleAttackComponent implements OnInit, OnDestroy, ISidePanelComponent {
  

  constructor() {

  }

  isSameName: boolean;

  items: any[];

  get ability(): any {
    return this.items[0];
  }

  setItems(items: any[]): void {
    this.items = items;
    const distinct = (value, index, self) => {
      return self.indexOf(value) === index;
    }
    this.isSameName = this.items.map((value) => value.attack.name).filter(distinct).length <= 1;
  }

  refresh() {

  }

  ngOnInit(): void {
     
  }

  ngOnDestroy(): void {
    
  }

}
