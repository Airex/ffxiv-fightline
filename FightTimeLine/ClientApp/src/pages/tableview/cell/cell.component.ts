import { Component, Input, Output, EventEmitter } from "@angular/core";
import { IExportCell } from "src/core/ExportModels";


@Component({
  selector: "cell",
  templateUrl: "./cell.component.html",
  styleUrls: ["./cell.component.css"],
})
export class CellComponent {


  @Input() input: IExportCell;
  @Input() showoffset = false;
  @Input() showicon = true;
  @Input() showtext = true;
  @Input() showtarget = true;

  @Input() iconSize = 16;
  @Output() selected = new EventEmitter<string>();
  @Output() dragStarted = new EventEmitter<string>();

  public constructor() {
  }

  select(id: string, $event?: any) {
    if ($event) {
      $event.stopPropagation();
      $event.preventDefault();
    }

    if (this.selected) {
      this.selected.emit(id);
    }
  }

  onDragStart(id: string, $event?: any){
    if (this.dragStarted) {
      this.dragStarted.emit(id);
    }
  }
}
