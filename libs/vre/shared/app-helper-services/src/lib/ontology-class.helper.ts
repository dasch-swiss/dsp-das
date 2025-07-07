import { Constants, ResourceClassDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';

export class OntologyClassHelper {
  static GetClassesToDisplay(
    resClasses: ResourceClassDefinitionWithAllLanguages[]
  ): ResourceClassDefinitionWithAllLanguages[] {
    const classesToDisplay: ResourceClassDefinitionWithAllLanguages[] = [];
    resClasses.forEach(resClass => {
      if (resClass.subClassOf.length) {
        const splittedSubClass = resClass.subClassOf[0].split('#');
        if (!splittedSubClass[0].includes(Constants.StandoffOntology) && !splittedSubClass[1].includes('Standoff')) {
          classesToDisplay.push(resClass);
        }
      }
    });

    return classesToDisplay;
  }

  static getClassLabelByLanguage(resourceClass: ResourceClassDefinitionWithAllLanguages, language: string) {
    const preferedLangLabel = resourceClass.labels.find(l => l.language === language);
    return preferedLangLabel?.value || resourceClass.label || '';
  }
}
