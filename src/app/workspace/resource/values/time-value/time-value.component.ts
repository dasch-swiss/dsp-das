import { Component, OnInit, OnChanges, OnDestroy, ViewChild, Input, Inject, SimpleChanges } from '@angular/core';
import { TimeInputComponent } from './time-input/time-input.component';
import { ReadTimeValue, CreateTimeValue, UpdateTimeValue } from '@dasch-swiss/dsp-js';
import { FormBuilder } from '@angular/forms';
import { ValueErrorStateMatcher } from '../value-error-state-matcher';
import { BaseValueDirective } from 'src/app/main/directive/base-value.directive';


@Component({
    selector: 'app-time-value',
    templateUrl: './time-value.component.html',
    styleUrls: ['./time-value.component.scss']
})
export class TimeValueComponent extends BaseValueDirective implements OnInit, OnChanges, OnDestroy {

    @ViewChild('timeInput') timeInputComponent: TimeInputComponent;

    @Input() displayValue?: ReadTimeValue;

    customValidators = [];

    matcher = new ValueErrorStateMatcher();

    constructor(@Inject(FormBuilder) protected _fb: FormBuilder) {
        super();
    }

    getInitValue(): string | null {
        if (this.displayValue !== undefined) {
            return this.displayValue.time;
        } else {
            return null;
        }
    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.resetFormControl();
    }

    // unsubscribe when the object is destroyed to prevent memory leaks
    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    getNewValue(): CreateTimeValue | false {
        if (this.mode !== 'create' || !this.form.valid || this.isEmptyVal()) {
            return false;
        }

        const newTimeValue = new CreateTimeValue();

        newTimeValue.time = this.valueFormControl.value;

        if (this.commentFormControl.value !== null && this.commentFormControl.value !== '') {
            newTimeValue.valueHasComment = this.commentFormControl.value;
        }

        return newTimeValue;
    }

    getUpdatedValue(): UpdateTimeValue | false {
        if (this.mode !== 'update' || !this.form.valid) {
            return false;
        }

        const updatedTimeValue = new UpdateTimeValue();

        updatedTimeValue.id = this.displayValue.id;
        updatedTimeValue.time = this.valueFormControl.value;

        // add the submitted comment to updatedTimeValue only if user has added a comment
        if (this.commentFormControl.value !== null && this.commentFormControl.value !== '') {
            updatedTimeValue.valueHasComment = this.commentFormControl.value;
        }

        return updatedTimeValue;
    }

}
