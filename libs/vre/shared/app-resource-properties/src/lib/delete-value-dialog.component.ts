import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DeleteValue, KnoraApiConnection, ReadResource, UpdateResource } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { NuListService } from './nu-list.service';

export interface DeleteValueDialogProps {
  index: number;
}

@Component({
  selector: 'app-delete-value-dialog',
  template: `
    <app-dialog-header
      [title]="
        'Are you sure you want to delete this value from ' + nuListService.propertyDefinition.label + '?'
      "></app-dialog-header>
    <div mat-dialog-content>
      You can leave a comment to explain your choice.

      <mat-form-field style="display: block; width: 100%; margin-top: 16px">
        <mat-label>Textarea</mat-label>
        <textarea
          matInput
          rows="5"
          placeholder="Please explain the reason for your deletion."
          [(ngModel)]="comment"></textarea>
      </mat-form-field>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close (click)="onCancel()">No, keep the value</button>
      <button
        mat-raised-button
        color="primary"
        appLoadingButton
        [isLoading]="loading"
        (click)="deleteValue()"
        data-cy="confirm-button">
        Yes, delete the value
      </button>
    </div>
  `,
})
export class DeleteValueDialogComponent implements OnInit {
  loading = false;
  comment: string | undefined;

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    @Inject(MAT_DIALOG_DATA)
    public data: DeleteValueDialogProps,
    public dialogRef: MatDialogRef<DeleteValueDialogComponent, boolean>,
    public nuListService: NuListService
  ) {}

  ngOnInit() {
    this.dialogRef.updateSize('800px', '');
  }

  onCancel() {
    this.dialogRef.close();
  }

  deleteValue() {
    const resource = this.nuListService._editModeData?.resource as ReadResource;

    const value = this.nuListService._editModeData?.values[this.data.index] as unknown as ReadResource;
    const deleteVal = new DeleteValue();
    deleteVal.id = value.id;
    deleteVal.type = value.type;
    deleteVal.deleteComment = this.comment;

    const updateRes = new UpdateResource();
    updateRes.type = resource.type;
    updateRes.id = resource.id;
    updateRes.property = this.nuListService.propertyDefinition.id;
    updateRes.value = deleteVal;

    console.log('in app', updateRes);
    this._dspApiConnection.v2.values.deleteValue(updateRes as UpdateResource<DeleteValue>).subscribe(() => {
      this.dialogRef.close();
    });
  }
}
