import { AbilityType, ISettingData } from "./Models";

export interface ExportAttack {
  id: string;
  name: string;
  type: number;
  offset: string;
  tags: string[];
  desc: string;
}

export interface ExportDowntime {
  id: string;
  start: string;
  end: string;
  comment: string;
  color: string;
}

export interface ExportBoss {
  attacks: ExportAttack[];
  downTimes: ExportDowntime[];
}

export interface ExportBossTarget {
  target: string;
  start: string;
  end: string;
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
  start: string;
  icon: string;
  settings: ISettingData[];
}

export interface ExportDataData {
  boss: ExportBoss;
  initialTarget: string;
  bossTargets: ExportBossTarget[],
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
  icon: string;
  align?: 'left' | 'right' | 'center' | null;
  refId?: string;
  cursor?: string;
  listOfFilter?: { text: string; value: any; byDefault?: boolean }[];
  filterFn?: (a: any, data: any, c?:IExportColumn) => boolean;
  name?: string;
  width?: string | null
}

export interface IExportRow {
  cells: IExportCell[]
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
}