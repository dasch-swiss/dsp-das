import { Pipe, PipeTransform } from '@angular/core';
import { StringLiteral } from '@dasch-swiss/dsp-js';
import { LocalizationService } from '@dasch-swiss/vre/shared/app-helper-services';

/**
 * this pipe stringifies an array of StringLiterals.
 * With the parameter 'all', the pipe concats all values and appends the corresponding language in brackets.
 *
 * Otherwise the pipe displays the value corresponding to the passed language which falls back to
 * - the current language selected
 * - the browsers language if matching one of the languages
 * - the first value in the array if no language matches
 */
@Pipe({
  name: 'appStringifyStringLiteral',
})
export class StringifyStringLiteralPipe implements PipeTransform {
  constructor(private localizationService: LocalizationService) {}

  transform(value: StringLiteral[], args: 'single' | 'all' = 'single', language?: string): string | undefined {
    if (args === 'single') {
      const selectedLanguage =
        language || this.localizationService.getCurrentLanguage() || navigator.language.substring(0, 2);
      return value.find(i => i.language === selectedLanguage)?.value || value[0].value;
    } else {
      return value.map(sl => `${sl.value} (${sl.language})`).join(' / ');
    }
  }
}
