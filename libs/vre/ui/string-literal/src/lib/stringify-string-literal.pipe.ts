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
    if (!value || value.length === 0) {
      return '';
    }
    if (language === 'all') {
      return value.map(sl => `${sl.value} (${sl.language})`).join(' / ');
    } else {
      const userPreferedLanguage =
        (language as LanguageShort)?.length === 2
          ? (language as LanguageShort)
          : this.localizationService.getCurrentLanguage();
      // passed preferred language
      let translated = value.find(i => i.language === userPreferedLanguage)?.value;
      if (!translated) {
        // if the string literal is not translated in the user preferred language
        translated = value.find(i => i.language === this.localizationService.getLanguageFromBrowser())?.value;
      }
      return translated || value[0].value; // fallback to the first value in the array
    }
  }
}
