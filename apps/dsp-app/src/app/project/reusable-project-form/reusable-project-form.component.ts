import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { StringLiteral } from '@dasch-swiss/dsp-js';
import { existingNamesValidator } from '@dsp-app/src/app/main/directive/existing-name/existing-name.directive';
import { arrayLengthGreaterThanZeroValidator } from '@dsp-app/src/app/project/reusable-project-form/array-length-greater-than-zero-validator';
import PROJECT_FORM_CONSTANTS from '@dsp-app/src/app/project/reusable-project-form/reusable-project-form.constants';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reusable-project-form',
  templateUrl: './reusable-project-form.component.html',
})
export class ReusableProjectFormComponent implements OnInit, OnDestroy {
  @Input() formData: {
    shortcode: string;
    shortname: string;
    longname: string;
    description: StringLiteral[];
    keywords: string[];
  };
  @Input() editable: boolean;
  @Input() chipsRequired: boolean;
  @Output() formValueChange = new EventEmitter<FormGroup>();

  form: FormGroup;
  shortcodePatternError = { errorKey: 'pattern', message: 'This field must contains letters from A to F and 0 to 9' };
  subscription: Subscription;

  constructor(private _fb: FormBuilder) {}

  ngOnInit() {
    this.form = this._fb.group({
      shortcode: [
        { value: this.formData.shortcode, disabled: this.formData.shortcode !== '' },
        [
          Validators.required,
          Validators.minLength(PROJECT_FORM_CONSTANTS.shortcodeMinLength),
          Validators.maxLength(PROJECT_FORM_CONSTANTS.shortcodeMaxLength),
          existingNamesValidator(PROJECT_FORM_CONSTANTS.existingShortcodes),
          Validators.pattern(PROJECT_FORM_CONSTANTS.shortcodeRegex),
        ],
      ],
      shortname: [
        { value: this.formData.shortname, disabled: this.formData.shortname !== '' },
        [
          Validators.required,
          Validators.minLength(PROJECT_FORM_CONSTANTS.shortnameMinLength),
          Validators.maxLength(PROJECT_FORM_CONSTANTS.shortnameMaxLength),
          existingNamesValidator(PROJECT_FORM_CONSTANTS.existingShortNames),
          Validators.pattern(PROJECT_FORM_CONSTANTS.shortnameRegex),
        ],
      ],
      longname: [this.formData.longname, [Validators.required]],
      description: [[], arrayLengthGreaterThanZeroValidator()],
      keywords: [[], arrayLengthGreaterThanZeroValidator()],
    });

    this.subscription = this.form.valueChanges.subscribe(z => {
      this.formValueChange.emit(this.form);
    });
  }

  onDescriptionChange(value: StringLiteral[]) {
    this.form.patchValue({ description: value });

    if (this.form.controls.description.untouched && value.length > 0) {
      this.form.controls.description.markAsTouched();
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
