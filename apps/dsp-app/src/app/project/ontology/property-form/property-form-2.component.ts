import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { PropertyInfoObject } from '@dasch-swiss/vre/shared/app-helper-services';
import { Subscription } from 'rxjs';

type MULTIFORM_LANGUAGES = 'de' | 'fr' | 'it' | 'en' | 'rm';
export type MultiLanguageForm = FormArray<
  FormGroup<{
    language: FormControl<MULTIFORM_LANGUAGES>;
    value: FormControl<string>;
  }>
>;
export const DEFAULT_MULTILANGUAGE_FORM = (validators?: ValidatorFn[]) => {
  return new FormArray([
    new FormGroup({
      language: new FormControl<MULTIFORM_LANGUAGES>('de'),
      value: new FormControl('', { validators }),
    }),
  ]);
};

export type PropertyForm = FormGroup<{
  name: FormControl<string>;
  labels: MultiLanguageForm;
  comments: MultiLanguageForm;
}>;

@Component({
  selector: 'app-property-form-2',
  template: ` <form [formGroup]="form">
    <app-common-input
      placeholder="Property name *"
      prefixIcon="fingerprint"
      [formGroup]="form"
      controlName="name"></app-common-input>
    <dasch-swiss-multi-language-input
      [formGroup]="form"
      controlName="labels"
      placeholder="Property label*"></dasch-swiss-multi-language-input>
    <dasch-swiss-multi-language-textarea
      [formGroup]="form"
      controlName="comments"
      placeholder="Comment"></dasch-swiss-multi-language-textarea>
  </form>`,
})
export class PropertyForm2Component implements OnInit, OnDestroy {
  @Input() formData: { properties: PropertyInfoObject[] };
  @Output() formValueChange = new EventEmitter<PropertyForm>();

  subscription: Subscription;
  form: PropertyForm = this._fb.group({
    name: null as string,
    labels: DEFAULT_MULTILANGUAGE_FORM(),
    comments: DEFAULT_MULTILANGUAGE_FORM(),
  });

  ngOnInit() {
    this.subscription = this.form.valueChanges.subscribe(() => {
      this.formValueChange.emit(this.form);
    });
    this.formValueChange.emit(this.form);
  }

  constructor(private _fb: FormBuilder) {}

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
