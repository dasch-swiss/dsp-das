import {
  ClassDefinition,
  IHasProperty,
  OntologyMetadata,
  PropertyDefinition,
  ReadOntology,
  ReadProject,
  ReadUser,
  ResourcePropertyDefinitionWithAllLanguages,
} from '@dasch-swiss/dsp-js';
import { DefaultProperty, PropertyInfoObject } from '@dasch-swiss/vre/shared/app-helper-services';

export interface IKeyValuePairs<T> {
  [key: string]: { value: T[] };
}

export interface IKeyValuePair<T> {
  [key: string]: { value: T };
}

export interface IProjectOntologiesKeyValuePairs {
  [key: string]: {
    ontologiesMetadata: OntologyMetadata[];
    readOntologies: ReadOntology[];
  };
}

export interface OntologyProperties {
  ontology: string;
  properties: PropertyDefinition[];
}

export interface PropToDisplay {
  propDef: ResourcePropertyDefinitionWithAllLanguages;
  propType?: DefaultProperty;
  propObjectLabel?: string;
  propObjectComment?: string;
}

export interface ClassPropToDisplay extends PropToDisplay {
  iHasProperty: IHasProperty;
}

export interface PropToAdd {
  ontologyId: string;
  ontologyLabel: string;
  properties: PropertyInfoObject[];
}

export interface IClassItemsKeyValuePairs {
  [key: string]: {
    ontologyIri: string;
    classItemsCount: number;
  };
}
