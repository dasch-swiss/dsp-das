import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
    CreatePropertyData,
    CreatePropertyFormDialogProps,
    PropertyForm
} from '@dasch-swiss/vre/ontology/ontology-properties';

@Component({
  selector: 'app-create-property-form-dialog',
  template: ` <app-dialog-header
      title="Create a new property"
      [subtitle]="data.propType.group + ': ' + data.propType.label"></app-dialog-header>
    <app-property-form
      mat-dialog-content
      (afterFormInit)="onFormInit($event)"
      [propertyData]="{ propType: data.propType }"/>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-raised-button
        color="primary"
        data-cy="submit-button"
        appLoadingButton
        [isLoading]="loading"
        [disabled]="form?.invalid"
        (click)="onSubmit()">
        Submit
      </button>
    </div>`,
})
export class CreatePropertyFormDialogComponent implements OnInit {
  loading = false;
  form!: PropertyForm;

  constructor(
    private dialogRef: MatDialogRef<CreatePropertyFormDialogComponent, CreatePropertyData>,
    @Inject(MAT_DIALOG_DATA) public data: CreatePropertyFormDialogProps,
  ) {}

  ngOnInit() {
    this.dialogRef.updateSize('800px', '');
  }

  onFormInit(form: PropertyForm) {
    form.controls.guiElement.disable();
    this.form = form;
  }

    onSubmit() {
        const propData: CreatePropertyData = {
            propType: this.data.propType,
            name: this.form.controls.name.value,
            labels: this.form.getRawValue().labels,
            comments: this.form.getRawValue().comments,
            guiAttribute: this.form.controls.guiAttr.value,
            classDef: this.data.resClass,
        };

        this.dialogRef.close(propData);
    }
}
