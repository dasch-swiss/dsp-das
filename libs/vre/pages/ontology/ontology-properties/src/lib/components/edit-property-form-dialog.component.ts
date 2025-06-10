import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StringLiteralV2 } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { PropertyForm } from '../property-form.type';
import { PropertyData } from '../property-form.type';
import { PropertyInfoObject } from '@dasch-swiss/vre/shared/app-helper-services';


@Component({
  selector: 'app-edit-property-form-dialog',
  template: ` <app-dialog-header
      title="Edit a property"
      [subtitle]="data.propType.group + ': ' + data.propType.label" />
    <app-property-form
      mat-dialog-content
      (afterFormInit)="form = $event"
      [propertyData]="{
        propType: data.propType,
        name: name,
        labels: data.propDef.labels,
        comments: data.propDef.comments,
        guiAttribute: data.propDef.guiAttributes[0],
      }" />
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

  constructor(
    private dialogRef: MatDialogRef<EditPropertyFormDialogComponent, PropertyData>,
    @Inject(MAT_DIALOG_DATA) public data: PropertyInfoObject
  ) {}

  ngOnInit() {
    this.dialogRef.updateSize('800px', '');
  }

    get name(): string {
      return this.data.propDef!.id.split('#').pop()!
    }

    onSubmit() {
        const propertyData: PropertyData = {
            propType: this.data.propType,
            labels: this.form.controls.labels.touched ? this.form.controls.labels.value as StringLiteralV2[] : undefined,
            comments: this.form.controls.comments.touched ? this.form.controls.comments.value as StringLiteralV2[] : undefined,
            guiElement: this.form.controls.guiElement.touched ? this.form.controls.guiElement.value : undefined,
        };
        this.dialogRef.close(propertyData);
    }
}
