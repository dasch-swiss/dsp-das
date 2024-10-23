import { checkUnusedENTranslations, compareTranslationFileWithEn } from './translations';

const pluginConfig = (on: Cypress.PluginEvents) => {
  on('task', {
    checkUnusedENTranslations,
    compareTranslationFileWithEn,
  });
};

export default pluginConfig;
