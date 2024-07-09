// custom-tooltip.directive.ts
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Directive, ElementRef, HostListener, Input, OnDestroy, ViewContainerRef } from '@angular/core';
import { CustomTooltipComponent } from './custom-tooltip.component';
import { Segment } from './segment';

@Directive({
  selector: '[appCustomTooltip]',
})
export class CustomTooltipDirective implements OnDestroy {
  @Input({ required: true }) appCustomTooltip!: Segment;
  private overlayRef!: OverlayRef;
  private hideTimeout: any;

  index = 0;

  constructor(
    private overlay: Overlay,
    private elementRef: ElementRef,
    private _viewContainerRef: ViewContainerRef
  ) {}

  @HostListener('mouseenter')
  show() {
    this.index++;
    this.clearHideTimeout();

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withPositions([
        {
          originX: 'center',
          originY: 'bottom',
          overlayX: 'center',
          overlayY: 'top',
        },
      ]);

    this.overlayRef = this.overlay.create({ positionStrategy });
    const tooltipPortal = new ComponentPortal(CustomTooltipComponent, this._viewContainerRef);
    const componentRef = this.overlayRef.attach(tooltipPortal);
    componentRef.instance.segment = this.appCustomTooltip;
    componentRef.instance.index = this.index;

    componentRef.instance.mouseEnter.subscribe(() => {
      console.log('enter');
      this.clearHideTimeout();
    });
    componentRef.instance.mouseLeave.subscribe(() => {
      console.log('leave');
      this.startHideTimeout();
    });
  }

  @HostListener('mouseleave')
  hide() {
    console.log('TT LEAVE', this.hideTimeout);
    this.startHideTimeout();
  }

  private startHideTimeout() {
    this.hideTimeout = setTimeout(() => {
      this.overlayRef?.dispose();
    }, 1000); // Adjust delay as needed
  }

  private clearHideTimeout() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
  }

  ngOnDestroy() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
  }
}
