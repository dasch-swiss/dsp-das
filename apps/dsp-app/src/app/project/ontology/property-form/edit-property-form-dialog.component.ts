import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { PropertyInfoObject } from '@dasch-swiss/vre/shared/app-helper-services';
import { PropertyForm } from '@dsp-app/src/app/project/ontology/property-form/property-form-2.component';

export interface EditPropertyFormDialogProps {
  ontologyId: string;
  lastModificationDate: string;
  propertyInfo: PropertyInfoObject;
  resClassIri?: string;
}

@Component({
  selector: 'app-edit-property-form-dialog',
  template: ` <app-dialog-header
      title="Create a new property"
      [subtitle]="data.propertyInfo.propType.group + ': ' + data.propertyInfo.propType.label"></app-dialog-header>
    <app-property-form-2
      mat-dialog-content
      (formValueChange)="form = $event"
      [formData]="{ property: data.propertyInfo }"></app-property-form-2>
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
  form: PropertyForm;

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private dialogRef: MatDialogRef<EditPropertyFormDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: EditPropertyFormDialogProps
  ) {}

  ngOnInit() {
    this.dialogRef.updateSize('800px', '');
  }

  onSubmit() {}
}
