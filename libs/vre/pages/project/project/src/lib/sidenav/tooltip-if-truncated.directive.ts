import { Directive, HostListener, inject, input } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

/**
 * A Material tooltip with the full text, shown only while that text is cut off with an ellipsis.
 *
 * Put it on the element that is hovered or focused (a whole sidebar row), and point `truncated` at
 * the element that may be cut off (the row's label): whether it is truncated is checked each time
 * the pointer enters or the row takes focus, just before the tooltip would show — so it follows the
 * sidebar being resized without observing anything.
 */
@Directive({
  selector: '[appTooltipIfTruncated]',
  hostDirectives: [{ directive: MatTooltip, inputs: ['matTooltip: appTooltipIfTruncated'] }],
})
export class TooltipIfTruncatedDirective {
  /** The element whose text may be cut off. */
  readonly truncated = input.required<HTMLElement>();

  private readonly _tooltip = inject(MatTooltip);

  constructor() {
    // Not disabled up front: MatTooltip only attaches its hover listeners while enabled, so a
    // tooltip that started disabled would never show. Each hover decides instead.
    this._tooltip.position = 'right';
    this._tooltip.showDelay = 300;
  }

  // Registered before MatTooltip's own listeners, so the tooltip already knows when it shows.
  @HostListener('mouseenter')
  @HostListener('focusin')
  protected updateDisabled(): void {
    const element = this.truncated();
    this._tooltip.disabled = element.scrollWidth <= element.clientWidth;
  }
}
