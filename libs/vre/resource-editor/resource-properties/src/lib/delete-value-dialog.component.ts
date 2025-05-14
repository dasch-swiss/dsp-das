import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DeleteValue, KnoraApiConnection, ReadResource, UpdateResource } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ResourceFetcherService } from '@dasch-swiss/vre/resource-editor/representations';
import { tap } from 'rxjs/operators';
import { PropertyValueService } from './property-value.service';

export interface DeleteValueDialogProps {
  index: number;
}

@Component({
  selector: 'app-delete-value-dialog',
  template: `
    <app-dialog-header
      [title]="
        'Are you sure you want to delete this value from ' + propertyValueService.propertyDefinition.label + '?'
      " />
    <div mat-dialog-content>
      You can leave a comment to explain your choice.

      <mat-form-field style="display: block; width: 100%; margin-top: 16px">
        <mat-label>Reason</mat-label>
        <textarea
          matInput
          data-cy="delete-comment"
          rows="5"
          placeholder="Please explain the reason for your deletion."
          [(ngModel)]="comment"></textarea>
      </mat-form-field>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close (click)="dialogRef.close()">No, keep the value</button>
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
export class DeleteValueDialogComponent {
  loading = false;
  comment: string | undefined;

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    @Inject(MAT_DIALOG_DATA)
    public data: DeleteValueDialogProps,
    public dialogRef: MatDialogRef<DeleteValueDialogComponent, boolean>,
    public propertyValueService: PropertyValueService,
    private _resourceFetcherService: ResourceFetcherService,
    private _cd: ChangeDetectorRef
  ) {}

  deleteValue() {
    const resource = this.propertyValueService.editModeData?.resource as ReadResource;

    const value = this.propertyValueService.editModeData?.values[this.data.index] as unknown as ReadResource;
    const deleteVal = new DeleteValue();
    deleteVal.id = value.id;
    deleteVal.type = value.type;
    deleteVal.deleteComment = this.comment;

    const updateRes = new UpdateResource();
    updateRes.type = resource.type;
    updateRes.id = resource.id;
    updateRes.property = this.propertyValueService.propertyDefinition.id;
    updateRes.value = deleteVal;

    this._dspApiConnection.v2.values
      .deleteValue(updateRes as UpdateResource<DeleteValue>)
      .pipe(tap(() => this._resourceFetcherService.reload()))
      .subscribe(() => {
        this.dialogRef.close();
        this._cd.detectChanges();
      });
  }
}
