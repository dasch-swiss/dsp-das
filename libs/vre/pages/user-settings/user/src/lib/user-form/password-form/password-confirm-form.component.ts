import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CustomRegex } from '@dasch-swiss/vre/shared/app-common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-password-confirm-form',
  template: `
    <app-password-form-field
      [control]="passwordControl"
      [placeholder]="'pages.userSettings.passwordForm.newPassword' | translate"
      [validatorErrors]="passwordValidatorErrors"
      [showToggleVisibility]="true" />

    <app-password-form-field
      [control]="confirmPasswordControl"
      [placeholder]="'pages.userSettings.passwordForm.confirmPassword' | translate"
      [showToggleVisibility]="true" />
  `,
  standalone: false,
})
export class PasswordConfirmFormComponent implements OnInit, OnDestroy {
  @Output() afterFormInit = new EventEmitter<FormControl<string>>();

  passwordControl = this._fb.nonNullable.control('', [
    Validators.required,
    Validators.minLength(8),
    Validators.pattern(CustomRegex.PASSWORD_REGEX),
  ]);
  passwordValidatorErrors = [
    {
      errorKey: 'pattern',
      message: 'Password must contain at least one letter and one number.',
    },
    {
      errorKey: 'passwordMismatch',
      message: 'Passwords do not match.',
    },
  ];

  confirmPasswordControl = this._fb.control('', [Validators.required]);
  subscription!: Subscription;

  constructor(private readonly _fb: FormBuilder) {}

  ngOnInit(): void {
    this.passwordControl.addValidators([this._passwordMatchValidator()]);
    this.afterFormInit.emit(this.passwordControl);

    this.subscription = this.confirmPasswordControl.valueChanges.subscribe(() => {
      this.passwordControl.updateValueAndValidity();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private _passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value;
      const confirmPassword = this.confirmPasswordControl.value;

      if (!confirmPassword || !password) {
        return null;
      }

      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }
}
