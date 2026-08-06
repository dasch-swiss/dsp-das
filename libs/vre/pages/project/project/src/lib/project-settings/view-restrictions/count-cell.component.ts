import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RestrictionCounts, UnitCounts } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * One audience cell of the summary matrix (design 1i): what that audience cannot fully see.
 *
 * Two independent axes, and neither is collapsed:
 *
 *   - **state** — `hidden` (permission code 0, nothing served) shows red with `visibility_off`;
 *     `restrictedView` (code 1, degraded version served) shows amber with `blur_on`.
 *   - **unit** — `resources` counts whole restricted resources and is the figure comparable to the class's
 *     `totalResources`; `items` counts restricted values inside resources.
 *
 * The units are rendered on separate lines with distinct icons, never added together: one resource holding
 * three hidden values is 1 resource and 3 items, and summing them to "4" produced rows reading "3 of 1"
 * against a class of one resource. A state with a zero count renders nothing; a cell with nothing at all
 * renders a single dash.
 *
 * Icons are `aria-hidden` because the numbers beside them are the content; each line carries its own
 * tooltip and the cell an `aria-label`, so colour is never the only channel.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-count-cell',
  template: `
    <span class="col-aud count" [attr.aria-label]="ariaLabel | translate: ariaParams">
      @if (isEmpty) {
        <span class="count-none" aria-hidden="true">–</span>
      } @else {
        @if (hasUnit(counts?.resources)) {
          <span class="count-line" [matTooltip]="'pages.project.viewRestrictions.resourceUnit' | translate">
            <mat-icon class="unit-icon" aria-hidden="true">description</mat-icon>
            @if (counts!.resources.hidden) {
              <span class="count-hidden">
                <mat-icon aria-hidden="true">visibility_off</mat-icon>
                {{ counts!.resources.hidden }}
              </span>
            }
            @if (counts!.resources.restrictedView) {
              <span class="count-restricted">
                <mat-icon aria-hidden="true">blur_on</mat-icon>
                {{ counts!.resources.restrictedView }}
              </span>
            }
          </span>
        }
        @if (hasUnit(counts?.items)) {
          <span class="count-line" [matTooltip]="'pages.project.viewRestrictions.itemUnit' | translate">
            <mat-icon class="unit-icon" aria-hidden="true">label</mat-icon>
            @if (counts!.items.hidden) {
              <span class="count-hidden">
                <mat-icon aria-hidden="true">visibility_off</mat-icon>
                {{ counts!.items.hidden }}
              </span>
            }
            @if (counts!.items.restrictedView) {
              <span class="count-restricted">
                <mat-icon aria-hidden="true">blur_on</mat-icon>
                {{ counts!.items.restrictedView }}
              </span>
            }
          </span>
        }
      }
    </span>
  `,
  styleUrl: './count-cell.component.scss',
  imports: [MatIcon, MatTooltipModule, TranslatePipe],
})
export class CountCellComponent {
  @Input({ required: true }) counts!: UnitCounts | undefined;

  /** Whether one unit has anything to show, in either state. */
  hasUnit(unit: RestrictionCounts | undefined): boolean {
    return !!unit && (!!unit.hidden || !!unit.restrictedView);
  }

  get isEmpty(): boolean {
    return !this.hasUnit(this.counts?.resources) && !this.hasUnit(this.counts?.items);
  }

  /**
   * A single spoken label per cell, so a screen reader announces the units and states in words rather than
   * reading four bare numbers whose meaning lives in icon colour and row position.
   */
  get ariaLabel(): string {
    return this.isEmpty ? 'pages.project.viewRestrictions.countNone' : 'pages.project.viewRestrictions.countAria';
  }

  get ariaParams(): {
    resourcesHidden: number;
    resourcesRestricted: number;
    itemsHidden: number;
    itemsRestricted: number;
  } {
    return {
      resourcesHidden: this.counts?.resources?.hidden ?? 0,
      resourcesRestricted: this.counts?.resources?.restrictedView ?? 0,
      itemsHidden: this.counts?.items?.hidden ?? 0,
      itemsRestricted: this.counts?.items?.restrictedView ?? 0,
    };
  }
}
