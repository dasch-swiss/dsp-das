import { Component, Inject, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DeleteResource, KnoraApiConnection, ReadResource } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ResourceFetcherService } from '@dasch-swiss/vre/resource-editor/representations';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-erase-resource-dialog',
  template: `
    <app-dialog-header [title]="'resourceEditor.resourceProperties.eraseResource.title' | translate" [subtitle]="'resourceEditor.resourceProperties.eraseResource.subtitle' | translate" />

    <mat-dialog-content>
      <div style="margin-bottom: 8px">{{ 'resourceEditor.resourceProperties.eraseResource.warning' | translate }}</div>
      <mat-form-field style="width: 100%">
        <mat-label>{{ 'resourceEditor.resourceProperties.eraseResource.reason' | translate }}</mat-label>
        <textarea
          matInput
          rows="4"
          data-cy="app-erase-resource-dialog-comment"
          [formControl]="eraseForm.controls.comment"></textarea>
        @if (eraseForm.controls.comment.errors; as errors) {
          <mat-error> {{ errors | humanReadableError }} </mat-error>
        }
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions>
      <button mat-button color="primary" mat-dialog-close class="cancel-button center">{{ 'resourceEditor.resourceProperties.eraseResource.noKeep' | translate }}</button>
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
        {{ 'resourceEditor.resourceProperties.eraseResource.yesErase' | translate }}
      </button>
    </mat-dialog-actions>
  `,
  standalone: false,
})
export class EraseResourceDialogComponent {
  eraseForm = new FormGroup({
    comment: new FormControl('', [Validators.required]),
  });
  loading = false;

  private readonly _translateService = inject(TranslateService);

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
