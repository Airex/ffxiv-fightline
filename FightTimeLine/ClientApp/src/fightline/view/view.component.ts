import { Component, Inject, EventEmitter, ViewChild, Output, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import { IView } from "../../core/Models"
import { PresenterManager } from "../../core/PresentationManager"


@Component({
  selector: "viewMenu",
  templateUrl: "./view.component.html",
  styleUrls: ["./view.component.css"]
})
export class ViewComponent {

  @Input("presenterManager") presenterManager: PresenterManager;

  @Output() public changed: EventEmitter<IView> = new EventEmitter();

  public set(view: IView): void {
    
  }


  constructor() {

  }

  updateView(): void {
    setTimeout(() => {
      this.changed.emit(this.presenterManager.view);
    });

  }
}

