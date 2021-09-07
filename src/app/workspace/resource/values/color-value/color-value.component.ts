import { Component, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CreateColorValue, ReadColorValue, UpdateColorValue } from '@dasch-swiss/dsp-js';
import { Subscription } from 'rxjs';
import { ColorPickerComponent } from './color-picker/color-picker.component';
import { CustomRegex } from '../custom-regex';
import { ValueErrorStateMatcher } from '../value-error-state-matcher';
import { BaseValueDirective } from 'src/app/main/directive/base-value.directive';

// https://stackoverflow.com/questions/45661010/dynamic-nested-reactive-form-expressionchangedafterithasbeencheckederror
const resolvedPromise = Promise.resolve(null);

@Component({
    selector: 'app-color-value',
    templateUrl: './color-value.component.html',
    styleUrls: ['./color-value.component.scss']
})
export class ColorValueComponent extends BaseValueDirective implements OnInit, OnChanges, OnDestroy {

    @ViewChild('colorInput') colorPickerComponent: ColorPickerComponent;

    @Input() displayValue?: ReadColorValue;

    @Input() showHexCode = false;

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

    getInitValue(): string | null {
        if (this.displayValue !== undefined) {
            return this.displayValue.color;
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

        this.textColor = this.getTextColor(this.valueFormControl.value);

        resolvedPromise.then(() => {
            // add form to the parent form group
            this.addToParentFormGroup(this.formName, this.form);
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.resetFormControl();

        if (this.showHexCode && this.valueFormControl !== undefined) {
            this.textColor = this.getTextColor(this.valueFormControl.value);
        }
    }

    // unsubscribe when the object is destroyed to prevent memory leaks
    ngOnDestroy(): void {
        this.unsubscribeFromValueChanges();

        resolvedPromise.then(() => {
            // remove form from the parent form group
            this.removeFromParentFormGroup(this.formName);
        });
    }

    getNewValue(): CreateColorValue | false {
        if (this.mode !== 'create' || !this.form.valid || this.isEmptyVal()) {
            return false;
        }

        const newColorValue = new CreateColorValue();

        newColorValue.color = this.valueFormControl.value;

        if (this.commentFormControl.value !== null && this.commentFormControl.value !== '') {
            newColorValue.valueHasComment = this.commentFormControl.value;
        }


        return newColorValue;
    }

    getUpdatedValue(): UpdateColorValue | false {
        if (this.mode !== 'update' || !this.form.valid) {
            return false;
        }

        const updatedColorValue = new UpdateColorValue();

        updatedColorValue.id = this.displayValue.id;

        updatedColorValue.color = this.valueFormControl.value;

        // add the submitted comment to updatedIntValue only if user has added a comment
        if (this.commentFormControl.value !== null && this.commentFormControl.value !== '') {
            updatedColorValue.valueHasComment = this.commentFormControl.value;
        }

        return updatedColorValue;
    }

    // calculate text color
    getTextColor(hex: string): string {
        if (!hex || hex === null) {
            return;
        }

        // convert hexadicemal color value into rgb color value
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        const rgb: {r: number; g: number; b: number} = result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;

        // calculate luminance
        const a = [rgb.r, rgb.g, rgb.b].map(function (v) {
            v /= 255;
            return v <= 0.03928
                ? v / 12.92
                : Math.pow( (v + 0.055) / 1.055, 2.4 );
        });
        const luminance = a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;

        return ((luminance > 0.179) ? '#000000' : '#ffffff');
    }

}
