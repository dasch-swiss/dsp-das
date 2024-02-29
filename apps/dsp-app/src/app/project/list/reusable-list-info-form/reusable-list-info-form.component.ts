import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  DEFAULT_MULTILANGUAGE_FORM,
  MultiLanguageFormArray,
  MultiLanguages,
} from '@dasch-swiss/vre/shared/app-string-literal';
import { atLeastOneStringRequired } from '../../../main/form-validators/at-least-one-string-required.validator';

type ListInfoForm = FormGroup<{
  labels: MultiLanguageFormArray;
  comments: MultiLanguageFormArray;
}>;

@Component({
  selector: 'app-reusable-list-info-form',
  template: `
    <dasch-swiss-multi-language-input
      [formArray]="form.controls.labels"
      placeholder="Controlled vocabulary label *"
      data-cy="labels-input">
    </dasch-swiss-multi-language-input>

    <dasch-swiss-multi-language-textarea
      [formArray]="form.controls.comments"
      placeholder="Controlled vocabulary description *"
      data-cy="comments-input">
    </dasch-swiss-multi-language-textarea>
  `,
})
export class ReusableListInfoFormComponent implements OnInit {
  @Input() formData: {
    labels: MultiLanguages;
    comments: MultiLanguages;
  };
  @Output() afterFormInit = new EventEmitter<ListInfoForm>();

  form: ListInfoForm;

  constructor(private _fb: FormBuilder) {}

  ngOnInit() {
    this._buildForm();
    this.afterFormInit.emit(this.form);
  }

  _buildForm() {
    this.form = this._fb.group({
      labels: DEFAULT_MULTILANGUAGE_FORM(
        this.formData.labels,
        [Validators.maxLength(2000)],
        [atLeastOneStringRequired('value')]
      ),
      comments: DEFAULT_MULTILANGUAGE_FORM(
        this.formData.comments,
        [Validators.maxLength(2000)],
        [atLeastOneStringRequired('value')]
      ),
    });
  }
}
