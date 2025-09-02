import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ReadUser, StringLiteral } from '@dasch-swiss/dsp-js';
import { UserApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { AvailableLanguages } from '@dasch-swiss/vre/core/config';
import { UserSelectors } from '@dasch-swiss/vre/core/state';
import { CustomRegex } from '@dasch-swiss/vre/shared/app-common';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { map, shareReplay } from 'rxjs';
import { existingNamesAsyncValidator } from '../existing-names.validator';
import { UserForm } from './user-form.type';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit {
  @Input({ required: true }) user!: ReadUser;

  @Output() afterFormInit = new EventEmitter<UserForm>();

  loggedInUserIsSysAdmin$ = this._store.select(UserSelectors.isSysAdmin);

  allUsers$ = this._userApiService.list().pipe(
    map(response => response.users),
    shareReplay({
      bufferSize: 1,
      refCount: true,
    })
  );

  _existingUserNames$ = this.allUsers$.pipe(map(allUsers => allUsers.map(user => user.username.toLowerCase())));
  _existingUserEmails$ = this.allUsers$.pipe(map(allUsers => allUsers.map(user => user.email.toLowerCase())));

  readonly languagesList: StringLiteral[] = AvailableLanguages;

  readonly emailPatternErrorMsg = {
    errorKey: 'pattern',
    message: this._ts.instant('pages.userSettings.userForm.emailValidation'),
  };

  readonly usernamePatternErrorMsg = {
    errorKey: 'pattern',
    message: this._ts.instant('pages.userSettings.userForm.usernameHint'),
  };

  editExistingUser!: boolean;

  userForm!: UserForm;

  constructor(
    private _fb: FormBuilder,
    private _ts: TranslateService,
    private _store: Store,
    private _userApiService: UserApiService
  ) {}

  ngOnInit() {
    this.editExistingUser = !!this.user?.id;
    this._buildForm();
    this.afterFormInit.emit(this.userForm);
  }

  private _buildForm(): void {
    this.userForm = this._fb.group({
      givenName: [this.user.givenName || '', Validators.required],
      familyName: [this.user.familyName || '', Validators.required],
      email: this._fb.control(
        { value: this.user.email || '', disabled: this.editExistingUser },
        {
          validators: [Validators.required, Validators.pattern(CustomRegex.EMAIL_REGEX)],
          asyncValidators: [existingNamesAsyncValidator(this._existingUserEmails$)],
        }
      ),
      username: this._fb.control(
        { value: this.user.username || '', disabled: this.editExistingUser },
        {
          validators: [Validators.required, Validators.minLength(4), Validators.pattern(CustomRegex.USERNAME_REGEX)],
          asyncValidators: [existingNamesAsyncValidator(this._existingUserNames$)],
        }
      ),
      password: [{ value: '', disabled: this.editExistingUser }, Validators.required],
      lang: [this.user.lang || 'en'],
      systemAdmin: [ProjectService.IsMemberOfSystemAdminGroup(this.user.permissions.groupsPerProject!)],
    }) as UserForm;
  }
}
