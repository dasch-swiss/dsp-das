import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { AppError } from '@dasch-swiss/vre/core/error-handler';
import { FormValueGroup, propertiesTypeMapping } from '@dasch-swiss/vre/resource-editor/resource-properties';
import { PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-property-value-creator',
  template: `
    <div style="display: flex" [ngClass]="{ works: isValid$ | async }" *ngIf="template">
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
          [hidden]="isHidden$ | async"
          (click)="formArray.controls.item.patchValue(null)">
          <mat-icon>cancel</mat-icon>
        </button>

        <button mat-icon-button [hidden]="isHidden$ | async" (click)="displayComment = true">
          <mat-icon>add_comment</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [``],
})
export class PropertyValueCreatorComponent implements OnInit {
  @Input({ required: true }) myProperty!: PropertyInfoValues;
  @Input({ required: true }) formArray!: FormValueGroup;
  @Input({ required: true }) template!: TemplateRef<any>;

  displayComment = false;

  isValid$!: Observable<boolean>;
  isHidden$!: Observable<boolean>;

  ngOnInit() {
    this.isValid$ = this.formArray.controls.item.valueChanges.pipe(
      startWith(this.formArray.controls.item.getRawValue()),
      map(change => {
        const mapping = propertiesTypeMapping.get(this.myProperty.propDef.objectType!);
        if (!mapping) {
          throw new AppError(
            `PropertyValueCreatorComponent: No mapping found for object type: ${this.myProperty.propDef.objectType}`
          );
        }
        return !mapping.isNullValue(change) && this.formArray.controls.item.valid;
      })
    );

    this.isHidden$ = this.isValid$.pipe(map(value => !value));
  }
}
