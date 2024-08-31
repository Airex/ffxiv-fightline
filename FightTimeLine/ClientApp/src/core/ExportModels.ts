import { AbilityType, ISettingData, TimeOffset } from "./Models";

export interface ExportAttack {
  id: string;
  name: string;
  type: number;
  offset: TimeOffset;
  tags: string[];
  desc: string;
  color: string;
}

export interface ExportDowntime {
  id: string;
  start: TimeOffset;
  end: TimeOffset;
  comment: string;
  color: string;
}

export interface ExportBoss {
  attacks: ExportAttack[];
  downTimes: ExportDowntime[];
}

export interface ExportBossTarget {
  target: string;
  start: TimeOffset;
  end: TimeOffset;
}

export interface ExportJob {
  id: string;
  name: string;
  role: number;
  order: number;
  pet: string;
  icon: string;
}

export interface ExportAbility {
  id: string;
  job: string;
  name: string;
  type: AbilityType;
  duration: number;
  start: TimeOffset;
  icon: string;
  settings: ISettingData[];
  level?: [number, number?];
}

export interface ExportDataData {
  boss: ExportBoss;
  initialTarget: string;
  bossTargets: ExportBossTarget[];
  jobs: ExportJob[];
  abilities: ExportAbility[];
}

export class ExportData {
  name: string;
  userName: string;
  data: ExportDataData;
}

export interface IExportResultSet {
  headers: IExportColumn[][];
  columns: IExportColumn[];
  rows: IExportRow[];
  title: string;
  filterByFirstEntry: boolean;
}

export interface ColumnFilterItem {
  text: string;
  value: any;
  byDefault?: boolean;
}

export type ColumnAlign = "left" | "right" | "center" | null;

export type ColumnFilterFunc = (
  a: any,
  data: IExportRow,
  c?: IExportColumn
) => boolean;

export interface IExportColumn {
  type?: string;
  text: string;
  icon?: string;
  iconSize?: number;
  align?: ColumnAlign;
  refId?: string;
  cursor?: string;
  listOfFilter?: ColumnFilterItem[];
  filterFn?: ColumnFilterFunc;
  backgroundColor?: string;
  name?: string;
  width?: string | null;
  colSpan?: number;
  rowSpan?: number;
}

export interface IExportRow {
  cells: IExportCell[];
  filterData?: any;
}

export interface IExportCell {
  items: IExportItem[];
  align?: ColumnAlign;
  disableUnique?: boolean;
  colorFn?: (data: any) => string;
  bgRefIdFn?: (data: any) => string;
  noTag?: boolean;
}

export type ExportItemType = "common" | "checkbox";

export type IExportItem = IExportItemCheckbox | IExportItemCommon;

export function isExportItemCheckbox(
  item: IExportItem
): item is IExportItemCheckbox {
  return item.type === "checkbox";
}

export function isExportItemCommon(
  item: IExportItem
): item is IExportItemCommon {
  return item.type === "common";
}

export function isBooleanOptionsSetting(
  setting: ITableOptionsSetting
): setting is BooleanOptionsSetting {
  return setting.kind === TableOptionSettingType.Boolean;
}

export function isNumberRangeOptionsSetting(
  setting: ITableOptionsSetting
): setting is NumberRangeOptionsSetting {
  return setting.kind === TableOptionSettingType.NumberRange;
}

export function isLimitedNumberRangeOptionsSetting(
  setting: ITableOptionsSetting
): setting is LimitedNumberRangeOptionsSetting {
  return setting.kind === TableOptionSettingType.LimitedNumberRange;
}

export function isTagsOptionsSetting(
  setting: ITableOptionsSetting
): setting is TagsOptionsSetting {
  return setting.kind === TableOptionSettingType.Tags;
}

export type IExportItemBase = {
  visible?: boolean;
  filterFn?: (a: string[]) => boolean;
  refId?: string;
};

export type IExportItemCheckbox = IExportItemBase & {
  type: "checkbox";
  checked: boolean;
  id: string;
};

export type IExportItemCommon = IExportItemBase & {
  type: "common";
  text: string;
  icon?: string;
  color?: string;

  targetIcon?: string;
  usageOffset?: string;
  clone?: boolean;
  tooltip?: string;
  fullWidth?: boolean;
  ignoreIconScale?: boolean;
  ignoreShowIcon?: boolean;
  ignoreShowText?: boolean;
  allowIconsOnly?: boolean;
};

export enum TableOptionSettingType {
  Boolean,
  NumberRange,
  Tags,
  LimitedNumberRange,
}

export interface ITableOptionsSetting<TOptions = any> {
  name: string;
  kind: TableOptionSettingType;
  description?: string;
  defaultValue?: any;
  initialValue?: any;
  displayName: string;
  visible: boolean;
  options?: TOptions;
  onChange?: (value) => void;
}

export interface BooleanOptionsSetting
  extends ITableOptionsSetting<{ true?: string; false?: string }> {
  kind: TableOptionSettingType.Boolean;
}

export interface NumberRangeOptionsSetting
  extends ITableOptionsSetting<{ min: number; max: number; step?: number }> {
  kind: TableOptionSettingType.NumberRange;
}

export interface LimitedNumberRangeOptionsSetting
  extends ITableOptionsSetting<{ min: number; max: number; marks?: any }> {
  kind: TableOptionSettingType.LimitedNumberRange;
}

export type TableOptionsSettingItem = {
  id: string;
  checked: boolean;
  text?: string;
  icon?: string;
};

export interface TagsOptionsSetting
  extends ITableOptionsSetting<{ items: TableOptionsSettingItem[] }> {
  kind: TableOptionSettingType.Tags;
}

export type ITableOptionSettings = ITableOptionsSetting[];

export interface ITableOptions {
  [name: string]: any;
}
