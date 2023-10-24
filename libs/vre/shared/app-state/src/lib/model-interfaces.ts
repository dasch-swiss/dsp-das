import { ClassDefinition, IHasProperty, OntologyMetadata, ReadOntology, PropertyDefinition, ResourcePropertyDefinitionWithAllLanguages, ResourcePropertyDefinition } from "@dasch-swiss/dsp-js";
import { EntityDefinition } from "@dasch-swiss/dsp-js/src/models/v2/ontologies/EntityDefinition";
import { PropertyInfoObject } from "@dsp-app/src/app/project/ontology/default-data/default-properties";

export interface IKeyValuePairs<T> {
    [key: string]: { value: T[]; };
}

export interface IProjectOntologiesKeyValuePairs  {
    [key: string]: { 
        ontologiesMetadata: OntologyMetadata[] 
        readOntologies: ReadOntology[] 
    };
}

/**
 * contains the information about the assignment of a property to a class
 **/
export interface PropertyAssignment {
    resClass: ClassDefinition;
    property: PropertyInfoObject;
}

export interface OntologyProperties {
    ontology: string;
    properties: PropertyDefinition[];
}

export interface PropToDisplay extends IHasProperty {
    propDef?: PropertyDefinition;
}

export interface PropToAdd {
    ontologyId: string;
    ontologyLabel: string;
    properties: PropertyInfoObject[];
}

export interface DefaultClass {
    iri: string;
    label: string;
    icons?: string[]; // icons can be used to be selected in the resource class form
}