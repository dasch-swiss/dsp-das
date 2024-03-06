import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReadUser, StringLiteral, UpdateUserRequest } from '@dasch-swiss/dsp-js';
import { UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Select } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppGlobal } from '../../app-global';
import { existingNamesAsyncValidator } from '../../main/directive/existing-name/existing-names.validator';
import { CustomRegex } from '../../workspace/resource/values/custom-regex';
import { UserEditService } from './user-edit.service';
import { validationMessages } from './user-form-constants';
import { UserFormControlName, UserFormModel, ValidationMessages, EditUser } from './user-form-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  providers: [UserEditService],
})
export class UserFormComponent implements OnInit, OnDestroy {
  @Select(UserSelectors.isSysAdmin) readonly loggedInUserIsSysAdmin$: Observable<boolean>;
  readonly languagesList: StringLiteral[] = AppGlobal.languagesList;
  readonly _usernameMinLength = 4;
  readonly _validationMessages: ValidationMessages = validationMessages;
  private _destroy$ = new Subject<void>();

  userForm: FormGroup;
  editExistingUser = false;
  submitting = false;

  constructor(
    private _fb: FormBuilder,
    private _userEditService: UserEditService,
    private _dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public userConfig: EditUser
  ) {}

  ngOnInit() {
    this._userEditService
      .getUser$(this.userConfig)
      .pipe(takeUntil(this._destroy$))
      .subscribe((user: ReadUser) => {
        this.editExistingUser = !!user?.id;
        this._initForm(user);
      });

    this._userEditService.transactionDone.pipe(takeUntil(this._destroy$)).subscribe(() => {
      this.submitting = false;
      this._dialogRef.close();
    });
  }

  private _initForm(user: ReadUser): void {
    this.userForm = this._fb.group({
      givenName: [user.givenName || '', Validators.required],
      familyName: [user.familyName || '', Validators.required],
      email: [
        { value: user.email || '', disabled: this.editExistingUser },
        [Validators.required, Validators.pattern(CustomRegex.EMAIL_REGEX)],
        existingNamesAsyncValidator(this._userEditService.existingUserEmails$),
      ],
      username: [
        { value: user.username || '', disabled: this.editExistingUser },
        [
          Validators.required,
          Validators.minLength(this._usernameMinLength),
          Validators.pattern(CustomRegex.USERNAME_REGEX),
        ],
        existingNamesAsyncValidator(this._userEditService.existingUserNames$),
      ],
      password: [{ value: '', disabled: this.editExistingUser }],
      lang: [user.lang || 'en'],
      status: [user.status || true],
      systemAdmin: [user.systemAdmin || false],
    });
  }

  isInvalid(controlName: UserFormControlName): boolean {
    const control = this.userForm.get(controlName);
    return control ? control.invalid && !control.pristine : false;
  }

  getErrorMessage(controlName: UserFormControlName): string | null {
    const control = this.userForm.get(controlName);
    if (!control || !control.errors) return null;
    const firstErrorKey = Object.keys(control.errors)[0];
    return this._validationMessages[controlName][firstErrorKey] || null;
  }

  setPassword(pw: string) {
    this.userForm.controls.password.setValue(pw);
  }

  submit(): void {
    this.submitting = true;
    if (this.editExistingUser) {
      this._updateExistingUser(this.userForm.value);
    } else {
      this._createNewUser(this.userForm.value);
    }
  }

  private _updateExistingUser(form: UserFormModel): void {
    const userUpdate: UpdateUserRequest = {
      familyName: form.familyName,
      givenName: form.givenName,
      lang: form.lang,
    };
    this._userEditService.updateUser(this.userConfig.userId, userUpdate);
  }

  private _createNewUser(form: UserFormModel): void {
    this._userEditService.createUser({
      ...form,
    });
  }

  cancel() {
    this._dialogRef.close();
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
