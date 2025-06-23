import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StringLiteralV2 } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { PropertyForm, PropertyEditData } from './property-form.type';

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
    private dialogRef: MatDialogRef<EditPropertyFormDialogComponent, PropertyEditData>,
    @Inject(MAT_DIALOG_DATA) public data: PropertyEditData
  ) {}

  ngOnInit() {
    this.dialogRef.updateSize('800px', '');
  }

  onSubmit() {
    const propertyData: PropertyEditData = {
      id: this.data.id,
      propType: this.data.propType,
      name: this.form.controls.name.value,
      label: this.form.controls.labels.touched ? (this.form.controls.labels.value as StringLiteralV2[]) : undefined,
      comment: this.form.controls.comments.touched
        ? (this.form.controls.comments.value as StringLiteralV2[])
        : undefined,
      guiElement: this.form.controls.guiElement.touched ? this.form.controls.guiElement.value : undefined,
    };
    this.dialogRef.close(propertyData);
  }
}
