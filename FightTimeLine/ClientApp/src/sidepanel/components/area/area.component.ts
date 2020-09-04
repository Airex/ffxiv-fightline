import { Component, Input } from "@angular/core";



@Component({
  selector: "sidepanel-area",
  templateUrl: "./area.component.html",
  styleUrls: ["./area.component.css"],
})
export class AreaComponent {

  @Input() header: string;
  @Input() maxHeigth:string;

  get opened() {
    return sessionStorage && sessionStorage.getItem(this.header+"Opened") === "true";
  }

  set opened(val) {
    if (val !== this.opened && sessionStorage)
      sessionStorage.setItem(this.header+"Opened", val.toString());
  }

  

  constructor() {

  }
  

}
