import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProjectResponse, ReadProject } from '@dasch-swiss/dsp-js';
import { ProjectApiService } from '@dasch-swiss/vre/shared/app-api';
import { finalize } from 'rxjs/operators';

export interface IEraseProjectDialogProps {
  project: ReadProject;
}

@Component({
  selector: 'app-erase-project-confirmation-dialog',
  templateUrl: './erase-project-dialog.component.html',
})
export class EraseProjectDialogComponent {
  eraseForm = new FormGroup({
    shortCode: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });
  loading = false;
  isIncorrectInputError: boolean;
  eraseFormErrors = {
    shortCode: '',
    password: '',
  };

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: IEraseProjectDialogProps,
    private _dialogRef: MatDialogRef<EraseProjectDialogComponent>,
    private _projectApiService: ProjectApiService
  ) {}

  submit() {
    if (this.eraseForm.invalid) return;
    this.loading = true;

    this._projectApiService
      .erase(this.eraseForm.controls.shortCode.value)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((response: ProjectResponse) => {
        this._dialogRef.close(response);
      });
  }
}
