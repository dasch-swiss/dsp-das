import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-common-input',
  template: `
    <mat-form-field style="width: 100%">
      <mat-icon matIconPrefix *ngIf="prefixIcon">{{ prefixIcon }}</mat-icon>
      <input matInput [placeholder]="placeholder" [formControl]="formControl" />
      <mat-error *ngIf="formControl.errors as errors">
        {{ errors | humanReadableError: validatorErrors }}
      </mat-error>
    </mat-form-field>
  `,
  styles: [':host { display: block;}'],
})
export class CommonInputComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() placeholder: string;
  @Input() prefixIcon: string | null = null;
  @Input() validatorErrors: { errorKey: string; message: string }[] | null = null;

  get formControl() {
    return this.formGroup.controls[this.controlName] as FormControl;
  }

  protected readonly FormGroup = FormGroup;

  ngOnInit() {
    console.log('asdfsz', this.prefixIcon);
  }
}
