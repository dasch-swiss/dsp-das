import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { atLeastOneStringRequired } from '@dasch-swiss/vre/shared/app-common';
import { DEFAULT_MULTILANGUAGE_FORM, MultiLanguages } from '@dasch-swiss/vre/ui/string-literal';
import { ListInfoForm } from './list-info-form.type';

@Component({
  selector: 'app-reusable-list-info-form',
  template: `
    <app-multi-language-input
      [formArray]="form.controls.labels"
      placeholder="Controlled vocabulary label"
      [isRequired]="true"
      data-cy="labels-input" />

    <app-multi-language-textarea
      [formArray]="form.controls.comments"
      placeholder="Controlled vocabulary description"
      [isRequired]="true"
      data-cy="comments-input" />
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
