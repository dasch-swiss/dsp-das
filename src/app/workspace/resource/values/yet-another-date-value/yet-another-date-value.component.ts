import { Component, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CreateColorValue, CreateDateValue, KnoraDate, KnoraPeriod, ReadColorValue, ReadDateValue, UpdateColorValue, UpdateDateValue } from '@dasch-swiss/dsp-js';
import { Subscription } from 'rxjs';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { CustomRegex } from '../custom-regex';
import { ValueErrorStateMatcher } from '../value-error-state-matcher';
import { BaseValueDirective } from 'src/app/main/directive/base-value.directive';

// https://stackoverflow.com/questions/45661010/dynamic-nested-reactive-form-expressionchangedafterithasbeencheckederror
const resolvedPromise = Promise.resolve(null);

@Component({
    selector: 'app-yet-another-date-value',
    templateUrl: './yet-another-date-value.component.html',
    styleUrls: ['./yet-another-date-value.component.scss']
})
export class YetAnotherDateValueComponent extends BaseValueDirective implements OnInit, OnChanges, OnDestroy {

    @ViewChild('dateInput') datePickerComponent: DatePickerComponent;

    @Input() displayValue?: ReadDateValue;

    // @Input() showHexCode = false;

    valueFormControl: FormControl;
    commentFormControl: FormControl;
    form: FormGroup;
    valueChangesSubscription: Subscription;
    customValidators = [Validators.pattern(CustomRegex.COLOR_REGEX)];
    matcher = new ValueErrorStateMatcher();
    textColor: string;

    constructor(@Inject(FormBuilder) private _fb: FormBuilder) {
        super();
    }

    getInitValue(): KnoraDate | KnoraPeriod | null {
        if (this.displayValue !== undefined) {
            return this.displayValue.date;
        } else {
            return null;
        }
    }

    ngOnInit() {

        // initialize form control elements
        this.valueFormControl = new FormControl(null);
        this.commentFormControl = new FormControl(null);

        // subscribe to any change on the comment and recheck validity
        this.valueChangesSubscription = this.commentFormControl.valueChanges.subscribe(
            data => {
                this.valueFormControl.updateValueAndValidity();
            }
        );

        this.form = this._fb.group({
            value: this.valueFormControl,
            comment: this.commentFormControl
        });

        this.resetFormControl();

        resolvedPromise.then(() => {
            // add form to the parent form group
            this.addToParentFormGroup(this.formName, this.form);
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.resetFormControl();
    }

    // unsubscribe when the object is destroyed to prevent memory leaks
    ngOnDestroy(): void {
        this.unsubscribeFromValueChanges();

        resolvedPromise.then(() => {
            // remove form from the parent form group
            this.removeFromParentFormGroup(this.formName);
        });
    }

    getNewValue(): CreateDateValue | false {
        if (this.mode !== 'create' || !this.form.valid || this.isEmptyVal()) {
            return false;
        }

        console.warn('get new value', this.valueFormControl.value);

        const newDateValue = new CreateDateValue();

        newDateValue.startDay = this.valueFormControl.value;

        if (this.commentFormControl.value !== null && this.commentFormControl.value !== '') {
            newDateValue.valueHasComment = this.commentFormControl.value;
        }


        return newDateValue;
    }

    getUpdatedValue(): UpdateDateValue | false {
        if (this.mode !== 'update' || !this.form.valid) {
            return false;
        }

        console.warn('get updated value', this.valueFormControl.value);


        let updatedDateValue = new UpdateDateValue();

        updatedDateValue = <UpdateDateValue>this.valueFormControl.value;

        updatedDateValue.id = this.displayValue.id;

        // add the submitted comment to updatedIntValue only if user has added a comment
        if (this.commentFormControl.value !== null && this.commentFormControl.value !== '') {
            updatedDateValue.valueHasComment = this.commentFormControl.value;
        }

        return updatedDateValue;
    }


}
