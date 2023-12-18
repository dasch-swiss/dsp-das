import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-common-input',
    template: `
        <mat-form-field style='width: 100%'>
            <input matInput [placeholder]='placeholder' [formControl]='formControl' />
            <mat-error *ngIf='formGroup.controls[controlName].errors as errors'>
                {{ errors | humanReadableError: validatorErrors }}
            </mat-error>
        </mat-form-field>
    `,
})
export class CommonInputComponent {
    @Input() formGroup: FormGroup;
    @Input() placeholder: string;
    @Input() controlName: string;
    @Input() validatorErrors: {errorKey: string, message: string}[] | null = null;

    get formControl() {
        return this.formGroup.controls[this.controlName] as FormControl;
    }

    protected readonly FormGroup = FormGroup;
}
