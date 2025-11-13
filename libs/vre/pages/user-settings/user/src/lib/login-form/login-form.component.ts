import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@dasch-swiss/vre/core/session';
import { finalize, Subscription } from 'rxjs';

@Component({
  selector: 'app-login-form',
  template: `
    <form [formGroup]="form" (ngSubmit)="login()" class="login-form">
      <app-common-input [control]="form.controls.username" label="Username" data-cy="username-input" />

      <app-password-form-field [control]="form.controls.password" [placeholder]="'Password'" data-cy="password-input" />

      <button mat-raised-button appLoadingButton [isLoading]="loading" type="submit" data-cy="submit-button">
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
    `,
  ],
  standalone: false,
})
export class LoginFormComponent implements OnDestroy {
  loading = false;
  form = this._fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  private subscription?: Subscription;

  constructor(
    private _fb: FormBuilder,
    private router: Router,
    private _authService: AuthService
  ) {}

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  login() {
    if (!this.form.valid) {
      return;
    }

    this.loading = true;

    this.subscription = this._authService
      .login$(this.form.controls.username.value, this.form.controls.password.value)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe();
  }
}
