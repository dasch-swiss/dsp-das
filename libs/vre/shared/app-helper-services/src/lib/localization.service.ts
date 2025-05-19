import { registerLocaleData } from '@angular/common';
import de_CH from '@angular/common/locales/de-CH';
import en_GB from '@angular/common/locales/en-GB';
import fr_CH from '@angular/common/locales/fr-CH';
import it_CH from '@angular/common/locales/it-CH';
import { Injectable } from '@angular/core';
import { AvailableLanguages } from '@dasch-swiss/vre/core/config';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'en' | 'fr' | 'de' | 'it';
export type Locale = 'en-GB' | 'fr-CH' | 'de-CH' | 'it-CH';

@Injectable({
  providedIn: 'root',
})
export class LocalizationService {
  private readonly defaultLanguage = 'en';
  private readonly localStorageLanguageKey = 'dsp_language';

  private _locale: any;
  set locale(value: string) {
    this._locale = value;
    this.setLocale(this._locale);
  }

  private _availableLocales = [
    { locale: 'en-GB', localeData: en_GB },
    { locale: 'fr-CH', localeData: fr_CH },
    { locale: 'de-CH', localeData: de_CH },
    { locale: 'it-CH', localeData: it_CH },
  ] as const;

  constructor(private translateService: TranslateService) {}

  init() {
    this.setDefaultLanguage();
    this.locale = 'en-GB';
  }

  getCurrentLanguage(): Language {
    return this.translateService.currentLang
      ? (this.translateService.currentLang as Language)
      : (this.getLanguage() as Language);
  }

  setLanguage(language: string) {
    this.translateService.use(language);
    this.saveLanguageToLocalStorage(language);
  }

  private saveLanguageToLocalStorage(language: string) {
    localStorage.setItem(this.localStorageLanguageKey, JSON.stringify(language));
  }

  private getLanguage(): string {
    const key = localStorage.getItem(this.localStorageLanguageKey);
    return key ? JSON.parse(key) : this.getLanguageFromBrowser();
  }

  private getLanguageFromBrowser(): Language {
    const browserLang = this.translateService.getBrowserLang();
    const availableLanguageExp = AvailableLanguages.map(lang => lang.language).join('|');
    return browserLang?.match(`/${availableLanguageExp}/`)
      ? (browserLang as Language)
      : (this.defaultLanguage as Language);
  }

  private setDefaultLanguage() {
    this.setLanguage(this.getLanguage());
  }

  private setLocale(locale: Locale) {
    let localeItem = this._availableLocales.find(item => item.locale === locale);

    if (!localeItem) {
      localeItem = { locale: 'en-GB', localeData: en_GB };
    }

    registerLocaleData(localeItem.localeData, locale);
    document.documentElement.lang = (localeItem.localeData[0] as string).substr(0, 2);
  }
}
