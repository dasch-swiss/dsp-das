import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { existingNamesValidator } from '@dsp-app/src/app/main/directive/existing-name/existing-name.directive';
import PROJECT_FORM_CONSTANTS from '@dsp-app/src/app/project/reusable-project-form/reusable-project-form.constants';
import { StringLiteral } from '@dasch-swiss/dsp-js';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import {
    arrayLengthGreaterThanZeroValidator
} from '@dsp-app/src/app/project/reusable-project-form/array-length-greater-than-zero-validator';

@Component({
    selector: 'app-reusable-project-form',
    templateUrl: './reusable-project-form.component.html',
})
export class ReusableProjectFormComponent implements OnInit {

    @Input() formData: { shortname: string, longname: string, shortcode: string, description: StringLiteral[] };
    @Input() editable: boolean;
    @Input() chipsRequired: boolean;
    @Output() formValueChange = new EventEmitter<FormGroup>();
    form: FormGroup;



    constructor(
        private _fb: FormBuilder) {
    }

    ngOnInit() {
        this.form = this._fb.group({
            shortname: [this.formData.shortname,
                [
                    Validators.required,
                    Validators.minLength(PROJECT_FORM_CONSTANTS.shortnameMinLength),
                    Validators.maxLength(PROJECT_FORM_CONSTANTS.shortnameMaxLength),
                    existingNamesValidator(PROJECT_FORM_CONSTANTS.existingShortNames),
                    Validators.pattern(PROJECT_FORM_CONSTANTS.shortnameRegex),
                ]],
            longname: [this.formData.longname,
                [Validators.required]],
            shortcode: [this.formData.shortcode, [
                Validators.required,
                Validators.minLength(PROJECT_FORM_CONSTANTS.shortcodeMinLength),
                Validators.maxLength(PROJECT_FORM_CONSTANTS.shortcodeMaxLength),
                existingNamesValidator(PROJECT_FORM_CONSTANTS.existingShortcodes),
                Validators.pattern(PROJECT_FORM_CONSTANTS.shortcodeRegex),
            ]],
            description: [[], arrayLengthGreaterThanZeroValidator()],
            logo:
                [''],
            keywords: new UntypedFormControl({
                // must be empty (even in edit mode), because of the mat-chip-list
                value: [],
                disabled: false,
            }),
        });

        this.form.valueChanges.subscribe(() => {
            this.formValueChange.emit(this.form);
        });
    }

}
