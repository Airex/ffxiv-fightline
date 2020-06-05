import { Component, ViewChild, ElementRef, Inject, Input, OnInit, TemplateRef, AfterViewInit } from "@angular/core";
import { NzModalRef } from "ng-zorro-antd";


@Component({
    selector: "whatsNewDialog",
    templateUrl: "./whatsNewDialog.component.html",
    styleUrls: ["./whatsNewDialog.component.css"]
})

export class WhatsNewDialog implements OnInit, AfterViewInit {
  
  @Input("data") data: any;
  @ViewChild("timeline", { static: true }) timeline: ElementRef;
  constructor(
    private dialogRef: NzModalRef) {
    this.dialogRef.afterOpen.subscribe(() => {
      
    })
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.timeline.nativeElement.scrollTop = 0;
    },0)
    
  }


}
