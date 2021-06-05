import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";


import { ITableOptions, ITableOptionSettings } from "src/core/ExportModels";

@Component({
  selector: "tableviewoptions",
  templateUrl: "./tableviewoptions.component.html",
  styleUrls: ["./tableviewoptions.component.css"],
})
export class TableViewOptionsComponent implements OnInit, OnDestroy {


  options: ITableOptions = {};
  _settings: ITableOptionSettings;
  get settings(): ITableOptionSettings {
    return this._settings;
  }

  @Input("settings") set settings(value: ITableOptionSettings) {
    this._settings = value;
    this.createForm();
    this._settings?.settings.reduce((acc,s)=>{acc[s.name] = s.defaultValue;return acc}, this.options);
  }

  @Output("changed") changed: EventEmitter<ITableOptions> = new EventEmitter<ITableOptions>();

  private createForm() {
    const groups = {};

    if (this.settings?.settings) {
      for (let d of this.settings.settings) {
        const value = d.defaultValue;
        groups[d.name] = new FormControl(value)
      }
    }

    this.form = new FormGroup(groups);
  }

  form: FormGroup;

  public constructor(
  ) {

  }
  ngOnInit(): void {

  }
  ngOnDestroy(): void {

  }

  change(name, value) {
    this.options[name] = value;
    this.changed.emit(this.options);
  }


}
