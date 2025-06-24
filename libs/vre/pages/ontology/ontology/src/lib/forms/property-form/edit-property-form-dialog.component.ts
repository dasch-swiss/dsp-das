import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StringLiteralV2 } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { PropertyForm, PropertyEditData, UpdatePropertyData, CreatePropertyData } from './property-form.type';

@Component({
  selector: 'app-edit-property-form-dialog',
  template: ` <app-dialog-header [title]="title" [subtitle]="data.propType.group + ': ' + data.propType.label || ''" />
    <app-property-form mat-dialog-content (afterFormInit)="form = $event" [propertyData]="data" />
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

  get title(): string {
    return this.data.id ? 'Edit property' : 'Create new property';
  }

  constructor(
    private dialogRef: MatDialogRef<EditPropertyFormDialogComponent, CreatePropertyData | UpdatePropertyData>,
    @Inject(MAT_DIALOG_DATA) public data: PropertyEditData
  ) {}

  ngOnInit() {
    this.dialogRef.updateSize('800px', '');
  }

  onSubmit() {
    let propertyData: CreatePropertyData | UpdatePropertyData;
    if (this.data.id) {
      propertyData = {
        id: this.data.id,
        labels: this.form.controls.labels.touched ? (this.form.controls.labels.value as StringLiteralV2[]) : undefined,
        comment: this.form.controls.comments.touched
          ? (this.form.controls.comments.value as StringLiteralV2[])
          : undefined,
      } as UpdatePropertyData;
    } else {
      propertyData = {
        name: this.form.controls.name.value,
        labels: this.form.controls.labels.value as StringLiteralV2[],
        comment: this.form.controls.comments.value as StringLiteralV2[],
        propType: this.data.propType,
        guiAttribute: this.form.controls.guiElement.touched ? this.form.controls.guiElement.value : undefined,
        objectType: this.form.controls.objectType.touched ? this.form.controls.objectType.value : undefined,
      } as CreatePropertyData;
    }

    this.dialogRef.close(propertyData);
  }
}
