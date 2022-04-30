import { ICustomTimeActions } from "../pages/fightline/planArea/planArea.component";
import { FightTimeLineController } from "./FightTimeLineController";
import { Guid } from "guid-typescript";

export class DownTimesController {
  private downTimeData = { start: null as Date, startId: null as string };
  private downtimeMarkers = new Array<string>();
  public isInBossDownTimeMode = false;

  constructor(
    private planArea: ICustomTimeActions,
    private fightLineController: FightTimeLineController) {

  }

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
      },
        null);
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
}
