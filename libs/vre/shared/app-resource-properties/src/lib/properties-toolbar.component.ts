import { Component, Input } from '@angular/core';
import { ResourceSelectors, ToggleShowAllCommentsAction } from '@dasch-swiss/vre/shared/app-state';
import { PropertiesDisplayService } from '@dsp-app/src/app/workspace/resource/properties/properties-display.service';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-properties-toolbar',
  template: `
    <div style="display: flex; justify-content: end; background: #EAEFF3">
      <button
        mat-button
        color="primary"
        class="toggle-props"
        [matTooltip]="((showAllComments$ | async) ? 'Hide' : 'Show all') + ' comments'"
        matTooltipPosition="above"
        (click)="toggleShowAllComments()">
        <mat-icon>{{ (showAllComments$ | async) ? 'comments_disabled' : 'comment' }}</mat-icon>
        {{ (showAllComments$ | async) ? 'Hide' : 'Show all' }} comments
      </button>

      <button
        mat-button
        color="primary"
        class="toggle-props"
        *ngIf="showToggleProperties"
        [matTooltip]="
          ((propertiesDisplayService.showAllProperties$ | async) ? 'Hide empty' : 'Show all') + ' properties'
        "
        matTooltipPosition="above"
        (click)="toggleShowAllProps()">
        <mat-icon>{{ (propertiesDisplayService.showAllProperties$ | async) ? 'unfold_less' : 'unfold_more' }}</mat-icon>
        {{ (propertiesDisplayService.showAllProperties$ | async) ? 'Hide empty' : 'Show all' }} properties
      </button>
    </div>
  `,
  styles: ['button { padding-top: 24px; padding-bottom: 24px}'],
})
export class PropertiesToolbarComponent {
  @Input({ required: true }) showToggleProperties!: boolean;

  showAllComments$ = this._store.select(ResourceSelectors.showAllComments);

  constructor(
    private _store: Store,
    public propertiesDisplayService: PropertiesDisplayService
  ) {}

  toggleShowAllProps() {
    this.propertiesDisplayService.toggleShowProperties();
  }

  toggleShowAllComments() {
    this._store.dispatch(new ToggleShowAllCommentsAction());
  }
}
