import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DeleteResource, DeleteResourceResponse, KnoraApiConnection, ReadResource } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-erase-resource-dialog',
  template: `
    <app-dialog-header title="Do you want to erase this resource forever?" [subtitle]="'Erase resource instance'" />

    <mat-dialog-content>
      <div style="margin-bottom: 8px">WARNING: This action cannot be undone, so use it with care.</div>
      <mat-form-field style="width: 100%">
        <mat-label>Reason</mat-label>
        <textarea
          matInput
          rows="4"
          data-cy="app-erase-resource-dialog-comment"
          [formControl]="eraseForm.controls.comment"></textarea>
        <mat-error *ngIf="eraseForm.controls.comment.errors as errors"> {{ errors | humanReadableError }} </mat-error>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions>
      <button mat-button color="primary" mat-dialog-close class="cancel-button center">No, keep it</button>
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
        Yes, erase
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
    private _ontologyService: OntologyService,
    private _dialogRef: MatDialogRef<EraseResourceDialogComponent>
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
      .subscribe(response => {
        this._ontologyService.updateClassItemCount(this.data);
        this._dialogRef.close(response as DeleteResourceResponse);
      });
  }
}
