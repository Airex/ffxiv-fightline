import { Component, OnInit, OnDestroy, NgZone, EventEmitter, Output } from "@angular/core";
import { VisTimelineService, TimelineOptions, DataItem } from "ngx-vis";
import { ITimelineContainer } from "src/core/Holders/BaseHolder";
import { VisStorageService } from "src/services/VisStorageService";
import { ClassNameBuilder } from "../../../core/ClassNameBuilder";
import { Utils } from "../../../core/Utils";
import { } from "xss";

export type ActionName = "delete" | "canMove" | "move" | "selected" | "clickGroup" | "clickEmpty"
  | "doubleClickGroup" | "doubleClickEmpty" | "doubleClickItem" | "timeChanged" | "visibleFrameTemplate"
  | "itemTooltip" | "keyMove" | "groupOrderSwap";
export type EventSource = "player" | "boss" | "user";
export type Action = { name: ActionName, source?: EventSource, payload?: any };

export interface ICustomTimeActions {
  addBossCustomTime(id: string, date: Date);
  addPlayerCustomTime(id: string, date: Date);
  removeBossCustomTime(id: string);
  removePlayerCustomTime(id: string);
}


@Component({
  selector: "planArea",
  templateUrl: "./planArea.component.html",
  styleUrls: ["./planArea.component.css"]
})
export class PlanAreaComponent implements OnInit, OnDestroy, ICustomTimeActions {

  constructor(
    private visTimelineService: VisTimelineService,
    private visStorage: VisStorageService,
    private ngZone: NgZone,
  ) {
    this.playerContainer = this.visStorage.playerContainer;
    this.bossContainer = this.visStorage.bossContainer;
  }

  startDate = new Date(946677600000);
  subs: any[] = [];
  visTimeline = "timeLineMain";
  visTimelineBoss = "timeLineBoss";
  playerContainer: ITimelineContainer;
  bossContainer: ITimelineContainer;
  forAction = [];
  selectedGroup: string;


  @Output()
  action = new EventEmitter<Action>();

