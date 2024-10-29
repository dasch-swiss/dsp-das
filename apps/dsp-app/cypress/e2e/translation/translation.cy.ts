import { TranslationKeyComp, TranslationUsage } from '../../plugins/translations';

(Cypress.env('INCLUDE_TRANSLATIONS') ? describe : describe.skip)('Translations', () => {
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
        `There should be no unused translation keys. Found ${translationKeys.unusedKeys.length} unused.\n\nUnused translation keys:\n\n${translationKeys.unusedKeys.join(',\n')}`
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

  it('should have no empty translation strings in en.json', () => {
    cy.readFile('src/assets/i18n/en.json').then(enTranslations => {
      const findEmptyStrings = (obj: any, prefix = ''): string[] => {
        const emptyKeys: string[] = [];
        Object.keys(obj).forEach(key => {
          const value = obj[key];
          const fullKey = prefix ? `${prefix}.${key}` : key;

          if (typeof value === 'object' && value !== null) {
            emptyKeys.push(...findEmptyStrings(value, fullKey));
          } else if (typeof value === 'string' && value.trim() === '') {
            emptyKeys.push(fullKey);
          }
        });
        return emptyKeys;
      };

      const emptyKeys = findEmptyStrings(enTranslations);

      expect(emptyKeys.length).to.eq(
        0,
        `There are empty translation strings in en.json for the following keys:\n\n${emptyKeys.join(',\n')}`
      );
    });
  });

  after(() => {
    Cypress.env('skipDatabaseCleanup', false);
  });
});