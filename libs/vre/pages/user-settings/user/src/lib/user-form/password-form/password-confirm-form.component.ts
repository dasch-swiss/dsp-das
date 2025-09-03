import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CustomRegex } from '@dasch-swiss/vre/shared/app-common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-password-confirm-form',
  template: `
    <app-password-form-field
      [control]="formControl"
      [placeholder]="'pages.userSettings.passwordForm.newPassword' | translate" />

    <app-password-form-field
      [control]="confirmPasswordControl"
      [placeholder]="'pages.userSettings.passwordForm.confirmPassword' | translate"
      [validatorErrors]="passwordValidatorErrors" />
  `,
})
export class PasswordConfirmFormComponent implements OnInit, OnDestroy {
  @Output() afterFormInit = new EventEmitter<FormControl<string>>();

  formControl = this._fb.nonNullable.control('', [
    Validators.required,
    Validators.minLength(8),
    Validators.pattern(CustomRegex.PASSWORD_REGEX),
  ]);

  confirmPasswordControl = this._fb.control('', [Validators.required]);
  passwordValidatorErrors = [{ errorKey: 'passwordMismatch', message: 'Passwords do not match.' }];
  subscription!: Subscription;

  constructor(private _fb: FormBuilder) {}

  ngOnInit(): void {
    this.afterFormInit.emit(this.formControl);
    this.confirmPasswordControl.addValidators([this.passwordMatchValidator()]);

    this.subscription = this.formControl.valueChanges.subscribe(() => {
      this.confirmPasswordControl.updateValueAndValidity();
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const confirmPassword = control.value;
      const password = this.formControl.value;

      if (!confirmPassword || !password) {
        return null;
      }

      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }
}
