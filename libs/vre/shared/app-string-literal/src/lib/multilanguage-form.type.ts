import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MULTIFORM_LANGUAGES } from './multiform-languages.type';

export type MultiLanguageForm = FormArray<
  FormGroup<{
    language: FormControl<MULTIFORM_LANGUAGES>;
    value: FormControl<string>;
  }>
>;
