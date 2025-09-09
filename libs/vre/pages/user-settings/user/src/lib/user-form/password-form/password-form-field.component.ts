import { Component, Input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatSuffix, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { HumanReadableErrorPipe } from '@dasch-swiss/vre/ui/string-literal';

@Component({
  selector: 'app-password-form-field',
  template: ` <mat-form-field style="width: 100%">
    <input
      matInput
      [type]="showPassword ? 'text' : 'password'"
      [formControl]="control"
      autocomplete="current-password" />
    <mat-label>{{ placeholder }}</mat-label>

    @if (showToggleVisibility) {
      <button type="button" matSuffix mat-icon-button class="input-icon" (click)="showPassword = !showPassword">
        <mat-icon> {{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
      </button>
    }

    @if (control.errors; as errors) {
      <mat-error>{{ errors | humanReadableError: validatorErrors }}</mat-error>
    }
  </mat-form-field>`,
  standalone: true,
  imports: [
    MatFormField,
    MatInput,
    FormsModule,
    ReactiveFormsModule,
    MatLabel,
    MatIconButton,
    MatSuffix,
    MatIcon,
    MatError,
    HumanReadableErrorPipe,
  ],
})
export class PasswordFormFieldComponent {
  @Input({ required: true }) control!: FormControl<string | null>;
  @Input({ required: true }) placeholder!: string;
  @Input() showToggleVisibility = false;
  @Input() validatorErrors: { errorKey: string; message: string }[] | null = null;

  showPassword = false;
}
