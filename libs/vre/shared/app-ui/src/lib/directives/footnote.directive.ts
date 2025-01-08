import { Directive, HostListener, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Overlay, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { FootnoteTooltipComponent } from '@dasch-swiss/vre/resource-editor/resource-properties';

@Directive({
  selector: '[appFootnote]',
})
export class FootnoteDirective {
  @Input('content') content!: string;
  private overlayRef: OverlayRef | null = null;

  constructor(
    private overlay: Overlay,
    private positionBuilder: OverlayPositionBuilder,
    private sanitizer: DomSanitizer
  ) {}

  @HostListener('mouseover', ['$event'])
  onMouseOver(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
    if (targetElement.nodeName.toLowerCase() === 'footnote') {
      this.showTooltip(this.content, event.clientX, event.clientY);
    }
  }

  @HostListener('mouseout', ['$event.target'])
  onMouseOut(targetElement: HTMLElement) {
    if (targetElement.nodeName.toLowerCase() === 'footnote') {
      this.hideTooltip();
    }
  }

  private showTooltip(content: string, mouseX: number, mouseY: number) {
    console.log('show tooltip', content);
    if (!this.overlayRef) {
      const positionStrategy = this.positionBuilder.flexibleConnectedTo({ x: mouseX, y: mouseY }).withPositions([
        {
          overlayX: 'center',
          overlayY: 'top',
          originX: 'center',
          originY: 'bottom',
          offsetY: 10,
        },
      ]);

      this.overlayRef = this.overlay.create({
        positionStrategy,
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
      });
    }

    const tooltipPortal = new ComponentPortal(FootnoteTooltipComponent);
    const tooltipRef = this.overlayRef.attach(tooltipPortal);

    const sanitizedContent: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(content);
    tooltipRef.instance.content = sanitizedContent;
    console.log(tooltipRef);
  }

  private hideTooltip() {
    if (this.overlayRef) {
      this.overlayRef.detach();
    }
  }
}