  options: TimelineOptions = {
    width: "100%",
    height: "100%",
    minHeight: "300px",
    autoResize: true,
    start: this.startDate,
    end: new Date(new Date(this.startDate).setMinutes(30)),
    max: new Date(new Date(this.startDate).setMinutes(30)),
    min: new Date(this.startDate.valueOf() as number - 30 * 1000),
    zoomable: true,
    zoomMin: 3 * 60 * 1000,
    zoomMax: 30 * 60 * 1000,
    zoomKey: "ctrlKey",
    moveable: true,
    type: "range",
    multiselect: true,
    multiselectPerGroup: true,
    format: Utils.format(this.startDate),
    stack: true,
    showCurrentTime: false,
    stackSubgroups: true,
    groupOrder: (a: any, b: any) => {
      return (a.value || a.sValue) - (b.value || b.sValue);
    },
    editable: { remove: true, updateTime: true, add: false },
    horizontalScroll: true,
    margin: { item: { horizontal: 0, vertical: 5 } },
    onRemove: (item: any, callback: any) => {
      callback(null);
      this.emitAction("delete", "player", this.visTimelineService.getSelection(this.visTimeline));
    },
    xss: {
      disabled: true
    },
    onMoving: (item: any, callback: any) => {
      let result;
      this.emitAction("canMove", "player", {
        item,
        selection: this.visTimelineService.getSelection(this.visTimeline),
        handler: (t) => {
          result = t;
        }
      });
      // console.log(result);
      if (result) {
        callback(item);
      } else {
        callback(null);
      }
    },
    onMove: (item: any, callback: any) => {
      callback(item);
      this.forAction.push(item);
      const selection = this.visTimelineService.getSelection(this.visTimeline);
      if (this.forAction.length >= selection.length) {
        this.emitAction("move", "player", this.forAction);
        this.forAction = [];
      }
    },
    onAdd: (item: any, callback: any) => {
      callback(null);
    },
    onUpdate: (item: any, callback: any) => {
      callback(null);
    },
    visibleFrameTemplate: (item: any) => {
      let result;
      this.emitAction("visibleFrameTemplate", "player", {
        item,
        handler: (t) => {
          result = t;
        }
      });

      return result;
    },
    tooltipOnItemUpdateTime: {
      template: (item: any) => {
        let result;
        this.emitAction("itemTooltip", "player",
          {
            item,
            handler: (t) => { result = t; }
          });
        return result;
      }
    },
    snap: (date: Date) => date,
    groupEditable: { order: true },
    groupOrderSwap: (a, b) => {
      this.emitAction("groupOrderSwap", "player",
        {
          from: a,
          to: b,
          handler: (allowSwap) => {
            if (allowSwap) {
              const v = a.value;
              a.value = b.value;
              b.value = v;
            }
          }
        });

    },
  };
  optionsBoss: TimelineOptions = {
    width: "100%",
    height: "100%",
    minHeight: "50px",
    autoResize: true,
    start: this.startDate,
    end: new Date(new Date(this.startDate).setMinutes(30)),
    max: new Date(new Date(this.startDate).setMinutes(30)),
    min: new Date(this.startDate.valueOf() as number - 30 * 1000),
    zoomable: true,
    zoomMin: 3 * 60 * 1000,
    zoomMax: 30 * 60 * 1000,
    zoomKey: "ctrlKey",
    moveable: true,
    tooltip: {
      followMouse: false,
      overflowMethod: "flip"
    },
    xss: {
      disabled: true
    },
    type: "box",
    multiselect: true,
    showCurrentTime: false,
    stack: true,
    orientation: "none",
    stackSubgroups: true,
    groupOrder: "id",
    editable: { remove: true, updateTime: true, add: false },
    horizontalScroll: true,
    margin: { item: { horizontal: 0, vertical: 5 } },
    onRemove: (item: any, callback: any) => {
      callback(null);
      const selection = this.visTimelineService.getSelection(this.visTimelineBoss);
      this.emitAction("delete", "boss", selection);
    },
    onMoving: (item: any, callback: any) => {
      let result;
      this.emitAction("canMove", "boss", {
        item,
        selection: this.visTimelineService.getSelection(this.visTimelineBoss),
        handler: (t) => {
          result = t;
        }
      });

      // console.log(result);
      if (result) {
        callback(item);
      } else {
        callback(null);
      }
    },
    onMove: (item: any, callback: any) => {
      callback(item);
      this.forAction.push(item);
      const selection = this.visTimelineService.getSelection(this.visTimelineBoss);
      if (this.forAction.length >= selection.length) {
        this.emitAction("move", "boss", this.forAction);
        this.forAction = [];
      }
    },
    onAdd: (item: any, callback: any) => {
      callback(null);
    },
    tooltipOnItemUpdateTime: {
      template: (item: any) => {
        let result;
        this.emitAction("itemTooltip", "player",
          {
            item,
            handler: (t) => { result = t; }
          });
        return result;
      }
    },
    onUpdate: (item: any, callback: any) => {
      callback(null);
    },
    snap: (date: Date) => date
  };

  selectBossAttaks(value: any[]) {
    this.visTimelineService.setSelectionToIds(this.visTimelineBoss, value);
    this.setSelectionOfBossAttacks(value);

    this.visTimelineService.focusOnIds(this.visTimelineBoss, value, { animation: false });
    const w = this.visTimelineService.getWindow(this.visTimelineBoss);
    this.visTimelineService.setWindow(this.visTimeline, w.start, w.end, { animation: false });
  }

  selectAbilities(value: any[]) {
    this.visTimelineService.setSelectionToIds(this.visTimeline, value);
    this.visTimelineService.setSelectionToIds(this.visTimelineBoss, value);
    this.setSelectionOfBossAttacks([]);

    this.visTimelineService.focusOnIds(this.visTimeline, value, { animation: false });
    const w = this.visTimelineService.getWindow(this.visTimeline);
    this.visTimelineService.setWindow(this.visTimelineBoss, w.start, w.end, { animation: false });
  }

