import { Component, Inject, inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { KnoraApiConnection, ReadResource, UpdateResourceMetadata } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ResourceFetcherService } from '@dasch-swiss/vre/resource-editor/representations';
import { TranslateService } from '@ngx-translate/core';
import { finalize, switchMap } from 'rxjs';

@Component({
  selector: 'app-edit-resource-label-dialog',
  template: ` <app-dialog-header
      [title]="initialValue"
      [subtitle]="'resourceEditor.resourceProperties.editLabel.subtitle' | translate" />

    <div mat-dialog-content>
      <app-common-input [control]="control" [label]="'resourceEditor.resourceProperties.editLabel.label' | translate" />
    </div>

    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'ui.common.actions.cancel' | translate }}</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="control.invalid"
        appLoadingButton
        data-cy="edit-resource-label-submit"
        [isLoading]="loading"
        (click)="submit()">
        {{ 'ui.common.actions.submit' | translate }}
      </button>
    </div>`,
  standalone: false,
})
export class EditResourceLabelDialogComponent {
  control = new FormControl(this.data.label, { validators: [Validators.required], nonNullable: true });
  initialValue = this.data.label;
  loading = false;

  private readonly _translateService = inject(TranslateService);

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    @Inject(MAT_DIALOG_DATA) public data: ReadResource,
    private _dialogRef: MatDialogRef<EditResourceLabelDialogComponent>,
    private _resourceFetcherService: ResourceFetcherService
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
