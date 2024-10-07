import { TranslationKeyComp, TranslationUsage } from '../../plugins/translations';

describe('Translations', () => {
  before(() => {
    Cypress.env('skipDatabaseCleanup', true);
  });

  it('smoke test: should find template files', () => {
    cy.task<string[]>('templateFiles').then(files => {
      expect(files.length).to.be.greaterThan(0, 'There should be some files found for translation checks');
    });
  });

  it('should have no unused translations', () => {
    cy.task<TranslationUsage>('checkUnusedENTranslations').then(translationKeys => {
      expect(translationKeys.usedKeys.length).to.be.greaterThan(
        0,
        `There should be translation keys in use (${translationKeys.usedKeys.length} satisfies this condition)`
      );
      expect(translationKeys.unusedKeys.length).to.eq(
        0,
        `There should be no unused translation keys. Found ${translationKeys.unusedKeys.length} unused: ${translationKeys.unusedKeys.join(', ')}`
      );
    });
  });

  it('should have the same translation keys in all translation files', () => {
    const translationFiles = ['de.json', 'fr.json', 'it.json', 'rm.json'];
    translationFiles.forEach(file => {
      cy.task('compareTranslationFileWithEn', file).then((keys: TranslationKeyComp) => {
        expect(keys.missingKeys.length).to.eq(
          0,
          `Translation file ${file} is missing keys: ${keys.missingKeys.join(', ')}`
        );
        expect(keys.additionalKeys.length).to.eq(
          0,
          `Translation file ${file} has additional keys: ${keys.additionalKeys.join(', ')}`
        );
      });
    });
  });

  after(() => {
    Cypress.env('skipDatabaseCleanup', false);
  });
});
