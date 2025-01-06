import { Directive, HostListener } from '@angular/core';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltip, MatTooltipDefaultOptions } from '@angular/material/tooltip';

@Directive({
  selector: '[appFootnote]',
  providers: [
    MatTooltip,
    {
      provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
      useValue: { showDelay: 0, hideDelay: 0, positionAtOrigin: true } as MatTooltipDefaultOptions,
    },
  ],
})
export class FootnoteDirective {
  private readonly _FOOTER_TAG = 'footnote';

  constructor(private _tooltip: MatTooltip) {}

  @HostListener('mouseover', ['$event'])
  onMouseOver(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
    if (targetElement.nodeName.toLowerCase() === this._FOOTER_TAG) {
      this.showTooltip(targetElement.getAttribute('content'), event.clientX, event.clientY);
    }
  }

  @HostListener('mouseout', ['$event.target'])
  onMouseOut(targetElement: HTMLElement) {
    if (targetElement.nodeName.toLowerCase() === this._FOOTER_TAG) {
      this.hideTooltip();
    }
  }

  private showTooltip(message: string, mouseX: number, mouseY: number) {
    this._tooltip.message = message;
    this._tooltip.show(0, { x: mouseX, y: mouseY + 10 });
  }

  private hideTooltip() {
    this._tooltip.hide();
  }
}
