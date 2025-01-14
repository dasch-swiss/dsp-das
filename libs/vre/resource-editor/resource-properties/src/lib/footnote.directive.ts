import { Overlay, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Directive, HostListener } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AppError } from '@dasch-swiss/vre/shared/app-error-handler';
import { FootnoteTooltipComponent } from './footnote-tooltip.component';

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
    if (this.overlayRef.hasAttached()) {
      this.overlayRef.detach();
      clearTimeout(this.hideTimeout);
    }

    const tooltipRef = this.overlayRef.attach(tooltipPortal);
    tooltipRef.instance.content = this.sanitizer.bypassSecurityTrustHtml(content);

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
    }, 300);
  }

  private hideTooltip() {
    if (this.overlayRef) {
      this.overlayRef.detach();
    }
  }
}
