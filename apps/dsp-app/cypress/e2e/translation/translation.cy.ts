import { TranslationKeyComp, TranslationUsage } from '../../plugins/translations';

describe('Translations', () => {
  before(() => {
    Cypress.env('skipDatabaseCleanup', true);
  });

  it('should have some translations, but no unused translations', () => {
    cy.task<TranslationUsage>('checkUnusedENTranslations').then(translationKeys => {
      expect(translationKeys.usedKeys.length).to.be.greaterThan(
        0,
        `There should be translation keys in use (${translationKeys.usedKeys.length} satisfies this condition)`
      );
      expect(translationKeys.unusedKeys.length).to.eq(
        0,
        `There should be no unused translation keys. Found ${translationKeys.unusedKeys.length} unused.\n\nRemove all unused translations from the translation files (en.json, de.json, ...) by\n"npm run i18n:merge-translations"\n\nor adjust manually:\n\n${translationKeys.unusedKeys.join(',\n')}`
      );
    });
  });

  it('should have all used translation keys defined in en.json', () => {
    cy.task<TranslationUsage>('checkUnusedENTranslations').then(translationKeys => {
      // Load the en.json file
      cy.readFile('src/assets/i18n/en.json').then(enTranslations => {
        const isKeyInObject = (obj: any, key: string): boolean => {
          return key.split('.').reduce((o, k) => (o && o.hasOwnProperty(k) ? o[k] : undefined), obj) !== undefined;
        };

        const missingInEn = translationKeys.usedKeys.filter(key => !isKeyInObject(enTranslations, key));

        expect(missingInEn.length).to.eq(
          0,
          `There are missing translations in en.json for the following keys:\n\n${missingInEn.join(',\n')}`
        );
      });
    });
  });

  it('should have the same translation keys in all translation files', () => {
    const translationFiles = ['de.json', 'fr.json', 'it.json', 'rm.json'];
    translationFiles.forEach(file => {
      cy.task('compareTranslationFileWithEn', file).then((keys: TranslationKeyComp) => {
        expect(keys.missingKeys.length).to.eq(
          0,
          `Translation file ${file} is missing keys:\n ${keys.missingKeys.join(',\n')}`
        );
        expect(keys.additionalKeys.length).to.eq(
          0,
          `Translation file ${file} has additional keys, which are not part of the default lang @en:\n ${keys.additionalKeys.join(',\n')}`
        );
      });
    });
  });

  after(() => {
    Cypress.env('skipDatabaseCleanup', false);
  });
});
