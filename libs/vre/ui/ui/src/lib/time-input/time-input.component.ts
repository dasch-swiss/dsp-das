import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { HumanReadableErrorPipe, ValidatorError } from '@dasch-swiss/vre/ui/string-literal';
import { TimeFormatDirective } from './time-format.directive';
import { TimeInputErrorStateMatcher } from './time-input-error-state-matcher';

// TODO this changes segment-dialog
@Component({
  selector: 'app-time-input',
  template: `
    <mat-form-field style="width: 100%">
      <mat-label>{{ label }}</mat-label>
      <input
        matInput
        [errorStateMatcher]="errorStateMatcher"
        [formControl]="control"
        appTimeFormat
        placeholder="hh:mm:ss" />
      @if (control.errors; as errors) {
        <mat-error>
          {{ errors | humanReadableError: possibleErrors }}
        </mat-error>
      }
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    TimeFormatDirective,
    ReactiveFormsModule,
    MatError,
    HumanReadableErrorPipe,
  ],
})
export class TimeInputComponent implements OnInit {
  @Input({ required: true }) control!: FormControl<number | null>;
  @Input({ required: true }) label!: string;

  possibleErrors!: ValidatorError[];
  readonly errorStateMatcher = new TimeInputErrorStateMatcher();

  ngOnInit() {
    this.possibleErrors = [
      {
        errorKey: 'pattern',
        message: 'Please enter a valid time in format hh:mm:ss',
      },
    ];
  }
}
