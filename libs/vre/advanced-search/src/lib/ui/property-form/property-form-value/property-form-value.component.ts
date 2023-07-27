import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Constants } from '@dasch-swiss/dsp-js';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatSelectModule } from '@angular/material/select';
import {
    FormControl,
    FormsModule,
    ReactiveFormsModule,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { PropertyFormLinkValueComponent } from '../property-form-link-value/property-form-link-value.component';
import { MatButtonModule } from '@angular/material/button';
import { ErrorStateMatcher } from '@angular/material/core';
@Component({
    selector: 'dasch-swiss-property-form-value',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatInputModule,
        MatMenuModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule,
        PropertyFormLinkValueComponent,
    ],
    templateUrl: './property-form-value.component.html',
    styleUrls: ['./property-form-value.component.scss'],
})
export class PropertyFormValueComponent implements OnInit {
    @Input() objectType: string | undefined = '';

    @Output() emitValueChanged = new EventEmitter<string>();

    private valueChangedSubject = new Subject<string>();

    constants = Constants;

    matcher = new ValueErrorStateMatcher();
    inputControl = new FormControl();

    constructor() {
        // this.valueChangedSubject
        //     .pipe(debounceTime(300))
        //     .subscribe((value) => this.emitValueChanged.emit(value));
    }

    ngOnInit() {
        this.inputControl.valueChanges
            .pipe(debounceTime(300), distinctUntilChanged())
            .subscribe((value) => {
                this._emitValueChanged(value);
            });

        this.inputControl.setValidators(this._getValidators(this.objectType));
    }

    private _getValidators(objectType: string | undefined): ValidatorFn[] {
        const validators: ValidatorFn[] = [];

        switch (objectType) {
            case Constants.DecimalValue:
                validators.push(Validators.pattern(CustomRegex.DECIMAL_REGEX));
                break;

            case Constants.IntValue:
                validators.push(Validators.pattern(CustomRegex.INT_REGEX));
                break;

            case Constants.UriValue:
                validators.push(Validators.pattern(CustomRegex.URI_REGEX));
                break;
        }

        return validators;
    }

    private _emitValueChanged(value: string) {
        if (this.inputControl.valid && value)
            this.emitValueChanged.emit(value.toString());
        else this.emitValueChanged.emit(undefined);
    }

    // the problem with this is that it's very hard to handle validation
    handleInputChanged(event: any) {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement) {
            this.valueChangedSubject.next(inputElement.value);
        } else {
            this.emitValueChanged.emit(event.value);
        }
    }
}

class ValueErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null): boolean {
        if (!control) {
            return false;
        }
        return control && control.invalid && (control.dirty || control.touched);
    }
}

class CustomRegex {
    public static readonly INT_REGEX = /^-?\d+$/;

    public static readonly DECIMAL_REGEX = /^[-+]?[0-9]*\.?[0-9]*$/;

    public static readonly URI_REGEX =
        /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,63}(:[0-9]{1,5})?(\/.*)?$/;
}
