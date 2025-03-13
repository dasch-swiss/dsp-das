import { FormControl, FormGroup } from '@angular/forms';
import { CreateFileValue } from '@dasch-swiss/dsp-js';
import { FormValueArray } from './form-value-array.type';

export interface CreateResourceFormInterface {
  label: FormControl<string>;
  legal: FormGroup<{
    copyrightHolder: FormControl<string | null>;
    license: FormControl<string | null>;
    authorship: FormControl<string | null>;
  }>;
  properties: FormGroup<{ [key: string]: FormValueArray }>;
  file?: FormControl<CreateFileValue | null>;
}
