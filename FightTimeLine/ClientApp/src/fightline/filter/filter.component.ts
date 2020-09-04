import { Component, Inject, EventEmitter, ViewChild, Output, Input } from "@angular/core";
import { IFilter, DefaultTags } from "../../core/Models"
import * as H from "../../core/Holders"
import { PresenterManager } from "../../core/PresentationManager"


@Component({
  selector: "abilityFilter",
  templateUrl: "./filter.component.html",
  styleUrls: ["./filter.component.css"]
})
export class FilterComponent {

  @Input("holders") holders: H.Holders;
  @Input("presenterManager") presenterManager: PresenterManager;

  tags: { text: string, checked: boolean }[];
  sources: { text: string, checked: boolean }[];

  @Output() public changed: EventEmitter<IFilter> = new EventEmitter();

  change(value: boolean) {
    this.tags = this.presenterManager.activeTags;
    this.sources = this.presenterManager.activeSources;
  }

  updateFilter(): void {
    this.presenterManager.filter.attacks.tags = this.tags.filter(t => t.checked).map(t => t.text);
    this.presenterManager.filter.attacks.sources = this.sources.filter(t => t.checked).map(t => t.text);
    setTimeout(() => {
      this.changed.emit(this.presenterManager.filter);
    });
    ;
  }
}

