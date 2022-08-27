import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-comment-form',
    templateUrl: './comment-form.component.html',
    styleUrls: ['./comment-form.component.scss']
})
export class CommentFormComponent implements OnChanges{

    /**
     * the form control of the comment itself
     */
    @Input() commentFormControl: FormControl;

    /**
     * the form control of the value of the property to which the comment belongs
     */
    @Input() valueFormControl: FormControl;

    /**
     * pass valueFormControl.value to trigger ngOnChanges. (Change detection on the valueFormControl does not always detect value changes)
     */
    @Input() forceUpdate: any;

    /**
     * emitting back the form control
     */
    @Output() commentFormControlChange: EventEmitter<FormControl> = new EventEmitter<FormControl>();

    /**
     * whether the comment field is editable or not
     */
    commentReadOnly = false;

    constructor() { }

    ngOnChanges(changes: SimpleChanges) {
        this.disallowCommentIfEmptyValue();
    }

    /**
     * checks if the value is empty. !this.valueFormControl.value can not be used because this.valueFormControl.value === false is a valid value for boolean values
     */
    isEmptyVal(): boolean {
        return this.valueFormControl.value === null || this.valueFormControl.value === '' || this.valueFormControl.value === undefined;
    }

    /**
     * sets the comment field to readOnly if there is no property value or an invalid property value in the valueFormControl
     */
    disallowCommentIfEmptyValue() {
        this.commentReadOnly = (
            !this.valueFormControl
            || this.isEmptyVal()
            || this.valueFormControl.hasError('pattern')
            || this.valueFormControl.hasError('required'));
    }
}
