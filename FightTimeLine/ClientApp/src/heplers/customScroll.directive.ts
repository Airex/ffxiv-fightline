import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[customScroll]',
})
export class CustomScrollDirective {

  constructor(private renderer: Renderer2, hostElement: ElementRef) {
    renderer.addClass(hostElement.nativeElement, 'custom-scroll');
  }
}
