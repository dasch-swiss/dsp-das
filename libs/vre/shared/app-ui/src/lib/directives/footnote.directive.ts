import { Directive, HostListener } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Overlay, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { FootnoteTooltipComponent } from '@dasch-swiss/vre/resource-editor/resource-properties';
import { AppError } from '@dasch-swiss/vre/shared/app-error-handler';

@Directive({
  selector: '[appFootnote]',
})
export class FootnoteDirective {
  private overlayRef: OverlayRef | null = null;
  private hideTimeout: any;

  constructor(
    private overlay: Overlay,
    private positionBuilder: OverlayPositionBuilder,
    private sanitizer: DomSanitizer
  ) {}

  @HostListener('mouseover', ['$event'])
  onMouseOver(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
    if (targetElement.nodeName.toLowerCase() === 'footnote') {
      const content = targetElement.getAttribute('content');
      if (content === null) {
        throw new AppError('Footnote content is null');
      }
      this.showTooltip(content, event.clientX, event.clientY);
    }
  }

  @HostListener('mouseout', ['$event.target'])
  onMouseOut(targetElement: HTMLElement) {
    if (targetElement.nodeName.toLowerCase() === 'footnote') {
      this.hideTooltipWithDelay();
    }
  }

  private showTooltip(content: string, mouseX: number, mouseY: number) {
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

    this.overlayRef.overlayElement.addEventListener('mouseenter', () => {
      clearTimeout(this.hideTimeout);
    });

    this.overlayRef.overlayElement.addEventListener('mouseleave', () => {
      this.hideTooltipWithDelay();
    });
  }

  private hideTooltipWithDelay() {
    this.hideTimeout = setTimeout(() => {
      this.hideTooltip();
    }, 500); // Adjust the delay as needed
  }

  private hideTooltip() {
    if (this.overlayRef) {
      this.overlayRef.detach();
    }
  }
}
