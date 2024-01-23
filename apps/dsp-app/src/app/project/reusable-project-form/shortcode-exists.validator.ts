import { AbstractControl, AsyncValidatorFn, ValidationErrors, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

/**
 * ShortCodeExistsValidator: Validate the forms shortcode value against
 * already existing shortcodes.
 */
export class ShortCodeExistsValidator extends Validators {
  static createValidator(shortcodes$: Observable<string[]>): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return shortcodes$.pipe(
        take(1),
        map(shortcodes => {
          // Check if the shortcode exists in the list of shortcodes
          return shortcodes.includes(control.value) ? { shortcodeExists: true } : null;
        })
      );
    };
  }
}
