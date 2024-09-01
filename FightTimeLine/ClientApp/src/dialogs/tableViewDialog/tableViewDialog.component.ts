import { Component, Inject } from "@angular/core";
import { BossAttackDefensiveTemplateV2 } from "../../core/ExportTemplates/BossAttackDefensiveTemplate";
import { TableViewTemplate } from "../../core/BaseExportTemplate";
import { NzModalRef } from "ng-zorro-antd/modal";
import { DescriptiveTemplate } from "src/core/ExportTemplates/DescriptiveTemplate";
import {
  IExportCell, IExportColumn, IExportResultSet, IExportRow, ITableOptions, ITableOptionSettings,
  NumberRangeOptionsSetting, TableOptionSettingType, TagsOptionsSetting
} from "src/core/ExportModels";
import { gameServiceToken } from "src/services/game.service-provider";
import { IGameService } from "src/services/game.service-interface";
import { MitigationsTemplate } from "src/core/ExportTemplates/MitigationsTemplate";
import { VisStorageService } from "src/services/VisStorageService";
import _ from "lodash";
import { BossAttackAndMitigationAbilities } from "src/core/ExportTemplates/BossAttackAndMitigationAbilities";


@Component({
  selector: "tableViewDialog",
  templateUrl: "./tableViewDialog.component.html",
  styleUrls: ["./tableViewDialog.component.css"]
})
export class TableViewDialogComponent {

  constructor(
    public dialogRef: NzModalRef,
    private visStorage: VisStorageService,
    @Inject(gameServiceToken) private gameService: IGameService,
  ) {
  }

  get showIcon(): boolean {
    return this.currentOptions.cellOptions.indexOf("icon") >= 0;
  }
  get showOffset(): boolean {
    return this.currentOptions.cellOptions.indexOf("offset") >= 0;
  }

  get showText(): boolean {
    return this.currentOptions.cellOptions.indexOf("text") >= 0;
  }

  get showTarget(): boolean {
    return this.currentOptions.cellOptions.indexOf("target") >= 0;
  }

  get iconSize(): number {
    return this.currentOptions.iconSize;
  }


  pagesize = Number.MAX_VALUE;
  selectedValue = null;

  set: IExportResultSet = {
    rows: [],
    headers: [],
    columns: [],
    title: "",
    filterByFirstEntry: false
  };
  loading = false;
  templates: TableViewTemplate<any>[] = [
    new BossAttackDefensiveTemplateV2(),
    new DescriptiveTemplate(),
    new MitigationsTemplate(),
    new BossAttackAndMitigationAbilities()
  ];

  options: ITableOptionSettings;
  currentOptions: ITableOptions;

  filtered: IExportRow[] = [];
  filterData = {};


  show(fromOptionsChange?: boolean) {
    if (!this.selectedValue) { return; }

    this.loading = true;

    setTimeout(() => {

      const tpl = this.templates.find(it => it.name === this.selectedValue);

      if (!tpl) { return; }

      if (!fromOptionsChange) {
        const cellOptions: TagsOptionsSetting = {
          name: "cellOptions",
          defaultValue: ["icon", "text", "target"],
          displayName: "Cell Options",
          kind: TableOptionSettingType.Tags,
          description: "",
          visible: true,
          options: {
            items: [
              { id: "icon", checked: true, text: "Icon" },
              { id: "text", checked: true, text: "Text" },
              { id: "offset", checked: false, text: "Offset" },
              { id: "target", checked: true, text: "Target" }
            ]
          }
        };

        const iconSize: NumberRangeOptionsSetting = {
          name: "iconSize",
          defaultValue: 16,
          displayName: "Icon Size",
          kind: TableOptionSettingType.NumberRange,
          visible: true,
          description: "Changes size of icons",
          options: {
            min: 16,
            max: 48,
            step: 1
          }
        };

        this.options = [...(tpl.loadOptions(this.visStorage.holders) || []), cellOptions, iconSize];
        this.currentOptions = this.options.reduce((acc, c) => {
          acc[c.name] = c.defaultValue;
          return acc;
        }, {});
      }

      const context = {
        presenter: this.visStorage.presenter,
        jobRegistry: this.gameService.jobRegistry,
        options: this.currentOptions,
        holders: this.visStorage.holders
      };

      const d = tpl.buildTable(context);

      this.set = d;
      this.filterChange(null, null);
      this.loading = false;
    });

  }

  optionsChanged(values: ITableOptions) {
    this.currentOptions = values;
    // console.debug(filtered);
    this.show(true);
  }

  filterChange(event: any, column: string) {
    if (column) {
      this.filterData[column] = event;
    }
    const cellFilter = this.filterCell();
    this.filtered = this.set.rows.filter(row => {
      const flattenedColumns = this.set.columns;
      const visible = flattenedColumns.every(c => {
        const v = !c.filterFn || !this.filterData[c.name] || c.filterFn(this.filterData[c.name], row, c);
        return v;
      });

      if (visible) {
        row.cells.forEach((cell, index) => cellFilter(cell, this.filterData[flattenedColumns[index].name]));
      }

      return visible;
    });
  }

  filterCell() {
    const unique = new Set();
    const fn = (cell: IExportCell, data: string[]) => {
      cell.items.forEach(it => {
        it.visible = true;
        if (it.filterFn && data && !it.filterFn(data)) {
          it.visible = false;
          return;
        }
        else {
          if (cell.disableUnique) { return; }
          if (!it.refId) { return; }
          if (unique.has(it.refId)) {
            it.visible = false;
          } else {
            it.visible = true;
            unique.add(it.refId);
          }
        }
      });
    };
    return fn;
  }

  trackByName(__: number, item: IExportColumn): string {
    return item.text;
  }

  onClose(): void {
    this.dialogRef.destroy();
  }
}
