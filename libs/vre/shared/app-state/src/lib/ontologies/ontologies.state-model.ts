import { IProjectOntologiesKeyValuePairs } from "../model-interfaces";

export class OntologiesStateModel {
    isLoading: boolean | undefined;
    hasLoadingErrors: boolean | undefined;
    projectOntologies: IProjectOntologiesKeyValuePairs = {};
}
