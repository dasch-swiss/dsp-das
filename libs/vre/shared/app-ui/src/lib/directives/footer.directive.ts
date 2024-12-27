import { Directive, ElementRef, HostListener, NgZone, Renderer2, ViewContainerRef } from '@angular/core';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltip, MatTooltipDefaultOptions } from '@angular/material/tooltip';
import { Overlay, ScrollDispatcher } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { AriaDescriber, FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';

@Directive({
  selector: '[appFooter]',
  providers: [
    MatTooltip,
    { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: { showDelay: 0, hideDelay: 0 } as MatTooltipDefaultOptions },
  ],
})
export class FooterDirective {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private tooltip: MatTooltip,
    private overlay: Overlay,
    private scrollDispatcher: ScrollDispatcher,
    private viewContainerRef: ViewContainerRef,
    private ngZone: NgZone,
    private platform: Platform,
    private ariaDescriber: AriaDescriber,
    private focusMonitor: FocusMonitor,
    private dir: Directionality
  ) {
    this.setup();
  }

  setup() {}

  @HostListener('mouseover', ['$event.target'])
  onMouseOver(targetElement: HTMLElement) {
    if (targetElement.nodeName.toLowerCase() === 'p') {
      this.showTooltip(targetElement, targetElement.innerText);
    }
  }

  @HostListener('mouseout', ['$event.target'])
  onMouseOut(targetElement: HTMLElement) {
    if (targetElement.nodeName.toLowerCase() === 'p') {
      this.hideTooltip();
    }
  }

  private showTooltip(targetElement: HTMLElement, message: string) {
    this.tooltip.message = message;
    this.setup();
    this.tooltip.show();
  }

  private hideTooltip() {
    this.tooltip.hide();
  }
}
