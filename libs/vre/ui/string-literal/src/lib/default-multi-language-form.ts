import { FormArray, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { StringLiteralV2 } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { DaschLanguage } from './dash-language.type';
import { MultiLanguageForm } from './multilanguage-form.type';

export const DEFAULT_MULTILANGUAGE_FORM = (
  data: StringLiteralV2[],
  controlValidators?: ValidatorFn[],
  arrayValidators?: ValidatorFn[]
) => {
  return new FormArray(
    data.map(
      item =>
        new FormGroup({
          language: new FormControl<DaschLanguage>(item.language as DaschLanguage, { nonNullable: true }),
          value: new FormControl(item.value, { validators: controlValidators, nonNullable: true }),
        })
    ),
    arrayValidators
  ) as MultiLanguageForm;
};
