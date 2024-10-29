import fs = require('fs');
import path = require('path');

export interface TranslationUsage {
  usedKeys: string[];
  unusedKeys: string[];
}

export interface TranslationKeyComp {
  missingKeys: string[];
  additionalKeys: string[];
}

const extractKeys = (obj: any, prefix = ''): Record<string, boolean> =>
  Object.keys(obj).reduce((res, key) => {
    const pre = prefix ? `${prefix}.` : '';
    if (typeof obj[key] === 'object') {
      Object.assign(res, extractKeys(obj[key], pre + key));
    } else {
      res[pre + key] = true;
    }
    return res;
  }, {});

export const checkUnusedENTranslations = (): TranslationUsage => {
  const translationsInUsePath = path.join(__dirname, '../../cypress/fixtures/temp/translations-in-use.json');
  const translationKeysInUse = JSON.parse(fs.readFileSync(translationsInUsePath, 'utf8'));

  const fPath = path.join(__dirname, '../../src/assets/i18n/en.json');
  const translationKeys = JSON.parse(fs.readFileSync(fPath, 'utf8'));
  const translationKeysSet = extractKeys(translationKeys);

  const usedKeys = new Set(Object.keys(translationKeysInUse));

  const allKeys = Object.keys(translationKeysSet);
  const unusedKeys = allKeys.filter(key => !usedKeys.has(key));

  return {
    usedKeys: Array.from(usedKeys),
    unusedKeys,
  };
};

export const compareTranslationFileWithEn = (file: string): TranslationKeyComp => {
  const translationsInUsePath = path.join(__dirname, '../../cypress/fixtures/temp/translations-in-use.json');
  const translationKeysInUse = JSON.parse(fs.readFileSync(translationsInUsePath, 'utf8'));

  const fPath = path.join(__dirname, '../../src/assets/i18n/', file);
  const translationKeys = JSON.parse(fs.readFileSync(fPath, 'utf8'));

  const flatTranslationKeys = extractKeys(translationKeys);
  const usedKeys = Object.keys(translationKeysInUse);

  const missingKeys = usedKeys.filter(key => !Object.keys(flatTranslationKeys).includes(key));
  const additionalKeys = Object.keys(flatTranslationKeys).filter(key => !usedKeys.includes(key));

  return { missingKeys, additionalKeys };
};