  private emitAction(name: ActionName, source: EventSource, payload: any) {
    // console.log(`Action: ${name}, Source: ${source}`)
    this.action.emit({
      name,
      source,
      payload
    });
  }

  addBossCustomTime(id: string, date: Date) {
    this.visTimelineService.addCustomTime(this.visTimelineBoss, date, id);
  }

  addPlayerCustomTime(id: string, date: Date) {
    this.visTimelineService.addCustomTime(this.visTimeline, date, id);
  }

  removeBossCustomTime(id: string) {
    return this.visTimelineService.removeCustomTime(this.visTimelineBoss, id);
  }

  removePlayerCustomTime(id: string) {
    return this.visTimelineService.removeCustomTime(this.visTimeline, id);
  }

  clearSelection() {
    this.visTimelineService.setSelectionToIds(this.visTimeline, []);
    this.visTimelineService.setSelectionToIds(this.visTimelineBoss, []);
  }

  private getSource(eventData): EventSource {
    return eventData[0] === this.visTimeline ? "player" : "boss";
  }

  timelineInitialized(): void {
    // console.log("timeline initialized");
    this.visTimelineService.on(this.visTimeline, "click");
    this.visTimelineService.on(this.visTimeline, "doubleClick");
    this.visTimelineService.on(this.visTimeline, "select");
    this.visTimelineService.on(this.visTimeline, "timechanged");
    this.visTimelineService.on(this.visTimeline, "timechange");
    this.visTimelineService.on(this.visTimeline, "rangechange");
  }

  timelineBossInitialized(): void {
    this.visTimelineService.on(this.visTimelineBoss, "click");
    this.visTimelineService.on(this.visTimelineBoss, "doubleClick");
    this.visTimelineService.on(this.visTimelineBoss, "select");
    this.visTimelineService.on(this.visTimelineBoss, "timechanged");
    this.visTimelineService.on(this.visTimelineBoss, "rangechange");
  }


  updateSelection(source: EventSource, eventData: any): void {
    if (source === "player") {
      this.visTimelineService.setSelectionToId(this.visTimelineBoss, "");
      this.setSelectionOfBossAttacks([]);
      this.emitAction("selected", source,
        {
          target: "friend",
          data: eventData
        });
    }
    if (source === "boss") {
      this.visTimelineService.setSelectionToId(this.visTimeline, "");
      this.setSelectionOfBossAttacks(this.visTimelineService.getSelection(this.visTimelineBoss) as string[]);
      this.emitAction("selected", source,
        {
          target: "boss",
          data: eventData
        });
    }
  }

  private setSelectionOfBossAttacks(ids: string[]): void {
    const toUpdate: any[] = [];

    const items = this.playerContainer.items.get();
    items.forEach((it: DataItem) => {
      const b = new ClassNameBuilder(it.className);
      const have = ids && ids.some(e => "bossAttack_" + e === it.id);
      b.set({ selected: have });
      if (b.isChanged()) {
        it.className = b.build();
        toUpdate.push(it);
      }
    });
    this.playerContainer.items.update(toUpdate);
  }


  refresh(): void {
    this.visTimelineService.redraw(this.visTimeline);
    this.visTimelineService.redraw(this.visTimelineBoss);
  }

  setInitialWindow(date: Date, mins: number): void {

    const eDate = (date || this.startDate).getMinutes() + mins;

    setTimeout(() => {
      const endDate = new Date(this.startDate.valueOf() as number + Math.max(eDate, 3) * 60 * 1000);
      this.visTimelineService.setWindow(this.visTimeline, this.startDate, endDate, { animation: false });
      this.visTimelineService.setWindow(this.visTimelineBoss, this.startDate, endDate, { animation: false });
    });
  }

  onCommand(command: { name: string, data?: any }) {
    const selected = [
      ...this.visTimelineService.getSelection(this.visTimeline),
      ...this.visTimelineService.getSelection(this.visTimelineBoss)
    ];
    switch (command.name) {
      case "delete":
        this.emitAction(command.name as any, "user", selected);
        break;
      case "keyMove":
        this.emitAction(command.name as any, "user",
          {
            delta: command.data.delta,
            selection: selected
          });
        break;
      default:
        this.emitAction(command.name as any, "user", command.data as any);
    }
  }

