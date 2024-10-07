import fs = require('fs');
import { PathOrFileDescriptor } from 'node:fs';
import path = require('path');
import glob = require('glob');

export interface TranslationUsage {
  usedKeys: string[];
  unusedKeys: string[];
}

export interface TranslationKeyComp {
  missingKeys: string[];
  additionalKeys: string[];
}

const templatePattern = '../../src/**/*.html';
const tsPattern = '../../src/**/*.ts';

export const getFiles = (pattern: string): string[] => {
  const absolutePattern = path.resolve(__dirname, pattern);
  return glob.sync(absolutePattern);
};

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

export const templateFiles = (): string[] => {
  return getFiles(templatePattern);
};

export const checkUnusedENTranslations = (): TranslationUsage => {
  const fPath = path.join(__dirname, '../../src/assets/i18n/en.json');
  const translationKeys = JSON.parse(fs.readFileSync(fPath, 'utf8'));

  const usedKeys = new Set<string>();
  const translationKeysSet = extractKeys(translationKeys);

  const searchInFiles = (files: string[]): void => {
    files.forEach((file: PathOrFileDescriptor) => {
      const fileContent = fs.readFileSync(file, 'utf8');

      Object.keys(translationKeysSet).forEach(key => {
        if (fileContent.includes(key)) {
          usedKeys.add(key);
        }
      });
    });
  };

  searchInFiles(getFiles(templatePattern));
  searchInFiles(getFiles(tsPattern));

  const allKeys = Object.keys(translationKeysSet);
  const unusedKeys = allKeys.filter(key => !usedKeys.has(key));

  return {
    usedKeys: Array.from(usedKeys),
    unusedKeys,
  };
};

export const compareTranslationFileWithEn = (file: string): TranslationKeyComp => {
  const fPath = path.join(__dirname, '../../src/assets/i18n/', file);
  const translationKeys = JSON.parse(fs.readFileSync(fPath, 'utf8'));

  const enKeys = JSON.parse(fs.readFileSync(path.join(__dirname, '../../src/assets/i18n/en.json'), 'utf8'));

  const flatTranslationKeys = extractKeys(translationKeys);
  const flatEnKeys = extractKeys(enKeys);

  const missingKeys = Object.keys(flatEnKeys).filter(key => !Object.keys(flatTranslationKeys).includes(key));
  const additionalKeys = Object.keys(flatTranslationKeys).filter(key => !Object.keys(flatEnKeys).includes(key));

  return { missingKeys, additionalKeys };
};
