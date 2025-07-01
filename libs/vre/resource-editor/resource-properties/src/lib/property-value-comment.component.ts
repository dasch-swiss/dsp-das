import { Component, Input, Optional } from '@angular/core';
import { of } from 'rxjs';
import { FormValueGroup } from './form-value-array.type';
import { PropertiesDisplayService } from './properties-display.service';

@Component({
  selector: 'app-property-value-comment',
  template: `
    <div *ngIf="displayMode; else editMode">
      <div
        *ngIf="(showAllComments$ | async) && control.value !== null"
        data-cy="property-value-comment"
        style="border-top: 1px solid #ebebeb; margin-top: 8px; margin-bottom: 16px; padding-top: 4px; font-size: small">
        {{ control.value }}
      </div>
    </div>

    <ng-template #editMode>
      <app-property-value-basic-comment [control]="control" />
    </ng-template>
  `,
})
export class PropertyValueCommentComponent {
  @Input({ required: true }) displayMode!: boolean;
  @Input({ required: true }) control!: FormValueGroup['controls']['comment'];
  showAllComments$ = this._propertiesDisplayService?.showComments$ ?? of(true);

  constructor(@Optional() private _propertiesDisplayService: PropertiesDisplayService) {}
}
