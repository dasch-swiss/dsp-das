import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DeleteResource, KnoraApiConnection, ReadResource } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ResourceFetcherService } from '@dasch-swiss/vre/resource-editor/representations';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-erase-resource-dialog',
  template: `
    <app-dialog-header [title]="'resourceEditor.eraseResourceDialog.title' | translate" [subtitle]="'resourceEditor.eraseResourceDialog.subtitle' | translate" />

    <mat-dialog-content>
      <div style="margin-bottom: 8px">{{ 'resourceEditor.eraseResourceDialog.warning' | translate }}</div>
      <mat-form-field style="width: 100%">
        <mat-label>{{ 'resourceEditor.eraseResourceDialog.reason' | translate }}</mat-label>
        <textarea
          matInput
          rows="4"
          data-cy="app-erase-resource-dialog-comment"
          [formControl]="eraseForm.controls.comment"></textarea>
        <mat-error *ngIf="eraseForm.controls.comment.errors as errors"> {{ errors | humanReadableError }} </mat-error>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions>
      <button mat-button color="primary" mat-dialog-close class="cancel-button center">{{ 'resourceEditor.eraseResourceDialog.cancel' | translate }}</button>
      <span class="fill-remaining-space"></span>
      <button
        [disabled]="eraseForm.invalid"
        mat-button
        data-cy="app-erase-resource-dialog-button"
        mat-raised-button
        appLoadingButton
        [isLoading]="loading"
        [color]="'warn'"
        class="confirm-button center"
        (click)="submit()">
        {{ 'resourceEditor.eraseResourceDialog.confirm' | translate }}
      </button>
    </mat-dialog-actions>
  `,
})
export class EraseResourceDialogComponent {
  eraseForm = new FormGroup({
    comment: new FormControl('', [Validators.required]),
  });
  loading = false;

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    @Inject(MAT_DIALOG_DATA)
    public data: ReadResource,
    private _dialogRef: MatDialogRef<EraseResourceDialogComponent>,
    private _resourceFetcherService: ResourceFetcherService
  ) {}

  submit() {
    if (this.eraseForm.invalid) return;

    this.loading = true;
    const payload = new DeleteResource();
    payload.id = this.data.id;
    payload.type = this.data.type;
    payload.deleteComment = this.eraseForm.controls.comment.value ?? '';
    payload.lastModificationDate = this.data.lastModificationDate;

    this._dspApiConnection.v2.res
      .eraseResource(payload)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(() => {
        this._resourceFetcherService.reload();
        this._dialogRef.close();
      });
  }
}
