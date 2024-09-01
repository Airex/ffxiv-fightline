import { Component, ViewChild, ElementRef, Input, OnInit, inject } from "@angular/core";
import { NZ_MODAL_DATA, NzModalRef } from "ng-zorro-antd/modal";
import { MarkdownService } from "ngx-markdown";
import { IChangeNote } from "src/services";


@Component({
  selector: "whatsNewDialog",
  templateUrl: "./whatsNewDialog.component.html",
  styleUrls: ["./whatsNewDialog.component.css"]
})

export class WhatsNewDialogComponent implements OnInit {

  take = 1;
  @Input() data: IChangeNote[]  = inject(NZ_MODAL_DATA);;
  @ViewChild("timeline", { static: false }) timeline: ElementRef;
  constructor(
    public dialogRef: NzModalRef,
    private markdownService: MarkdownService
    ) {
    this.dialogRef.afterOpen.subscribe(() => {
      setTimeout(() => {
        this.timeline.nativeElement.scrollTop = 0;
      });
    });
  }
  ngOnInit(): void {
    //  this.markdownService.options. = "/assets/images/changelog/";
    // this.markdownService.renderer.image = (href: string | null, title: string | null, text: string) => {
    //   console.log(href, title, text);

    //   return "<img src=\"/assets/images/changelog/" + href + "\" alt=\"" + text + "\"/>";
    // }
  }

  more(){
    this.take+=10;
  }



}
