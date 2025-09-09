import { CdkScrollable } from '@angular/cdk/scrolling';
import { Component, Inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
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
import { KnoraApiConnection, ReadProject } from '@dasch-swiss/dsp-js';
import { ProjectApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { UserService } from '@dasch-swiss/vre/core/session';
import { DialogHeaderComponent } from '@dasch-swiss/vre/shared/app-common-to-move';
import { LoadingButtonDirective } from '@dasch-swiss/vre/ui/progress-indicator';
import { TranslateModule } from '@ngx-translate/core';
import { finalize, switchMap } from 'rxjs';

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
    TranslateModule,
  ],
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
    private _projectApiService: ProjectApiService,
    private _userService: UserService
  ) {}

  submit() {
    if (this.eraseForm.invalid) return;
    this.isLoading = true;

    const currentUser = this._userService.currentUser;
    const password = this.eraseForm.controls.password.value;
    const shortCode = this.eraseForm.controls.shortCode.value;

    this._dspApiConnection.v2.auth
      .login('username', currentUser.username, password!)
      .pipe(
        switchMap(() => {
          return this._projectApiService.erase(shortCode!);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(response => {
        this._dialogRef.close(response.project);
      });
  }

  private projectShortCodeValidator(shortCode: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null =>
      shortCode.toLowerCase() !== control.value.toLowerCase() ? { shortCode: [control.value] } : null;
  }
}
