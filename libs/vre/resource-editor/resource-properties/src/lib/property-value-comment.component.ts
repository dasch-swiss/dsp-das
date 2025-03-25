import { Component, Input, Optional } from '@angular/core';
import { PropertiesDisplayService } from '@dasch-swiss/vre/resource-editor/properties-display';
import { of } from 'rxjs';
import { FormValueGroup } from './form-value-array.type';

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
      <mat-form-field style="flex: 1; width: 100%; margin: 10px 0" subscriptSizing="dynamic" *ngIf="!displayMode">
        <mat-label>{{ 'resource.comment' | translate }}</mat-label>
        <mat-icon matPrefix style="color: #808080" *ngIf="control.disabled">lock</mat-icon>
        <textarea matInput rows="1" data-cy="comment-textarea" [formControl]="control"></textarea>
      </mat-form-field>
    </ng-template>
  `,
})
export class PropertyValueCommentComponent {
  @Input({ required: true }) displayMode!: boolean;
  @Input({ required: true }) control!: FormValueGroup['controls']['comment'];
  showAllComments$ = this._propertiesDisplayService?.showComments$ ?? of(true);

  constructor(@Optional() private _propertiesDisplayService: PropertiesDisplayService) {}
}