  ngOnInit() {
    this.subs.push(this.visTimelineService.rangechange
      .subscribe((eventData: any[]) => {
        const event: any = eventData[1];
        if (event.byUser) {
          this.visTimelineService.setWindow(eventData[0] === this.visTimeline ? this.visTimelineBoss : this.visTimeline,
            event.start,
            event.end,
            { animation: false });
        }
      }));

    this.subs.push(this.visTimelineService.select.subscribe((eventData: any[]) => {
      this.updateSelection(this.getSource(eventData), eventData[1]);
    }));

    this.subs.push(this.visTimelineService.timechanged.subscribe((eventData: any[]) => {
      this.emitAction("timeChanged", this.getSource(eventData), {
        id: eventData[1].id,
        date: eventData[1].time
      });
    }));

    this.subs.push(this.visTimelineService.click.subscribe((eventData: any[]) => {
      const source = this.getSource(eventData);
      this.unselectGroup(this.selectedGroup);
      if (eventData[1].what === "group-label") {
        if (source === "player") {
          this.selectedGroup = eventData[1].group;
          this.selectGroup(this.selectedGroup);
          this.emitAction("selected", source,
            {
              target: "group",
              data: eventData[1]
            });
          return;
        }
        this.emitAction("clickGroup", source, eventData[1]);
      }
      else if (eventData[1].what === "background" || eventData[1].what === null) {
        this.emitAction("clickEmpty", source, eventData[1]);
      }
    }));

    this.subs.push(this.visTimelineService.doubleClick.subscribe((eventData: any[]) => {
      if (eventData[1].event.type !== "dblclick") { return; }
      this.ngZone.run(() => {
        if (eventData[1].what === "background" || eventData[1].what == null) {
          this.emitAction("doubleClickEmpty", this.getSource(eventData), eventData[1]);
        } else if (eventData[1].what === "item") {
          this.emitAction("doubleClickItem", this.getSource(eventData), eventData[1]);
        } else if (eventData[1].what === "group-label") {
          this.emitAction("doubleClickGroup", this.getSource(eventData), eventData[1]);
          this.selectGroup(eventData[1].group);
        }
      });
    }));

    this.subs.push(this.visTimelineService.itemover.subscribe((eventData: any[]) => {
    }));
  }

  selectGroup(id: string) {
    const grp: any = this.playerContainer.groups.get(id);
    if (grp) {
      const cnb = new ClassNameBuilder(grp.className);
      cnb.set({ selected: true });
      grp.className = cnb.build();
      this.playerContainer.groups.update(grp);
    }
  }

  unselectGroup(id: string) {
    const grp: any = this.playerContainer.groups.get(id);
    if (grp) {
      const cnb = new ClassNameBuilder(grp.className);
      cnb.set({ selected: false });
      grp.className = cnb.build();
      this.playerContainer.groups.update(grp);
    }
  }

  ngOnDestroy(): void {
    this.visTimelineService.off(this.visTimeline, "click");
    this.visTimelineService.off(this.visTimeline, "doubleClick");
    this.visTimelineService.off(this.visTimelineBoss, "click");
    this.visTimelineService.off(this.visTimelineBoss, "doubleClick");
    this.visTimelineService.off(this.visTimeline, "select");
    this.visTimelineService.off(this.visTimelineBoss, "select");
    this.visTimelineService.off(this.visTimeline, "timechanged");
    this.visTimelineService.off(this.visTimeline, "timechange");
    this.visTimelineService.off(this.visTimeline, "rangechange");
    this.visTimelineService.off(this.visTimelineBoss, "rangechange");

    this.visTimelineService.destroy(this.visTimeline);
    this.visTimelineService.destroy(this.visTimelineBoss);
    this.subs.forEach(s => s.unsubscribe());
  }



}

