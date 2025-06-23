import { FormControl, FormGroup } from '@angular/forms';
import { StringLiteral } from '@dasch-swiss/dsp-js';

export interface CreateOntologyData {
  name: string;
  label: string;
  comment: string;
}

export interface UpdateOntologyData {
  id: string;
  label: string;
  comment: string;
}

export type OntologyForm = FormGroup<{
  name: FormControl<string>;
  label: FormControl<string>;
  comment: FormControl<string>;
}>;
