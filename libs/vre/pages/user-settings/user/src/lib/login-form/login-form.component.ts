import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@dasch-swiss/vre/core/session';
import { finalize, Subscription, takeLast, tap } from 'rxjs';

@Component({
    selector: 'app-login-form',
    template: `
    <form [formGroup]="form" (ngSubmit)="login()" class="login-form">
      <app-common-input [control]="form.controls.username" label="Username" data-cy="username-input" />

      <app-password-form-field [control]="form.controls.password" [placeholder]="'Password'" data-cy="password-input" />

      <button
        [class.mat-primary]="!isLoginError"
        [class.mat-warn]="isLoginError"
        mat-raised-button
        appLoadingButton
        [isLoading]="loading"
        type="submit"
        data-cy="submit-button">
        {{ isLoginError ? ('ui.form.action.retry' | translate) : ('pages.userSettings.loginForm.login' | translate) }}
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
    `,
    ],
    standalone: false
})
export class LoginFormComponent implements OnInit, OnDestroy {
  loading = false;
  form = this._fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });
  isLoginError: boolean;
  returnUrl: string;

  private subscription: Subscription;

  constructor(
    private _fb: FormBuilder,
    private router: Router,
    private _authService: AuthService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit() {
    this.returnUrl = this.getReturnUrl();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  login() {
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.isLoginError = false;

    this.subscription = this._authService
      .login$(this.form.get('username').value, this.form.get('password').value)
      .pipe(
        takeLast(1),
        tap({
          error: () => {
            this.isLoginError = true;
          },
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(() => {
        if (this.returnUrl) {
          this.router.navigate([this.returnUrl]);
        }
      });
  }

  private getReturnUrl(): string {
    const returnUrlParameterName = 'returnUrl';
    const returnUrl = this.route.snapshot.queryParams[returnUrlParameterName];
    this.location.go(this.removeParameterFromUrl(this.location.path(), returnUrlParameterName, returnUrl));
    return returnUrl;
  }

  private removeParameterFromUrl(path: string, parameterName: string, parameterValue: string): string {
    const urlSegments = path.split('?');
    const queryString = urlSegments.pop();
    if (!queryString) {
      return path;
    }
    const params = queryString.split('&');
    const newQuerystring = params
      .filter(item => item !== `${parameterName}=${encodeURIComponent(parameterValue)}`)
      .join('&');

    if (newQuerystring) {
      urlSegments.push(newQuerystring);
    }

    return urlSegments.join('?');
  }
}
