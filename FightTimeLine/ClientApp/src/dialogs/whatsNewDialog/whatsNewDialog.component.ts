import { Component, ViewChild, ElementRef, Inject, Input, OnInit, TemplateRef, AfterViewInit } from "@angular/core";
import { NzModalRef } from "ng-zorro-antd/modal";


@Component({
    selector: "whatsNewDialog",
    templateUrl: "./whatsNewDialog.component.html",
    styleUrls: ["./whatsNewDialog.component.css"]
})

export class WhatsNewDialog {
  
  @Input("data") data: any;
  @ViewChild("timeline", { static: false }) timeline: ElementRef;
  constructor(
    public dialogRef: NzModalRef) {
    this.dialogRef.afterOpen.subscribe(() => {
      setTimeout(() => {
          this.timeline.nativeElement.scrollTop = 0;
        });

    })
  }

  

}
