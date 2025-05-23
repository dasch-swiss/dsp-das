import { Component, Inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { KnoraApiConnection, ReadProject } from '@dasch-swiss/dsp-js';
import { ProjectApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { AppErrorHandler } from '@dasch-swiss/vre/core/error-handler';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';

export interface IEraseProjectDialogProps {
  project: ReadProject;
}

@Component({
  selector: 'app-erase-project-confirmation-dialog',
  styles: [
    `
      mat-form-field {
        width: 100%;
      }
    `,
  ],
  templateUrl: './erase-project-dialog.component.html',
})
export class EraseProjectDialogComponent {
  eraseForm = new FormGroup({
    shortCode: new FormControl('', [Validators.required, this.projectShortCodeValidator(this.data.project.shortcode)]),
    password: new FormControl('', [Validators.required]),
  });

  isLoading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: IEraseProjectDialogProps,
    private _dialogRef: MatDialogRef<EraseProjectDialogComponent>,
    @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
    private _errorHandler: AppErrorHandler,
    private _projectApiService: ProjectApiService,
    private _store: Store
  ) {}

  submit() {
    if (this.eraseForm.invalid) throw new Error('Form is invalid.');

    this.isLoading = true;

    const currentUser = this._store.selectSnapshot(state => state.user).user;
    const password = this.eraseForm.controls.password.value;
    const shortCode = this.eraseForm.controls.shortCode.value;

    this._dspApiConnection.v2.auth
      .login('username', currentUser.username, password!) // TODO [BE] should be dedicated endpoint
      .pipe(
        catchError(() => {
          this.eraseForm.controls.password.setErrors({ invalidPassword: true });
          return of(null);
        })
      )
      .pipe(
        switchMap(loginResult => {
          if (!loginResult) return of(null);

          return this._projectApiService.erase(shortCode!);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: response => {
          if (!response) return;
          this._dialogRef.close(response.project);
        },
        error: err => {
          this._errorHandler.handleError(`Unexpected error during submit: ${err}`);
        },
      });
  }

  private projectShortCodeValidator(shortCode: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null =>
      shortCode.toLowerCase() !== control.value.toLowerCase() ? { shortCode: [control.value] } : null;
  }
}
