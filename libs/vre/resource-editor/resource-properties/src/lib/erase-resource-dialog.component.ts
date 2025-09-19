import { CdkScrollable } from '@angular/cdk/scrolling';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { DeleteResource, KnoraApiConnection, ReadResource } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ResourceFetcherServiceInterface } from '@dasch-swiss/vre/core/session';
import { DialogHeaderComponent } from '@dasch-swiss/vre/shared/app-common-to-move';
import { LoadingButtonDirective } from '@dasch-swiss/vre/ui/progress-indicator';
import { HumanReadableErrorPipe } from '@dasch-swiss/vre/ui/string-literal';
import { finalize } from 'rxjs';

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
        @if (eraseForm.controls.comment.errors; as errors) {
          <mat-error> {{ errors | humanReadableError }} </mat-error>
        }
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
  standalone: true,
  imports: [
    DialogHeaderComponent,
    CdkScrollable,
    MatDialogContent,
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    ReactiveFormsModule,
    MatError,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    LoadingButtonDirective,
    HumanReadableErrorPipe,
  ],
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
    @Inject(ResourceFetcherServiceInterface)
    private _resourceFetcherService: ResourceFetcherServiceInterface
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
