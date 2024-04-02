import { FormArray, FormControl, FormGroup } from '@angular/forms';

type FormValueGroup = FormGroup<{ item: FormControl<any>; comment: FormControl<string | null> }>;
export type FormValueArray = FormArray<FormValueGroup>;
