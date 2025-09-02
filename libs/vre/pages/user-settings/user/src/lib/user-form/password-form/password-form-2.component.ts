import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-password-form-2',
  template: `
    <app-password-form-field
      [control]="control"
      [placeholder]="'pages.userSettings.passwordForm.oldPassword' | translate" />

    <app-password-form-field [placeholder]="'pages.userSettings.passwordForm.newPassword' | translate" />
  `,
})
export class PasswordForm2Component {
  @Input({ required: true }) control!: FormControl<string | null>;
}
