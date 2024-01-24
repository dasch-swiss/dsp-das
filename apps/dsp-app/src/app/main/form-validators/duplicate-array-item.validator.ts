import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * duplicateArrayItemValidator: checks for duplicates in control value.
 */
export function duplicateArrayItemValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const items = [...control.value];
    return items.some((item, i) => items.indexOf(item) !== i) ? { duplicateExists: true } : null;
  };
}
