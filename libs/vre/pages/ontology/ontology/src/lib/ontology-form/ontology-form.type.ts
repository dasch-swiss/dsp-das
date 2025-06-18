import { FormControl, FormGroup } from '@angular/forms';

export interface OntologyData {
  name?: string;
  label: string;
  comment: string;
  id?: string;
}

export type CreateOntologyData = Omit<OntologyData, 'id' | 'name'> & { name: string };

export type UpdateOntologyData = Omit<OntologyData, 'id' | 'name'> & { id: string };

export type OntologyForm = FormGroup<{
  name: FormControl<string>;
  label: FormControl<string>;
  comment: FormControl<string>;
}>;
