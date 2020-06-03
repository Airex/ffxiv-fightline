import {VisTimelineService,} from "ngx-vis"
import {FightTimeLineController} from "./FightTimeLineController"
import {Guid} from "guid-typescript"

export class DownTimesController {
    private downTimeData = { start: <Date>null, startId: <string>null };
    private downtimeMarkers = new Array<string>();
    public isInBossDownTimeMode = false;

  constructor(
        private visTimelineService: VisTimelineService,
        private visTimeline: string,
        private fightLineController: FightTimeLineController) {

    }

    registerPoint(date: Date) {
        const id = Guid.create().toString();
        this.downtimeMarkers.push(id);
        if (this.downTimeData.start == null) {
            this.downTimeData.start = date;
            this.downTimeData.startId = id;

            this.visTimelineService.addCustomTime(this.visTimeline, date, id);
        } else {
            this.visTimelineService.addCustomTime(this.visTimeline, date, id);
            this.fightLineController.addDownTime({ start: this.downTimeData.start, startId: this.downTimeData.startId, end: date, endId: id }, null);
            this.downTimeData = { start: null, startId: null };
        }
    }

    modeChanged(isInBossDownTimeMode: boolean): void {
        this.downtimeMarkers.forEach((it) => this.visTimelineService.removeCustomTime(this.visTimeline, it));
        this.downtimeMarkers = [];
        const data = this.fightLineController.getBossDownTimeMarkers();
        if (isInBossDownTimeMode) {
            for (let d of data) {
                this.downtimeMarkers.push(d.map.startId, d.map.endId);
                this.visTimelineService.addCustomTime(this.visTimeline, d.start, d.map.startId);
                this.visTimelineService.addCustomTime(this.visTimeline, d.end, d.map.endId);
            }
        }
    }

    toggle(isInBossDownTimeMode: boolean): any {
        const data = this.fightLineController.getBossDownTimeMarkers();
        if (isInBossDownTimeMode) {
            for (let d of data) {
                this.downtimeMarkers.push(d.map.startId, d.map.endId);
                this.visTimelineService.addCustomTime(this.visTimeline, d.start, d.map.startId);
                this.visTimelineService.addCustomTime(this.visTimeline, d.end, d.map.endId);
            }
        } else {
            this.downtimeMarkers.forEach((it) => this.visTimelineService.removeCustomTime(this.visTimeline, it));
            this.downTimeData = { start: null, startId: null };
            this.downtimeMarkers = [];
        }
    }
}
