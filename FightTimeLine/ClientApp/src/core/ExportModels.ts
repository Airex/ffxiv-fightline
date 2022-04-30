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
  ability: string;
  type: AbilityType;
  duration: number;
  start: TimeOffset;
  icon: string;
  settings: ISettingData[];
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
  columns: IExportColumn[];
  rows: IExportRow[];
  title: string;
  filterByFirstEntry: boolean;
}

export interface IExportColumn {
  type?: string;
  text: string;
  icon?: string;
  align?: 'left' | 'right' | 'center' | null;
  refId?: string;
  cursor?: string;
  listOfFilter?: { text: string; value: any; byDefault?: boolean }[];
  filterFn?: (a: any, data: IExportRow, c?: IExportColumn) => boolean;
  name?: string;
  width?: string | null;
}

export interface IExportRow {
  cells: IExportCell[];
  filterData?: any;
}

export interface IExportCell {
  items: IExportItem[];
  align?: 'left' | 'right' | 'center' | null;
  disableUnique?: boolean;
  colorFn?: (data) => string;
  bgRefIdFn?: (data) => string;
  noTag?: boolean;
}

export interface IExportItem {
  refId?: string;
  text: string;
  icon?: string;
  color?: string;
  visible?: boolean;
  targetIcon?: string;
  usageOffset?: string;
  clone?: boolean;
  tooltip?: string;
  fullwidth?: boolean;
  ignoreIconScale?: boolean;
  ignoreShowIcon?: boolean;
  ignoreShowText?: boolean;
  allowIconsOnly?: boolean;
  filterFn?: (a: string[]) => boolean;
}

export enum TableOptionSettingType {
  Boolean,
  NumberRange,
  Tags,
  LimitedNumberRange
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

export interface BooleanOptionsSetting extends ITableOptionsSetting<undefined> {
  kind: TableOptionSettingType.Boolean;
}

export interface NumberRangeOptionsSetting extends ITableOptionsSetting<{min: number, max: number}> {
  kind: TableOptionSettingType.NumberRange;
}

export interface LimitedNumberRangeOptionsSetting extends ITableOptionsSetting<{min: number, max: number, marks?: any }> {
  kind: TableOptionSettingType.LimitedNumberRange;
}

export type TableOptionsSettingItem = { id: string, checked: boolean, text?: string, icon?: string };

export interface TagsOptionsSetting extends ITableOptionsSetting<{items: TableOptionsSettingItem[]}> {
  kind: TableOptionSettingType.Tags;
}

export type ITableOptionSettings = ITableOptionsSetting[];

export interface ITableOptions{
  [name: string]: any;
}
