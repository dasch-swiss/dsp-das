import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-common-textarea',
  template: `
    <mat-form-field class="large-field">
      <textarea
        [placeholder]="label"
        [formControl]="control"
        (ngModelChange)="onInputChange($event)"
        matInput
        [cdkTextareaAutosize]="true"
        [cdkAutosizeMinRows]="6"
        [cdkAutosizeMaxRows]="12">
      </textarea>
      <mat-error *ngIf="control?.errors as errors">
        {{ errors | humanReadableError: validatorErrors }}
      </mat-error>
    </mat-form-field>
  `,
  styles: [':host { display: block;}'],
})
export class CommonTextareaComponent {
  @Input({ required: true }) control: FormControl<string | number>;
  @Input({ required: true }) label: string;
  @Input() validatorErrors: { errorKey: string; message: string }[] | null = null;

  onInputChange(newText: string) {
    if ((this.control.defaultValue ?? '') !== newText) {
      this.control.markAsDirty();
    } else {
      this.control.markAsPristine();
    }
  }
}
