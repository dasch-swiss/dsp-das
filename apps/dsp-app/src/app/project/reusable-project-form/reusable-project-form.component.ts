import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MultiLanguages } from '@dasch-swiss/vre/shared/app-string-literal';
import { Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { arrayLengthGreaterThanZeroValidator } from './array-length-greater-than-zero-validator';
import { atLeastOneStringRequired } from './at-least-one-string-required.validator';

@Component({
  selector: 'app-reusable-project-form',
  template: `
    <form *ngIf="form" [formGroup]="form">
      <div style="display: flex">
        <app-common-input
          [formGroup]="form"
          controlName="shortcode"
          [placeholder]="'appLabels.form.project.general.shortcode' | translate"
          [validatorErrors]="[shortcodePatternError]"
          style="flex: 1; margin-right: 16px"></app-common-input>

        <app-common-input
          [formGroup]="form"
          controlName="shortname"
          [placeholder]="'appLabels.form.project.general.shortname' | translate"
          style="flex: 1"></app-common-input>
      </div>

      <app-common-input
        [placeholder]="'appLabels.form.project.general.longname' | translate"
        controlName="longname"
        [formGroup]="form"></app-common-input>

      <dasch-swiss-multi-language-textarea
        [placeholder]="('appLabels.form.project.general.description' | translate) + '*'"
        [formGroup]="form"
        controlName="description">
      </dasch-swiss-multi-language-textarea>

      <app-chip-list-input
        [formGroup]="form"
        controlName="keywords"
        [validators]="keywordsValidators"></app-chip-list-input>
    </form>
  `,
})
export class ReusableProjectFormComponent implements OnInit, OnDestroy {
  @Input() formData: {
    shortcode: string;
    shortname: string;
    longname: string;
    description: MultiLanguages;
    keywords: string[];
  };
  @Output() formValueChange = new EventEmitter<FormGroup>();

  form: FormGroup;
  readonly shortcodePatternError = {
    errorKey: 'pattern',
    message: 'This field must contains letters from A to F and 0 to 9',
  };
  readonly keywordsValidators = [Validators.minLength(3), Validators.maxLength(64)];
  subscription: Subscription;

  constructor(private _fb: FormBuilder) {}

  ngOnInit() {
    this._buildForm();

    this.subscription = this.form.valueChanges.pipe(startWith(<FormGroup>null)).subscribe(() => {
      this.formValueChange.emit(this.form);
    });
  }

  private _buildForm() {
    this.form = this._fb.group({
      shortcode: [
        { value: this.formData.shortcode, disabled: this.formData.shortcode !== '' },
        [Validators.required, Validators.minLength(4), Validators.maxLength(4), Validators.pattern(/^[0-9A-Fa-f]+$/)],
      ],
      shortname: [
        { value: this.formData.shortname, disabled: this.formData.shortname !== '' },
        [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z]+\S*$/)],
      ],
      longname: [this.formData.longname, [Validators.required]],
      description: this._fb.array(
        this.formData.description.map(({ language, value }) =>
          this._fb.group({
            language,
            value: [value, [Validators.maxLength(2000)]],
          })
        ),
        atLeastOneStringRequired('value')
      ),
      keywords: this._fb.array(
        this.formData.keywords.map(keyword => {
          return [keyword, this.keywordsValidators];
        }),
        arrayLengthGreaterThanZeroValidator()
      ),
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
