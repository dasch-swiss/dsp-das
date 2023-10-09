import { OntologyMetadata, ReadOntology } from "@dasch-swiss/dsp-js";

export interface IKeyValuePairs<T> {
    [key: string]: { value: T[]; };
}

export interface IProjectOntologiesKeyValuePairs  {
    [key: string]: { 
        ontologiesMetadata: OntologyMetadata[] 
        readOntologies: ReadOntology[] 
    };
}
