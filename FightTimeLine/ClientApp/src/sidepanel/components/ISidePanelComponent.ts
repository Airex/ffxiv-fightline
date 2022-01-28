import { InjectionToken } from "@angular/core"
import * as BaseHolder from "../../core/Holders/BaseHolder";

export type SidePanelMode = "default" | "table";

export type SidepanelParams = {items: BaseHolder.IForSidePanel[], mode: SidePanelMode};

export const SIDEPANEL_DATA = new InjectionToken<SidepanelParams>('SIDEPANEL_DATA');

export interface ISidePanelComponent {
  refresh(): void;
}
