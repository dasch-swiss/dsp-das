import { FormControl, FormGroup } from '@angular/forms';
import { StringLiteral } from '@dasch-swiss/dsp-js';

export interface OntologyData {
  name?: string;
  label: string;
  comment: string;
  id?: string;
}

// The CreateOntologyData type has no id and the name is required
export type CreateOntologyData = Omit<OntologyData, 'id' | 'name'> & { name: string };

// The UpdateOntologyData type has a required id and the name is omitted as it is not possible to update
export type UpdateOntologyData = Omit<OntologyData, 'id' | 'name'> & { id: string };

export type OntologyForm = FormGroup<{
  name: FormControl<string>;
  label: FormControl<string>;
  comment: FormControl<string>;
}>;

interface ResourceClassData {
  id?: string;
  name?: string;
  labels: StringLiteral[];
  comments?: StringLiteral[];
}

// The CreateResourceClassData type has no id and the name is required
export type CreateResourceClassData = Omit<ResourceClassData, 'id' | 'name'> & { name: string; subclassOf: string };

// The UpdateResourceClassData type has a required id and the name is omitted as it is not possible to update
export type UpdateResourceClassData = Omit<ResourceClassData, 'id' | 'name'> & { id: string };
