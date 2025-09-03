import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { StringLiteral } from '@dasch-swiss/dsp-js';
import { UserApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { AvailableLanguages } from '@dasch-swiss/vre/core/config';
import { UserSelectors } from '@dasch-swiss/vre/core/state';
import { CustomRegex } from '@dasch-swiss/vre/shared/app-common';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { map, shareReplay } from 'rxjs';
import { existingNamesAsyncValidator } from '../existing-names.validator';
import { UserForm } from './user-form.type';

@Component({
  selector: 'app-user-form',
  template: `
    <form>
      <app-common-input
        [control]="userForm.controls.username"
        [validatorErrors]="[usernamePatternErrorMsg]"
        [label]="'pages.userSettings.userForm.username' | translate" />
      <app-common-input
        [control]="userForm.controls.email"
        [label]="'pages.userSettings.userForm.email' | translate"
        [validatorErrors]="[emailPatternErrorMsg]" />
      <app-common-input
        [control]="userForm.controls.givenName"
        [label]="'pages.userSettings.userForm.givenName' | translate" />
      <app-common-input
        [control]="userForm.controls.familyName"
        [label]="'pages.userSettings.userForm.familyName' | translate" />

      <!--<app-password-form *ngIf="!editExistingUser" (password)="this.userForm.controls.password.setValue($event)" />-->
      <mat-form-field style="width: 100%">
        <mat-label>{{ 'pages.userSettings.userForm.language' | translate }}</mat-label>
        <mat-select [formControl]="userForm.controls.lang">
          <mat-option *ngFor="let lang of languagesList" [value]="lang.language"> {{ lang.value }}</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-slide-toggle
        *ngIf="loggedInUserIsSysAdmin$ | async"
        [checked]="userForm.controls.systemAdmin.value"
        (change)="userForm.controls.systemAdmin.setValue(!userForm.controls.systemAdmin.value)">
        {{ 'pages.userSettings.userForm.sysAdmin' | translate }}
      </mat-slide-toggle>
    </form>
  `,
})
export class UserFormComponent implements OnInit {
  @Input({ required: true }) data!: {
    givenName: string;
    familyName: string;
    email: string;
    username: string;
    lang: string;
    isSystemAdmin: boolean;
  };
  @Output() afterFormInit = new EventEmitter<UserForm>();

  userForm!: UserForm;

  readonly loggedInUserIsSysAdmin$ = this._store.select(UserSelectors.isSysAdmin);

  readonly allUsers$ = this._userApiService.list().pipe(
    map(response => response.users),
    shareReplay({
      bufferSize: 1,
      refCount: true,
    })
  );

  readonly _existingUserNames$ = this.allUsers$.pipe(
    map(allUsers => allUsers.map(user => user.username.toLowerCase()))
  );
  readonly _existingUserEmails$ = this.allUsers$.pipe(map(allUsers => allUsers.map(user => user.email.toLowerCase())));

  readonly languagesList: StringLiteral[] = AvailableLanguages;

  readonly emailPatternErrorMsg = {
    errorKey: 'pattern',
    message: this._ts.instant('pages.userSettings.userForm.emailValidation'),
  };

  readonly usernamePatternErrorMsg = {
    errorKey: 'pattern',
    message: this._ts.instant('pages.userSettings.userForm.usernameHint'),
  };

  constructor(
    private _fb: FormBuilder,
    private _ts: TranslateService,
    private _store: Store,
    private _userApiService: UserApiService
  ) {}

  ngOnInit() {
    this._buildForm();
    this.afterFormInit.emit(this.userForm);
  }

  private _buildForm(): void {
    this.userForm = this._fb.group({
      givenName: [this.data.givenName, Validators.required],
      familyName: [this.data.familyName, Validators.required],
      email: [
        this.data.email,
        {
          validators: [Validators.required, Validators.pattern(CustomRegex.EMAIL_REGEX)],
          asyncValidators: [existingNamesAsyncValidator(this._existingUserEmails$)],
        },
      ],
      username: [
        this.data.username,
        {
          validators: [Validators.required, Validators.minLength(4), Validators.pattern(CustomRegex.USERNAME_REGEX)],
          asyncValidators: [existingNamesAsyncValidator(this._existingUserNames$)],
        },
      ],
      lang: [this.data.lang],
      systemAdmin: [this.data.isSystemAdmin],
    });
  }
}
