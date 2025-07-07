import { Constants, ResourceClassDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';

export function getClassesToDisplayHelper(
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
