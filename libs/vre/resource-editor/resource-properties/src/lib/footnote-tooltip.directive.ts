import { Directive, ElementRef, Injector, Input, OnInit, Renderer2 } from '@angular/core';
import { Overlay, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { FootnoteTooltipComponent } from './footnote-tooltip.component';

@Directive({
  selector: '[appFootnoteTooltip]',
})
export class FootnoteTooltipDirective implements OnInit {
  @Input('appFootnoteTooltip') tooltipContent: string = '';
  @Input() tooltipClass: string = 'default-tooltip';

  private overlayRef: OverlayRef | null = null;

  constructor(
    private overlay: Overlay,
    private positionBuilder: OverlayPositionBuilder,
    private elementRef: ElementRef,
    private injector: Injector,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    const positionStrategy = this.positionBuilder.flexibleConnectedTo(this.elementRef).withPositions([
      {
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'top',
        offsetY: 10,
      },
    ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });

    this.renderer.listen(this.elementRef.nativeElement, 'mouseenter', () => {
      if (this.overlayRef && !this.overlayRef.hasAttached()) {
        console.log('good');
        const tooltipPortal = new ComponentPortal(FootnoteTooltipComponent);
        const tooltipRef = this.overlayRef.attach(tooltipPortal);
        tooltipRef.instance.content = this.tooltipContent;
        tooltipRef.instance.tooltipClass = this.tooltipClass;
      }
    });

    this.renderer.listen(this.elementRef.nativeElement, 'mouseleave', () => {
      this.overlayRef?.detach();
    });
  }

  ngOnDestroy() {
    this.overlayRef?.dispose();
  }
}
