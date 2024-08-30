import { Component, Input, Output, EventEmitter } from "@angular/core";
import { IExportCell, IExportItemCheckbox, IExportItemCommon, isExportItemCheckbox, isExportItemCommon } from "../../../core/ExportModels";


@Component({
  selector: "cell",
  templateUrl: "./cell.component.html",
  styleUrls: ["./cell.component.css"],
})
export class CellComponent {


  @Input() input: IExportCell;
  @Input() showOffset = false;
  @Input() showIcon = true;
  @Input() showText = true;
  @Input() showTarget = true;

  @Input() iconSize = 16;
  @Output() selected = new EventEmitter<string>();
  @Output() dragStarted = new EventEmitter<string>();

  public constructor() {
  }

  isExportItemCommon(item: any): item is IExportItemCommon {
    return isExportItemCommon(item);
  }

  isExportItemCheckbox(item: any): item is IExportItemCheckbox {
    return isExportItemCheckbox(item);
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
