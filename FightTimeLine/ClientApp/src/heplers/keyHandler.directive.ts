import {
  Directive,
  EventEmitter,
  HostListener,
  Output
} from "@angular/core";


import {DialogService} from "../services/DialogService"

@Directive({
  selector: "[keyHandler]"
})
export class KeyHandlerDirective {

  @Output("onCommand") onCommand = new EventEmitter<{ name: string, data?: {} }>();

  code = null;

  @HostListener("window:keydown", ["$event"])
  onKeyDown(event) {
    this.code = event.code;
    this.handleKey(event);
  }

  private handleKey(event: any) {
    if (this.code !== event.code || this.dialogService.isAnyDialogOpened) {
      return;
    }

    if (event.key === "Delete") {
      this.onCommand.next({ name: "delete" });
    } else
      if (event.code === "KeyZ" && event.ctrlKey) {
        this.onCommand.next({ name: "undo" });
      } else
        if (event.code === "KeyY" && event.ctrlKey) {
          this.onCommand.next({ name: "redo" });
        } else

          if (event.code === "ArrowLeft") {
            this.onCommand.next({ name: "keyMove", data: { delta: -1 * (event.ctrlKey ? 10 : 1) } });
          } else
            if (event.code === "ArrowRight") {
              this.onCommand.next({ name: "keyMove", data: { delta: 1 * (event.ctrlKey ? 10 : 1) } });
            }
    setTimeout(() => this.handleKey(event), 500);
  }


  @HostListener("window:keyup", ["$event"])
  onKeyUp(event) {
    this.code = null;
  }

  constructor(private dialogService: DialogService) {
  }
}
