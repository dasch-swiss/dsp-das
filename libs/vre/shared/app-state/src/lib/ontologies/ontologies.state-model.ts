import { OntologyMetadata, ReadOntology } from "@dasch-swiss/dsp-js";

export interface IProjectOntologiesKeyValuePairs  {
    [key: string]: { 
        ontologiesMetadata: OntologyMetadata[] 
        readOntologies: ReadOntology[] 
    };
}

export class OntologiesStateModel {
    isLoading: boolean | undefined;
    hasLoadingErrors: boolean | undefined;
    projectOntologies: IProjectOntologiesKeyValuePairs = {};
}
