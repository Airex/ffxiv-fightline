import { Component, EventEmitter, Output } from "@angular/core";
import { VisStorageService } from "src/services/VisStorageService";
import { IView } from "../../core/Models"
import { PresenterManager } from "../../core/PresentationManager"


@Component({
  selector: "viewMenu",
  templateUrl: "./view.component.html",
  styleUrls: ["./view.component.css"]
})
export class ViewComponent {

  public presenterManager: PresenterManager;
  @Output() public changed: EventEmitter<IView> = new EventEmitter();

  constructor(
    private visStorage: VisStorageService
  ) {
    this.presenterManager = this.visStorage.presenter;
  }

  updateView(): void {
    setTimeout(() => {
      this.changed.emit(this.presenterManager.view);
    });

  }
}

