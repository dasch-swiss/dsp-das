import { Component, Input } from '@angular/core';
import { ResourceSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Store } from '@ngxs/store';
import { FormValueGroup } from './form-value-array.type';

@Component({
  selector: 'app-property-value-comment',
  template: `
    <div *ngIf="displayMode; else editMode">
      <div *ngIf="showAllComments$ | async">{{ control.value }}</div>
    </div>

    <ng-template #editMode>
      <mat-form-field style="flex: 1; width: 100%" subscriptSizing="dynamic" class="formfield" *ngIf="!displayMode">
        <mat-icon matPrefix style="color: #808080" *ngIf="control.disabled">lock</mat-icon>
        <textarea matInput rows="1" [placeholder]="'Comment'" [formControl]="control"></textarea>
      </mat-form-field>
    </ng-template>
  `,
})
export class PropertyValueCommentComponent {
  @Input({ required: true }) displayMode!: boolean;
  @Input({ required: true }) control!: FormValueGroup['controls']['comment'];
  showAllComments$ = this._store.select(ResourceSelectors.showAllComments);

  constructor(private _store: Store) {}
}
