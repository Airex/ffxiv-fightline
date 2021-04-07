import { Component, OnInit, OnDestroy, Inject, Input, Output, ViewChild, NgZone, EventEmitter } from "@angular/core";
import { IExportCell } from "src/core/ExportModels";


@Component({
  selector: "cell",
  templateUrl: "./cell.component.html",
  styleUrls: ["./cell.component.css"],
})
export class CellComponent implements OnInit, OnDestroy {


  @Input("input") input: IExportCell;
  @Output("selected") selected = new EventEmitter<string>();

  public constructor() {
  }

  ngOnInit(): void {

  }
  
  ngOnDestroy(): void {

  }

  select(id:string , $event?: any) {
    console.log(id);
    if ($event) {
      $event.stopPropagation();
      $event.preventDefault();
    }
    this.selected && this.selected.emit(id);
  }
}
