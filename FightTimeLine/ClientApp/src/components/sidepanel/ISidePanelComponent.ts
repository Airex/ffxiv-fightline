import { InjectionToken } from "@angular/core";
import { Observable } from "rxjs";
import { IForSidePanel } from "src/core/Holders/BaseHolder";

export type SidePanelMode = "default" | "table";

export type SidepanelParams = {
  items: IForSidePanel[],
  mode: SidePanelMode,
  refresh: Observable<void>
};

export const SIDEPANEL_DATA = new InjectionToken<SidepanelParams>('SIDEPANEL_DATA');

export interface ISidePanelComponent {
  refresh(): void;
}
