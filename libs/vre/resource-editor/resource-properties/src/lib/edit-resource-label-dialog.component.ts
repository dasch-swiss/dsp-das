import { CdkScrollable } from '@angular/cdk/scrolling';
import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { KnoraApiConnection, ReadResource, UpdateResourceMetadata } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ResourceFetcherServiceInterface } from '@dasch-swiss/vre/core/session';
import { DialogHeaderComponent } from '@dasch-swiss/vre/shared/app-common-to-move';
import { LoadingButtonDirective } from '@dasch-swiss/vre/ui/progress-indicator';
import { CommonInputComponent } from '@dasch-swiss/vre/ui/ui';
import { finalize, switchMap } from 'rxjs';

@Component({
  selector: 'app-edit-resource-label-dialog',
  template: ` <app-dialog-header [title]="initialValue" subtitle="Edit resource's label" />

    <div mat-dialog-content>
      <app-common-input [control]="control" [label]="'Label'" />
    </div>

    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="control.invalid"
        appLoadingButton
        data-cy="edit-resource-label-submit"
        [isLoading]="loading"
        (click)="submit()">
        Submit
      </button>
    </div>`,
  standalone: true,
  imports: [
    DialogHeaderComponent,
    CdkScrollable,
    MatDialogContent,
    CommonInputComponent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    LoadingButtonDirective,
  ],
})
export class EditResourceLabelDialogComponent {
  control = new FormControl(this.data.label, { validators: [Validators.required], nonNullable: true });
  initialValue = this.data.label;
  loading = false;

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    @Inject(MAT_DIALOG_DATA) public data: ReadResource,
    private _dialogRef: MatDialogRef<EditResourceLabelDialogComponent>,
    @Inject(ResourceFetcherServiceInterface)
    private _resourceFetcherService: ResourceFetcherServiceInterface
  ) {}

  submit() {
    if (this.initialValue === this.control.value) {
      this._dialogRef.close(false);
      return;
    }

    if (this.control.invalid) return;

    this.loading = true;

    const payload = new UpdateResourceMetadata();
    payload.id = this.data.id;
    payload.type = this.data.type;
    payload.label = this.control.value;
    this._dspApiConnection.v2.res
      .getResource(this.data.id)
      .pipe(
        switchMap(res => {
          payload.lastModificationDate = (res as ReadResource).lastModificationDate;
          return this._dspApiConnection.v2.res.updateResourceMetadata(payload);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(() => {
        this._resourceFetcherService.reload();
        this._dialogRef.close(true);
      });
  }
}
