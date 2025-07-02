import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StringLiteralV2 } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { take } from 'rxjs/operators';
import { OntologyEditService } from '../../services/ontology-edit.service';
import {
  PropertyForm,
  EditPropertyDialogData,
  UpdatePropertyData,
  CreatePropertyData,
  CreatePropertyDialogData,
} from './property-form.type';

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

  isPropertyEditData(data: EditPropertyDialogData | CreatePropertyDialogData): data is EditPropertyDialogData {
    return 'id' in data;
  }

  get title(): string {
    return this.isPropertyEditData(this.data) ? 'Edit property' : 'Create new property';
  }

  constructor(
    private dialogRef: MatDialogRef<EditPropertyFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CreatePropertyDialogData | EditPropertyDialogData,
    private _oes: OntologyEditService
  ) {}

  ngOnInit() {
    this.dialogRef.updateSize('800px', '');
  }

  onSubmit() {
    this.loading = true;
    let propertyData: CreatePropertyData | UpdatePropertyData;
    if (this.isPropertyEditData(this.data)) {
      propertyData = {
        id: this.data.id,
        labels: this.form.controls.labels.touched ? (this.form.controls.labels.value as StringLiteralV2[]) : undefined,
        comment: this.form.controls.comments.touched
          ? (this.form.controls.comments.value as StringLiteralV2[])
          : undefined,
      } as UpdatePropertyData;
      this._oes
        .updateProperty$(propertyData)
        .pipe(take(1))
        .subscribe(_ => {
          this.dialogRef.close();
        });
    } else {
      propertyData = {
        name: this.form.controls.name.value,
        labels: this.form.controls.labels.value as StringLiteralV2[],
        comment: this.form.controls.comments.value as StringLiteralV2[],
        propType: this.data.propType,
        guiAttribute: this.form.controls.guiElement.touched ? this.form.controls.guiElement.value : undefined,
        objectType: this.form.controls.objectType.touched ? this.form.controls.objectType.value : undefined,
      } as CreatePropertyData;
      this._oes
        .createProperty$(propertyData, this.data.assignToClass)
        .pipe(take(1))
        .subscribe(_ => {
          this.dialogRef.close();
        });
    }
  }
}
