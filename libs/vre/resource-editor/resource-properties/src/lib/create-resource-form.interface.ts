import { FormControl, FormGroup } from '@angular/forms';
import { FormValueArray } from './form-value-array.type';

export type CreateResourceFormLegal = FormGroup<{
  copyrightHolder: FormControl<string | null>;
  license: FormControl<string | null>;
  authorship: FormControl<string | null>;
}>;

export interface CreateResourceFormInterface {
  label: FormControl<string>;
  properties: FormGroup<{ [key: string]: FormValueArray }>;
  file?: FormGroup<{
    link: FormControl<string | null>;
    legal: CreateResourceFormLegal;
  }>;
}
