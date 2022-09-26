import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ControlContainer, FormControl, FormGroupDirective } from '@angular/forms';

@Component({
    selector: 'app-comment-form',
    templateUrl: './comment-form.component.html',
    styleUrls: ['./comment-form.component.scss'],
    viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }]
})
export class CommentFormComponent implements OnChanges {

    /**
     * the form control of the comment itself
     */
    @Input() commentFormControl: FormControl;

    /**
     * whether the valueFormControl has an error or not
     */
    @Input() valueFormControlHasError = false;

    /**
     * the valueFormControls value to which the comment belongs
     */
    @Input() valueFormControlValue: any;

    /**
     * emitting back the form control
     */
    @Output() commentFormControlChange: EventEmitter<FormControl> = new EventEmitter<FormControl>();

    /**
     * whether the comment field is editable or not
     */
    disallowed = false;

    constructor() { }

    ngOnChanges() {
        this.disallowCommentIfEmptyValue();
    }

    /**
     * checks if the value is empty. !this.valueFormControl.value can not be used because this.valueFormControl.value === false is a valid value for boolean values
     */
    isEmptyVal(): boolean {
        return this.valueFormControlValue === null || this.valueFormControlValue === '' || this.valueFormControlValue === undefined;
    }

    /**
     * sets the comment field to readOnly if there is no property value or an invalid property value in the valueFormControl
     */
    disallowCommentIfEmptyValue() {
        this.disallowed = this.isEmptyVal() || this.valueFormControlHasError;
    }
}
