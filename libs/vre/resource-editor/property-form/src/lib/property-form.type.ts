import { FormControl, FormGroup } from '@angular/forms';
import { MultiLanguageForm } from '@dasch-swiss/vre/ui/string-literal';

export type PropertyForm = FormGroup<{
  propType: FormControl<string>;
  name: FormControl<string>;
  labels: MultiLanguageForm;
  comments: MultiLanguageForm;
  guiAttr: FormControl<string>;
}>;
