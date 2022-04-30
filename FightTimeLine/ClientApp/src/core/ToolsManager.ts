import { Action, ICustomTimeActions } from "../pages/fightline/planArea/planArea.component";
import { FightTimeLineController } from "./FightTimeLineController";
import { Guid } from "guid-typescript";

export interface ITool {
  name;
  handleAction(action: Action): boolean;
  activate(): void;
  deactivate(): void;
  refresh(): void;
}

export class DowntimeTool implements ITool {

  constructor(
    private planArea: ICustomTimeActions,
    private fightLineController: FightTimeLineController) {

  }
  private downTimeData = { start: null as Date, startId: null as string };
  private downtimeMarkers = new Array<string>();
  private isInBossDownTimeMode = false;

  name = "Phases";

  registerPoint(date: Date) {
    const id = Guid.create().toString();
    this.downtimeMarkers.push(id);
    if (this.downTimeData.start == null) {
      this.downTimeData.start = date;
      this.downTimeData.startId = id;
      this.planArea.addBossCustomTime(id, date);
    } else {
      this.planArea.addBossCustomTime(id, date);
      this.fightLineController.addDownTime({
        start: this.downTimeData.start,
        startId: this.downTimeData.startId,
        end: date,
        endId: id
      }, null);
      this.downTimeData = { start: null, startId: null };
    }
  }

  modeChanged(isInBossDownTimeMode: boolean): void {
    this.downtimeMarkers.forEach((it) => this.planArea.removeBossCustomTime(it));
    this.downtimeMarkers = [];
    const data = this.fightLineController.getBossDownTimeMarkers();
    if (isInBossDownTimeMode) {
      for (const d of data) {
        this.downtimeMarkers.push(d.map.startId, d.map.endId);
        this.planArea.addBossCustomTime(d.map.startId, d.start);
        this.planArea.addBossCustomTime(d.map.endId, d.end);
      }
    }
  }

  toggle(isInBossDownTimeMode: boolean): void {
    const data = this.fightLineController.getBossDownTimeMarkers();
    if (isInBossDownTimeMode) {
      for (const d of data) {
        this.downtimeMarkers.push(d.map.startId, d.map.endId);
        this.planArea.addBossCustomTime(d.map.startId, d.start);
        this.planArea.addBossCustomTime(d.map.endId, d.end);
      }
    } else {
      this.downtimeMarkers.forEach((it) => this.planArea.removeBossCustomTime(it));
      this.downTimeData = { start: null, startId: null };
      this.downtimeMarkers = [];
    }
  }


  handleAction(action: Action): boolean {
    if (action.name === "doubleClickEmpty") {
      if (this.isInBossDownTimeMode) {
        this.registerPoint(new Date(action.payload.time));
        return true;
      }
    }
    return false;
  }


  activate(): void {
    this.isInBossDownTimeMode = true;
    this.toggle(this.isInBossDownTimeMode);
  }

  deactivate(): void {
    this.isInBossDownTimeMode = false;
    this.toggle(this.isInBossDownTimeMode);
  }

  refresh(): void {
    this.modeChanged(this.isInBossDownTimeMode);
  }
}

export class StickyAttacksTool implements ITool {

  constructor(
    private fightLineController: FightTimeLineController
  ) {

  }

  name = "Sticky Attacks";

  handleAction(action: Action): boolean {
    return false;
  }

  activate(): void {
    //    this.fightLineController.updateTools({
    //      copypaste: false,
    //      downtime: false,
    //      stickyAttacks: true
    //    });
  }

  deactivate(): void {
    //    this.fightLineController.updateTools({
    //      copypaste: false,
    //      downtime: false,
    //      stickyAttacks: false
    //    });
  }

  refresh(): void {

  }
}

export class CopyPasteTool implements ITool {

  constructor(
    private fightLineController: FightTimeLineController
  ) {

  }

  name = "Copy & Paste";

  handleAction(action: Action): boolean {
    if (action.source === "boss" && action.name === "doubleClickEmpty") {
      this.fightLineController.paste(new Date(action.payload.time));
      return true;
    }
    return false;
  }

  activate(): void {

  }

  deactivate(): void {


  }

  refresh(): void {

  }
}

export class ToolsManager {
  private tools: ITool[] = [];
  private activeTool: ITool;

  register(tool: ITool) {
    this.tools.push(tool);
  }

  setActive(name: string) {
    if (name) {
      this.activeTool = this.tools.find(t => t.name === name);
      this.activeTool.activate();
    } else {
      if (this.activeTool) {
        this.activeTool.deactivate();
      }
      this.activeTool = null;
    }
  }

  get active(): string {
    return this.activeTool && this.activeTool.name || null;
  }

  get toolNames(): string[] {
    return this.tools.map(t => t.name);
  }

  handleAction(action: Action): boolean {
    return !!this.activeTool && this.activeTool.handleAction(action);

  }

  refresh(): void {
    if (this.activeTool) {
      this.activeTool.refresh();
    }
  }
}
