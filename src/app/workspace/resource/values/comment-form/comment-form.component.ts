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
     * pass valueFormControls value to trigger ngOnChanges. (Change detection on the valueFormControl does not always detect value changes)
     */
    @Input() forceUpdate: any;

    /**
     * emitting back the form control
     */
    @Output() commentFormControlChange: EventEmitter<FormControl> = new EventEmitter<FormControl>();

    /**
     * emitting back if the whole form needs revalidation
     */
    @Output() triggerRevalidation: EventEmitter<any> = new EventEmitter<any>();

    /**
     * whether the comment field is editable or not
     */
    disallowed = false;

    constructor() { }

    ngOnChanges(changes: SimpleChanges) {
        this.disallowCommentIfEmptyValue();
    }

    onInputChange(){
        this.triggerRevalidation.emit(this.commentFormControl.value);
    }

    /**
     * checks if the value is empty. !this.valueFormControl.value can not be used because this.valueFormControl.value === false is a valid value for boolean values
     */
    isEmptyVal(): boolean {
        return this.valueFormControl.value === null || this.valueFormControl.value === '' || this.valueFormControl.value === undefined;
    }

    /**
     * checks the comment field to readOnly if there is no property value or an invalid property value in the valueFormControl
     */
    hasError() {
        return this.valueFormControl.hasError('pattern') || this.valueFormControl.hasError('required');
    }

    /**
     * sets the comment field to readOnly if there is no property value or an invalid property value in the valueFormControl
     */
    disallowCommentIfEmptyValue() {
        this.disallowed = this.isEmptyVal() || this.hasError();
    }
}
