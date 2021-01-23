import { InjectionToken } from "@angular/core"
import * as BaseHolder from "../../core/Holders/BaseHolder";
import { Holders } from "../../core/Holders";

export type SidePanelMode = "default" | "table";

export type SidepanelParams = {items: BaseHolder.IForSidePanel[], holders: Holders, mode: SidePanelMode};

export const SIDEPANEL_DATA = new InjectionToken<SidepanelParams>('SIDEPANEL_DATA');

export interface ISidePanelComponent {
  refresh(): void;
}
