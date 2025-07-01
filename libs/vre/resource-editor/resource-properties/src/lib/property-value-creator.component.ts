import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, TemplateRef } from '@angular/core';
import { PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import { FormValueArray } from './form-value-array.type';

@Component({
  selector: 'app-property-value-creator',
  template: `
    <app-template-editor-switcher
      [myPropertyDefinition]="myProperty.propDef"
      [value]="myProperty.values[0]"
      (templateFound)="templateFound($event)" />

    <div style="display: flex" *ngIf="template">
      <div style="flex: 1">
        <ng-container *ngTemplateOutlet="template; context: { item: formArray.at(0).controls.item }"></ng-container>
        <app-property-value-basic-comment
          *ngIf="displayComment || !!formArray.at(0).controls.comment.value"
          [control]="formArray.at(0).controls.comment" />
      </div>
      <div style="width: 140px">
        <button
          mat-icon-button
          [matTooltip]="'Delete this value'"
          [hidden]="formArray.at(0).controls.item.value === null"
          (click)="formArray.at(0).controls.item.setValue(null)">
          <mat-icon>cancel</mat-icon>
        </button>

        <button mat-icon-button [hidden]="formArray.at(0).controls.item.value === null" (click)="displayComment = true">
          <mat-icon>add_comment</mat-icon>
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyValueCreatorComponent {
  @Input({ required: true }) myProperty!: PropertyInfoValues;
  @Input({ required: true }) formArray!: FormValueArray;

  template?: TemplateRef<any>;
  displayComment = false;

  constructor(private _cd: ChangeDetectorRef) {}

  templateFound(template: TemplateRef<any>) {
    this.template = template;
    this._cd.detectChanges();
  }
}
