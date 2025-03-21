import { FormControl, FormGroup } from '@angular/forms';
import { FormValueArray } from './form-value-array.type';

export interface CreateResourceFormInterface {
  label: FormControl<string>;
  properties: FormGroup<{ [key: string]: FormValueArray }>;
  file?: FormGroup<{
    link: FormControl<string | null>;
    legal: FormGroup<{
      copyrightHolder: FormControl<string | null>;
      license: FormControl<string | null>;
      authorship: FormControl<string | null>;
    }>;
  }>;
}
