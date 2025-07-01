import { ChangeDetectionStrategy, Component, Input, TemplateRef } from '@angular/core';
import { PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import { FormValueGroup } from '../../../resource-properties/src/lib/form-value-array.type';

@Component({
  selector: 'app-property-value-creator',
  template: `
    <div style="display: flex" *ngIf="template">
      <div style="flex: 1">
        <ng-container *ngTemplateOutlet="template; context: { item: formArray.controls.item }"></ng-container>
        <app-property-value-basic-comment
          *ngIf="displayComment || !!formArray.controls.comment.value"
          [control]="formArray.controls.comment" />
      </div>
      <div style="width: 140px">
        <button
          mat-icon-button
          [matTooltip]="'Delete this value'"
          [hidden]="formArray.controls.item.value === null"
          (click)="formArray.controls.item.setValue(null)">
          <mat-icon>cancel</mat-icon>
        </button>

        <button mat-icon-button [hidden]="formArray.controls.item.value === null" (click)="displayComment = true">
          <mat-icon>add_comment</mat-icon>
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyValueCreatorComponent {
  @Input({ required: true }) myProperty!: PropertyInfoValues;
  @Input({ required: true }) formArray!: FormValueGroup;
  @Input({ required: true }) template!: TemplateRef<any>;

  displayComment = false;
}
