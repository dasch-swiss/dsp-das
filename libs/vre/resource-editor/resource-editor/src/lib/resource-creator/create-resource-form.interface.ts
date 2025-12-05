import { FormControl, FormGroup } from '@angular/forms';
import { FileForm } from '../representations';
import { FormValueArray } from '../resource-properties';

export interface CreateResourceFormInterface {
  label: FormControl<string>;
  properties: FormGroup<{ [key: string]: FormValueArray }>;
  file?: FileForm;
}
