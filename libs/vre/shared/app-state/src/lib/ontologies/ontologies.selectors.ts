import { Selector } from '@ngxs/store';
import { IProjectOntologiesKeyValuePairs, OntologiesStateModel } from './ontologies.state-model';
import { OntologiesState } from './ontologies.state';

export class OntologiesSelectors {
    @Selector([OntologiesState])
    static isLoading(state: OntologiesStateModel): boolean | undefined {
        return state.isLoading;
    }

    @Selector([OntologiesState])
    static hasLoadingErrors(state: OntologiesStateModel): boolean | undefined {
        return state.hasLoadingErrors;
    }

    @Selector([OntologiesState])
    static projectOntologies(state: OntologiesStateModel): IProjectOntologiesKeyValuePairs {
        return state.projectOntologies;
    }
}
