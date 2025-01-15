import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ReadUser, StringLiteral } from '@dasch-swiss/dsp-js';
import { CustomRegex } from '@dasch-swiss/vre/shared/app-common';
import { AvailableLanguages } from '@dasch-swiss/vre/shared/app-config';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { UserSelectors } from '@dasch-swiss/vre/core/state';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { existingNamesAsyncValidator } from '../existing-names.validator';
import { UserForm } from './user-form.type';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit {
  @Input() user: ReadUser;

  @Output() afterFormInit = new EventEmitter<UserForm>();

  @Select(UserSelectors.isSysAdmin) readonly loggedInUserIsSysAdmin$: Observable<boolean>;

  @Select(UserSelectors.allUsers) readonly allUsers$: Observable<ReadUser[]>;

  private _existingUserNames$: Observable<RegExp[]>;
  private _existingUserEmails$: Observable<RegExp[]>;

  readonly languagesList: StringLiteral[] = AvailableLanguages;

  readonly emailPatternErrorMsg = {
    errorKey: 'pattern',
    message: "This doesn't appear to be a valid email address.",
  };

  readonly usernamePatternErrorMsg = {
    errorKey: 'pattern',
    message: 'Spaces and special characters are not allowed in the username',
  };

  editExistingUser: boolean;

  userForm: UserForm;

  constructor(private _fb: FormBuilder) {}

  ngOnInit() {
    this._existingUserNames$ = this.allUsers$.pipe(
      map(allUsers => allUsers.map(user => new RegExp(`(?:^|\\W)${user.username.toLowerCase()}(?:$|\\W)`)))
    );

    this._existingUserEmails$ = this.allUsers$.pipe(
      map(allUsers => allUsers.map(user => new RegExp(`(?:^|\\W)${user.email.toLowerCase()}(?:$|\\W)`)))
    );

    this.editExistingUser = !!this.user?.id;
    this._buildForm();
    this.afterFormInit.emit(this.userForm);
  }

  private _buildForm(): void {
    this.userForm = this._fb.group({
      givenName: [this.user.givenName || '', Validators.required],
      familyName: [this.user.familyName || '', Validators.required],
      email: [
        { value: this.user.email || '', disabled: this.editExistingUser },
        [Validators.required, Validators.pattern(CustomRegex.EMAIL_REGEX)],
        existingNamesAsyncValidator(this._existingUserEmails$),
      ],
      username: [
        { value: this.user.username || '', disabled: this.editExistingUser },
        [Validators.required, Validators.minLength(4), Validators.pattern(CustomRegex.USERNAME_REGEX)],
        existingNamesAsyncValidator(this._existingUserNames$),
      ],
      password: [{ value: '', disabled: this.editExistingUser }, Validators.required],
      lang: [this.user.lang || 'en'],
      systemAdmin: [ProjectService.IsMemberOfSystemAdminGroup(this.user.permissions.groupsPerProject)],
    });
  }
}
