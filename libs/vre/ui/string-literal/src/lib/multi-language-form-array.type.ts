import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { DaschLanguage } from './dash-language.type';

export type MultiLanguageFormControl = FormGroup<{
  language: FormControl<DaschLanguage>;
  value: FormControl<string>;
}>;

export type MultiLanguageFormArray = FormArray<MultiLanguageFormControl>;
