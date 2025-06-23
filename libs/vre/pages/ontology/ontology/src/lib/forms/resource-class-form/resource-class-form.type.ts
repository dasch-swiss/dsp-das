import { FormControl, FormGroup } from '@angular/forms';
import { StringLiteral } from '@dasch-swiss/dsp-js';
import { MultiLanguageFormArray, MultiLanguages } from '@dasch-swiss/vre/ui/string-literal';

export type ResourceClassForm = FormGroup<{
  name: FormControl<string>;
  labels: MultiLanguageFormArray;
  comments: MultiLanguageFormArray;
}>;

export interface ResourceClassFormData {
  name: string;
  labels: MultiLanguages;
  comments: MultiLanguages;
}

export interface CreateResourceClassData {
  name: string;
  labels: StringLiteral[];
  comments?: StringLiteral[];
  subclassOf: string;
}

export interface UpdateResourceClassData {
  id: string;
  labels: StringLiteral[];
  comments?: StringLiteral[];
}
