import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReadUser, StringLiteral, UpdateUserRequest, User } from '@dasch-swiss/dsp-js';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Select } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppGlobal } from '../../app-global';
import { existingNamesAsyncValidator } from '../../main/directive/existing-name/existing-names.validator';
import { CustomRegex } from '../../workspace/resource/values/custom-regex';
import { UserEditService } from './user-edit.service';
import { UserForm, UserToEdit } from './user-form.type';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  providers: [UserEditService],
})
export class UserFormComponent implements OnInit, OnDestroy {
  @Select(UserSelectors.isSysAdmin) readonly loggedInUserIsSysAdmin$: Observable<boolean>;

  readonly languagesList: StringLiteral[] = AppGlobal.languagesList;
  readonly _usernameMinLength = 4;

  readonly emailPatternErrorMsg = {
    errorKey: 'pattern',
    message: "This doesn't appear to be a valid email address.",
  };

  readonly usernamePatternErrorMsg = {
    errorKey: 'pattern',
    message: 'Spaces and special characters are not allowed in username',
  };

  private _destroy$ = new Subject<void>();

  userForm: UserForm;

  editExistingUser = false;
  userIsSystemAdmin = false;

  submitting = false;

  constructor(
    private _fb: FormBuilder,
    private _userEditService: UserEditService,
    private _dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public userConfig: UserToEdit
  ) {}

  ngOnInit() {
    this._userEditService
      .getUser$(this.userConfig)
      .pipe(takeUntil(this._destroy$))
      .subscribe((user: ReadUser) => {
        this.editExistingUser = !!user?.id;
        this._buildForm(user);
      });

    this._userEditService.transactionDone.pipe(takeUntil(this._destroy$)).subscribe(() => {
      this.submitting = false;
      this._dialogRef.close();
    });
  }

  private _buildForm(user: ReadUser): void {
    this.userIsSystemAdmin = ProjectService.IsMemberOfSystemAdminGroup(user.permissions.groupsPerProject);
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
    });
  }

  setPassword(pw: string) {
    this.userForm.controls.password.setValue(pw);
  }

  submit(): void {
    this.submitting = true;
    if (this.editExistingUser) {
      this._updateUser();
    } else {
      this._createUser();
    }
  }

  private _updateUser(): void {
    const userUpdate: UpdateUserRequest = {
      familyName: this.userForm.controls.familyName.value,
      givenName: this.userForm.controls.givenName.value,
      lang: this.userForm.controls.lang.value,
    };
    this._userEditService.updateUser(this.userConfig.userId, userUpdate);
  }

  private _createUser(): void {
    const user = new User();
    user.familyName = this.userForm.controls.familyName.value;
    user.givenName = this.userForm.controls.givenName.value;
    user.email = this.userForm.controls.email.value;
    user.username = this.userForm.controls.username.value;
    user.password = this.userForm.controls.password.value;
    user.lang = this.userForm.controls.lang.value;
    user.systemAdmin = this.userIsSystemAdmin;
    user.status = true;

    this._userEditService.createUser(user);
  }

  cancel() {
    this._dialogRef.close();
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
