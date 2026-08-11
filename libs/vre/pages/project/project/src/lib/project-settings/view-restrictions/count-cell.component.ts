import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RestrictionCounts, UnitCounts } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * One audience cell of the summary matrix: how many *resources* that audience cannot fully see.
 *
 * A single count per state, shown side by side on one line:
 *
 *   - **hidden** — permission code 0, nothing served; red with `visibility_off`.
 *   - **restrictedView** — code 1, a degraded version served; amber with `blur_on`.
 *
 * The two states are distinct outcomes, not degrees of one, so they are never added together. A state
 * with a zero count renders nothing; a cell with neither renders a single dash.
 *
 * **Unit.** The API reports each audience in two units — `resources` (whole restricted resources) and
 * `items` (restricted values inside them). This cell shows `resources` only, because that is the figure
 * comparable to the row's `totalResources`. The two are never summed: one resource holding three hidden
 * values is 1 resource and 3 items, and adding them to "4" produces rows reading "4 of 1" against a class
 * of one resource. Item-level detail lives in the drill-down, not in the matrix.
 *
 * Icons are `aria-hidden` because the numbers beside them are the content; the cell carries one
 * `aria-label` naming both states, so colour is never the only channel.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-count-cell',
  template: `
    <span class="col-aud count" [attr.aria-label]="ariaLabel | translate: ariaParams">
      @if (isEmpty) {
        <span class="count-none" aria-hidden="true">–</span>
      } @else {
        @if (counts!.hidden) {
          <span class="count-hidden">
            <mat-icon aria-hidden="true">visibility_off</mat-icon>
            {{ counts!.hidden }}
          </span>
        }
        @if (counts!.restrictedView) {
          <span class="count-restricted">
            <mat-icon aria-hidden="true">blur_on</mat-icon>
            {{ counts!.restrictedView }}
          </span>
        }
      }
    </span>
  `,
  styleUrl: './count-cell.component.scss',
  imports: [MatIcon, TranslatePipe],
})
export class CountCellComponent {
  /** One audience's figure, in both units, straight off the API. */
  @Input({ required: true }) set counts(value: UnitCounts | undefined) {
    this._counts = value?.resources;
  }

  /** The resources unit — the only one this cell renders (see the class doc). */
  get counts(): RestrictionCounts | undefined {
    return this._counts;
  }

  private _counts: RestrictionCounts | undefined;

  get isEmpty(): boolean {
    return !this.counts?.hidden && !this.counts?.restrictedView;
  }

  /**
   * A single spoken label per cell, so a screen reader announces the states in words rather than two
   * bare numbers whose meaning lives in icon colour and row position.
   */
  get ariaLabel(): string {
    return this.isEmpty ? 'pages.project.viewRestrictions.countNone' : 'pages.project.viewRestrictions.countAria';
  }

  get ariaParams(): { hidden: number; restricted: number } {
    return {
      hidden: this.counts?.hidden ?? 0,
      restricted: this.counts?.restrictedView ?? 0,
    };
  }
}
