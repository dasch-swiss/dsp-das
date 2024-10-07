import { checkUnusedENTranslations, compareTranslationFileWithEn, templateFiles } from './translations';

const pluginConfig = (on: Cypress.PluginEvents) => {
  on('task', {
    templateFiles,
    checkUnusedENTranslations,
    compareTranslationFileWithEn,
  });
};

export default pluginConfig;
