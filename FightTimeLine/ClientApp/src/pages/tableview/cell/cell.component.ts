import { Component, Input, Output, EventEmitter } from "@angular/core";
import { IExportCell } from "src/core/ExportModels";


@Component({
  selector: "cell",
  templateUrl: "./cell.component.html",
  styleUrls: ["./cell.component.css"],
})
export class CellComponent  {


  @Input("input") input: IExportCell;
  @Input("showoffset") showoffset: boolean = false;
  @Input("showicon") showicon: boolean = true;
  @Input("showtext") showtext: boolean = true;
  @Input("showtarget") showtarget: boolean = true;

  @Input("iconSize") iconSize: number = 16;  
  @Output("selected") selected = new EventEmitter<string>();

  public constructor() {
  }  

  select(id:string , $event?: any) {    
    if ($event) {
      $event.stopPropagation();
      $event.preventDefault();
    }
    this.selected && this.selected.emit(id);
  }
}
