import { Component, Input, Optional } from '@angular/core';
import { of } from 'rxjs';
import { PropertiesDisplayService } from './properties-display.service';

@Component({
  selector: 'app-property-value-comment',
  template: `
    <div *ngIf="displayMode; else editMode">
      <div
        *ngIf="(showAllComments$ | async) && comment"
        data-cy="property-value-comment"
        style="border-top: 1px solid #ebebeb; margin-top: 8px; margin-bottom: 16px; padding-top: 4px; font-size: small">
        {{ comment }}
      </div>
    </div>

    <ng-template #editMode> </ng-template>
  `,
})
export class PropertyValueCommentComponent {
  @Input({ required: true }) displayMode!: boolean;
  @Input({ required: true }) comment!: string;
  showAllComments$ = this._propertiesDisplayService?.showComments$ ?? of(true);

  constructor(@Optional() private _propertiesDisplayService: PropertiesDisplayService) {}
}
