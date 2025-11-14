import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiResponseError, KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { AuthService } from '@dasch-swiss/vre/core/session';
import { TranslateService } from '@ngx-translate/core';
import { finalize, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-login-form',
  template: `
    <form [formGroup]="form" (ngSubmit)="login()" class="login-form">
      <app-common-input [control]="form.controls.username" label="Username" data-cy="username-input" />

      <app-password-form-field [control]="form.controls.password" [placeholder]="'Password'" data-cy="password-input" />

      @if (loginError) {
        <div class="login-error">{{ loginError }}</div>
      }

      <button
        mat-raised-button
        color="primary"
        appLoadingButton
        [isLoading]="loading"
        type="submit"
        data-cy="submit-button">
        {{ 'pages.userSettings.loginForm.login' | translate }}
      </button>
    </form>
  `,
  styles: [
    `
      .login-form {
        display: flex;
        flex-direction: column;
        padding: 16px;
      }

      .login-error {
        color: #e11d48;
        font-size: 12px;
        margin-top: 4px;
        margin-bottom: 8px;
      }
    `,
  ],
  standalone: false,
})
export class LoginFormComponent implements OnInit, OnDestroy {
  loading = false;
  loginError: string | null = null;
  readonly form = this._fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  private loginSubscription?: Subscription;
  private formSubscription?: Subscription;

  constructor(
    private _fb: FormBuilder,
    private _authService: AuthService,
    private _translateService: TranslateService,
    @Inject(DspApiConnectionToken)
    private readonly _dspApiConnection: KnoraApiConnection
  ) {}

  ngOnInit(): void {
    // Clear error when user starts typing
    this.formSubscription = this.form.valueChanges.subscribe(() => {
      this.loginError = null;
    });
  }

  ngOnDestroy(): void {
    this.loginSubscription?.unsubscribe();
    this.formSubscription?.unsubscribe();
  }

  login() {
    if (!this.form.valid) {
      return;
    }

    this.loading = true;
    this.loginError = null;

    this.loginSubscription = this.login$(this.form.controls.username.value, this.form.controls.password.value)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        error: error => {
          if ((error instanceof ApiResponseError && error.status === 400) || error.status === 401) {
            this.loginError = this._translateService.instant('core.auth.invalidCredentials');
          }
        },
      });
  }

  /**
   * Login user
   * @param identifier can be the email or the username
   * @param password the password of the user
   */
  login$(identifier: string, password: string) {
    const identifierType = identifier.indexOf('@') > -1 ? 'email' : 'username';
    return this._dspApiConnection.v2.auth
      .login(identifierType, identifier, password)
      .pipe(
        switchMap(response => this._authService.afterSuccessfulLogin$(response.body.token, identifier, identifierType))
      );
  }
}
