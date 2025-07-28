import { Pipe, PipeTransform } from '@angular/core';
import { StringLiteral } from '@dasch-swiss/dsp-js';
import { LanguageShort } from '@dasch-swiss/vre/core/config';
import { LocalizationService } from '@dasch-swiss/vre/shared/app-helper-services';

/**
 * this pipe stringifies an array of StringLiterals.
 * With the value 'all', the pipe concatenates all values and appends the corresponding language in brackets.
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

  transform(value: StringLiteral[], language?: string | 'all' | null): string {
    if (language === 'all') {
      return value.map(sl => `${sl.value} (${sl.language})`).join(' / ');
    } else {
      const selectedLanguage =
        (language as LanguageShort)?.length === 2
          ? (language as LanguageShort)
          : this.localizationService.getCurrentLanguage() || navigator.language.substring(0, 2);
      return value.find(i => i.language === selectedLanguage)?.value || value[0].value;
    }
  }
}
