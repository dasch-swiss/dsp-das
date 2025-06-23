import { FormControl, FormGroup } from '@angular/forms';
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
