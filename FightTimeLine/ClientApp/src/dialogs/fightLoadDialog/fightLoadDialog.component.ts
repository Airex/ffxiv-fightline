import { Component, Inject, ViewChild, TemplateRef, Input, AfterViewInit } from "@angular/core";
import { Router } from "@angular/router";
import { IFightService } from "../../services/fight.service-interface"
import { fightServiceToken } from "../../services/fight.service-provider"
import { ScreenNotificationsService } from "../../services/ScreenNotificationsService"
import * as M from "../../core/Models"
import { NzSwitchComponent } from "ng-zorro-antd/switch";
import { NzModalRef } from "ng-zorro-antd/modal";


@Component({
  selector: "fightLoadDialog",
  templateUrl: "./fightLoadDialog.component.html",
  styleUrls: ["./fightLoadDialog.component.css"]
})

export class FightLoadDialog implements AfterViewInit {
  ngAfterViewInit(): void {
//    setTimeout(() => {
//        this.dialogRef.getConfig().nzTitle = this.headerTemplate;
//      },
//      0);
  }

  ngOnInit(): void {
    
    this.load();
  }

  load() {
    this.loading = true;
    this.service.getFightsForUser()
      .subscribe((it: M.IFight[]) => {
        this.container.fights = it;
        this.loading = false;
      }, (error) => {
        this.notification.showUnableToLoadFights();
        this.loading = false;
      });
  }


  @Input("data") data: any;
  @ViewChild("headerTemplate", { static: true }) public headerTemplate: TemplateRef<any>;
  @ViewChild("showDrafts") public fg: NzSwitchComponent;
  container: { fights : M.IFight[] } = { fights: [] };
  loading = true;
  selectedRowsChecked = [];

  constructor(
    public dialogRef: NzModalRef,
    @Inject(fightServiceToken) public service: IFightService,
    private router: Router,
    private notification: ScreenNotificationsService) {
    
  }

  removevisiblechanged(el: HTMLElement, visible: any){ //todo: check passed value
    el.className =  el.className.replace("forcevisible", "");
    if (visible)
      el.className+= " forcevisible";
  }

  remove(item: any) {
    this.service.removeFights([item.id])
      .subscribe(() => {
        this.removeSelectedRows([item.id]);
        this.loading = false;
      },
        error => {
          this.notification.showUnableToRemoveFights();
          console.error(error);
        },
        () => {
          this.selectedRowsChecked.splice(0);
        });
  }

  removeSelectedRows(itemsToRemove) {

    itemsToRemove.forEach(item => {
      const index: number = this.container.fights.findIndex(d => d.id === item);
      if (index > -1) {
        this.container.fights.splice(index, 1);
      }
    });
  }  

  onNoClick(): void {
    this.dialogRef.destroy();
  }

  select(item: any): void {

    this.dialogRef.afterClose.subscribe(() => {
      this.router.navigateByUrl("/" + item.id);
    });

    this.dialogRef.destroy();
  }
}
