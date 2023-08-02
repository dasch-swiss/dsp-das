import {Component, Inject, Input, OnChanges, OnDestroy, OnInit} from "@angular/core";
import {BaseValueDirective} from "@dsp-app/src/app/main/directive/base-value.directive";
import {
    CreateUnformattedTextValue,
    ReadUnformattedTextValue,
    UpdateUnformattedTextValue,
} from "@dasch-swiss/dsp-js";
import {FormBuilder} from "@angular/forms";
import {ValueErrorStateMatcher} from "@dsp-app/src/app/workspace/resource/values/value-error-state-matcher";

@Component({
    selector: 'app-unformatted-text-value',
    templateUrl: './unformatted-text-value.component.html',
    styleUrls: ['./unformatted-text-value.component.scss'],
})
export class UnformattedTextValueComponent
    extends BaseValueDirective
    implements OnInit, OnChanges, OnDestroy
{
    @Input() displayValue: ReadUnformattedTextValue;

    matcher = new ValueErrorStateMatcher();
    customValidators = [];

    constructor(@Inject(FormBuilder) protected _fb: FormBuilder) {
        super();
    }

    getInitValue(): string | null {
        if (this.displayValue !== undefined) {
            return this.displayValue.text;
        } else {
            return null;
        }
    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngOnChanges(): void {
        // resets values and validators in form controls when input displayValue or mode changes
        // at the first call of ngOnChanges, form control elements are not initialized yet
        this.resetFormControl();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    getNewValue(): CreateUnformattedTextValue | false {
        if (this.mode !== 'create' || !this.form.valid || this.isEmptyVal()) {
            return false;
        }

        const newTextValue = new CreateUnformattedTextValue();


        newTextValue.text = this.valueFormControl.value;

        if (
            this.commentFormControl.value !== null &&
            this.commentFormControl.value !== ''
        ) {
            newTextValue.valueHasComment = this.commentFormControl.value;
        }

        console.log(newTextValue);
        return newTextValue;
    }

    getUpdatedValue(): UpdateUnformattedTextValue | false {
        if (this.mode !== 'update' || !this.form.valid) {
            return false;
        }

        const updatedTextValue = new UpdateUnformattedTextValue();

        updatedTextValue.id = this.displayValue.id;

        updatedTextValue.text = this.valueFormControl.value;

        if (
            this.commentFormControl.value !== null &&
            this.commentFormControl.value !== ''
        ) {
            updatedTextValue.valueHasComment = this.commentFormControl.value;
        }

        return updatedTextValue;
    }
}
