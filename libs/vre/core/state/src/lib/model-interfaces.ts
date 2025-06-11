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
import { PropertyInfoObject } from '@dasch-swiss/vre/shared/app-helper-services';

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

/**
 * contains the information about the assignment of a property to a class
 * */
export interface PropertyAssignment {
  resClass: ClassDefinition;
  property: PropertyInfoObject;
}

export interface OntologyProperties {
  ontology: string;
  properties: PropertyDefinition[];
}

export interface PropToDisplay extends IHasProperty {
  propDef: ResourcePropertyDefinitionWithAllLanguages;
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

export interface IResourceKeyValuePairs {
  [key: string]: {
    attachedUsers: ReadUser[];
    attachedProjects: ReadProject[];
  };
}
