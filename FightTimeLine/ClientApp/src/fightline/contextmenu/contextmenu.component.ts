import { Component, Inject, EventEmitter, ViewChild, ViewChildren, Output, QueryList, HostListener } from "@angular/core";
import { ContextMenuService, ContextMenuComponent } from "ngx-contextmenu"
import { IAbilityFilter, IContextMenuData } from "../../core/Models"
import * as Sentry from "@sentry/browser";


@Component({
  selector: "fightLineContextMenu",
  templateUrl: "./contextmenu.component.html",
  styleUrls: ["./contextmenu.component.css"]
})
export class FightLineContextMenuComponent {

  @ViewChild("contextMenu", { static: true })
  contextMenu: ContextMenuComponent;
  @ViewChildren(ContextMenuComponent)
  downtimeMenus: QueryList<ContextMenuComponent>;

  @Output("filterUpdated") filterUpdated: EventEmitter<IAbilityFilter> = new EventEmitter<IAbilityFilter>();


  jobFilter: IAbilityFilter;
  contextMenuActions: IContextMenuData[] = [];
  pets: any[];
  hidden: any[];
  private lastDoubleClickEvent: any;

  setLastDoubleClick(e: any): void {
    if (e && e.clientX)
      this.lastDoubleClickEvent = e;
  }

  constructor(private contextMenuService: ContextMenuService) {

  }


  @HostListener("window:click", ["$event"])
  onClick(event: any) {
    if (event && event.clientX)
      this.lastDoubleClickEvent = event;
  }

  @HostListener("window:dblclick", ["$event"])
  ondblClick(event: any) {
    if (event && event.clientX)
      this.lastDoubleClickEvent = event;
  }

  serializeEvent (e) {
    if (e) {
      const o = {
        eventName: e.toString(),
        altKey: e.altKey,
        bubbles: e.bubbles,
        button: e.button,
        buttons: e.buttons,
        cancelBubble: e.cancelBubble,
        cancelable: e.cancelable,
        clientX: e.clientX,
        clientY: e.clientY,
        composed: e.composed,
        ctrlKey: e.ctrlKey,
        currentTarget: e.currentTarget ? e.currentTarget.outerHTML : null,
        defaultPrevented: e.defaultPrevented,
        detail: e.detail,
        eventPhase: e.eventPhase,
        fromElement: e.fromElement ? e.fromElement.outerHTML : null,
        isTrusted: e.isTrusted,
        layerX: e.layerX,
        layerY: e.layerY,
        metaKey: e.metaKey,
        movementX: e.movementX,
        movementY: e.movementY,
        offsetX: e.offsetX,
        offsetY: e.offsetY,
        pageX: e.pageX,
        pageY: e.pageY,
        relatedTarget: e.relatedTarget ? e.relatedTarget.outerHTML : null,
        returnValue: e.returnValue,
        screenX: e.screenX,
        screenY: e.screenY,
        shiftKey: e.shiftKey,
        sourceCapabilities: e.sourceCapabilities ? e.sourceCapabilities.toString() : null,
        target: e.target ? e.target.outerHTML : null,
        timeStamp: e.timeStamp,
        toElement: e.toElement ? e.toElement.outerHTML : null,
        type: e.type,
        view: e.view ? e.view.toString() : null,
        which: e.which,
        x: e.x,
        y: e.y
      };

      return JSON.stringify(o, null, 2);
    }
    return null;
  };

  public openStanceSelector(data: IContextMenuData[]): void {
    this.contextMenuActions = data;
    setTimeout(() => {
      this.contextMenuService.show.next({
        contextMenu: this.contextMenu,
        event: this.lastDoubleClickEvent,
        item: "",
      });
    });
  }

  public openMenu(eventData: any[], data: IContextMenuData[]) {
    const event: any = eventData[1];
    const items = data;

    if (items == null || items.length === 0) return;

    const filterItem = items.find((it: IContextMenuData) => !!it.filter);
    if (filterItem)
      this.jobFilter = filterItem.filter;

    const petItem = items.find((it: IContextMenuData) => !!it.pets);
    if (petItem)
      this.pets = petItem.pets;

    const hiddenItem = items.find((it: IContextMenuData) => !!it.hidden);
    if (hiddenItem)
      this.hidden = hiddenItem.hidden;

    this.contextMenuActions = items;
    setTimeout(() => {
      this.contextMenuService.show.next({
        contextMenu: this.contextMenu,
        event: event.event,
        item: event.item,

      });
    });
  }

  selectSubmenu(action: any, filterMenu: any, petsMenu: any, hiddenMenu: any) {
    if (!action) return null;
    if (action.filter) {
      return filterMenu;
    }
    if (action.isDowntime)
      return this.downtimeMenus.find(it => it.menuClass.indexOf(action.item.id) >= 0) || { mock: true };
    if (action.pets)
      return petsMenu;
    if (action.hidden)
      return hiddenMenu;
    return null;
  }

  resetJobFilter() {
    console.log("reset job filter requested");
    Object.assign(this.jobFilter,
      {
        unused: undefined,
        utility: undefined,
        damage: undefined,
        selfDefence: undefined,
        partyDefence: undefined,
        healing: undefined,
        healingBuff: undefined,
        partyDamageBuff: undefined,
        selfDamageBuff: undefined,
        enmity: undefined,
      });
    this.filterUpdated.emit();
  }

  updateFilter(data: IAbilityFilter,prop: string): void {
    this.jobFilter[prop] = data;
    this.filterUpdated.emit();
  }

}

