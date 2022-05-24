import {
  Directive,
  EventEmitter,
  ElementRef,
  HostListener,
  Input,
  Output
} from "@angular/core";


@Directive({
  selector: "[fflogs]"
})
export class FFLogsMatcherDirective {
  @Output() onMatch: EventEmitter<string> = new EventEmitter<string>();
  @Input() matcher: string;
  @HostListener("change", ["$event"])
  @HostListener("input", ["$event"])
  onEvent(event) {
    const data = this.el.nativeElement.value;
    if (new RegExp(this.matcher).test(data)) {
      this.onMatch.emit(data);
    }
  }

  @HostListener("paste", ["$event"])
  onPaste(event) {
    const data = event.clipboardData.getData("text");
    if (new RegExp(this.matcher).test(data)) {
      this.onMatch.emit(data);
    }
  }

  constructor(private el: ElementRef) {
  }
}
