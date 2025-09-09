import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatChipInputEvent, MatChipGrid, MatChipRow, MatChipRemove, MatChipInput } from '@angular/material/chips';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { HumanReadableErrorPipe } from '@dasch-swiss/vre/ui/string-literal';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-chip-list-input',
  template: `
    <mat-form-field style="width: 100%">
      <mat-label>{{ 'ui.chipListInput.keywords' | translate }}</mat-label>
      <mat-chip-grid #chipList [required]="formArray.hasValidator(Validators.required)">
        @for (tag of formArray.value; track trackByFn(index, tag); let index = $index) {
          <mat-chip-row (removed)="removeKeyword(index)">
            {{ tag }}
            <mat-icon matChipRemove>cancel</mat-icon>
          </mat-chip-row>
        }

        <input
          [matChipInputFor]="chipList"
          [matChipInputSeparatorKeyCodes]="separatorKeyCodes"
          [matChipInputAddOnBlur]="true"
          (matChipInputTokenEnd)="addKeyword($event)" />
      </mat-chip-grid>
    </mat-form-field>
    @if (formArray.touched && formArray.errors; as errors) {
      <mat-error>{{ errors | humanReadableError }}</mat-error>
    }
    @if (addChipFormError) {
      <mat-error>New value: {{ addChipFormError | humanReadableError }}</mat-error>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatFormField,
    MatLabel,
    MatChipGrid,
    MatChipRow,
    MatIcon,
    MatChipRemove,
    MatChipInput,
    MatError,
    HumanReadableErrorPipe,
    TranslateModule,
  ],
})
export class ChipListInputComponent {
  @Input({ required: true }) formArray!: FormArray<FormControl<string>>;
  @Input({ required: true }) validators!: ValidatorFn[];

  separatorKeyCodes = [ENTER, COMMA];
  addChipFormError: ValidationErrors | null = null;
  protected readonly Validators = Validators;

  constructor(private _fb: FormBuilder) {}

  addKeyword(event: MatChipInputEvent): void {
    this.addChipFormError = null;
    const input = event.chipInput.inputElement;
    const value = event.value;

    // add keyword
    const newValue = (value || '').trim();
    if (!newValue) return;

    if (this.formArray.value.includes(newValue)) {
      input.value = '';
      return;
    }

    const newFormControl = this._fb.control(value, { nonNullable: true, validators: this.validators });

    if (newFormControl.valid) {
      this.formArray.push(newFormControl);
      input.value = '';
    } else {
      this.addChipFormError = newFormControl.errors;
    }
  }

  removeKeyword(index: number): void {
    this.formArray.removeAt(index);
  }

  trackByFn = (index: number, item: string) => `${index}-${item}`;
}
