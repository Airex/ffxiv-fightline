import * as BaseHolder from "../../core/Holders/BaseHolder";
import {Holders} from "../../core/Holders";


export interface ISidePanelComponent {
  setItems(items: BaseHolder.IForSidePanel[], holders: Holders):void;
}
