import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StringLiteralV2 } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { PropertyForm } from '../property-form.type';
import { PropertyData } from '../property-form.type';
import { PropertyInfoObject } from '@dasch-swiss/vre/shared/app-helper-services';


@Component({
  selector: 'app-edit-property-form-dialog',
  template: ` <app-dialog-header
      [title]="title"
      [subtitle]="data.propType.group + ': ' + data.propType.label || ''" />
    <app-property-form
      mat-dialog-content
      (afterFormInit)="form = $event"
      [propertyData]="propertyData" />
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-raised-button
        color="primary"
        appLoadingButton
        [isLoading]="loading"
        [disabled]="form.invalid"
        (click)="onSubmit()">
        Submit
      </button>
    </div>`,
})
export class EditPropertyFormDialogComponent implements OnInit {
  loading = false;
  form!: PropertyForm;

  propertyData!: PropertyData;

    get name(): string {
        return this.data.propDef?.id.split('#').pop() || '';
    }

    get title(): string {
        return this.data.propDef ? 'Edit property': 'Create new property';
    }

  constructor(
    private dialogRef: MatDialogRef<EditPropertyFormDialogComponent, PropertyData>,
    @Inject(MAT_DIALOG_DATA) public data: PropertyInfoObject
  ) {}

  ngOnInit() {
    this.dialogRef.updateSize('800px', '');
    if (!this.data.propDef) {
        // when creating a new property, the data will not have a propDef
      this.propertyData = this.data;
    } else {
        this.propertyData = {
            propType: this.data.propType,
            name: this.name,
            labels: this.data.propDef.labels,
            comments: this.data.propDef.comments,
            guiElement: this.data.propDef.guiAttributes[0],
            guiAttribute: this.data.propDef.guiAttributes[0],
            objectType: this.data.propDef.objectType,
        };
    }
  }

    onSubmit() {
        const propertyData: PropertyData = {
            propType: this.data.propType,
            name: this.form.controls.name.value,
            labels: this.form.controls.labels.touched ? this.form.controls.labels.value as StringLiteralV2[] : undefined,
            comments: this.form.controls.comments.touched ? this.form.controls.comments.value as StringLiteralV2[] : undefined,
            guiElement: this.form.controls.guiElement.touched ? this.form.controls.guiElement.value : undefined,
        };
        this.dialogRef.close(propertyData);
    }
}
