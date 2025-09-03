import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-password-form-2',
  template: `
    <app-password-form-field
      [control]="control"
      [placeholder]="'pages.userSettings.passwordForm.oldPassword' | translate" />

    <app-password-form-field
      [control]="confirmPasswordControl"
      [placeholder]="'pages.userSettings.passwordForm.newPassword' | translate"
      [validatorErrors]="passwordValidatorErrors" />
  `,
})
export class PasswordForm2Component implements OnInit, OnDestroy {
  @Input({ required: true }) control!: FormControl<string | null>;

  confirmPasswordControl = new FormControl<string | null>(null);
  passwordValidatorErrors = [{ errorKey: 'passwordMismatch', message: 'Passwords do not match' }];
  subscription!: Subscription;

  ngOnInit(): void {
    this.confirmPasswordControl.setValidators([this.passwordMatchValidator()]);

    this.subscription = this.control.valueChanges.subscribe(() => {
      this.confirmPasswordControl.updateValueAndValidity();
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const confirmPassword = control.value;
      const password = this.control?.value;

      if (!confirmPassword || !password) {
        return null;
      }

      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }
}
