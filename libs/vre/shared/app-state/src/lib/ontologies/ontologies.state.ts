import { Inject, Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { map, take, tap } from 'rxjs/operators';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { ApiResponseError, KnoraApiConnection, OntologiesMetadata, ReadOntology } from '@dasch-swiss/dsp-js';
import { OntologiesStateModel } from './ontologies.state-model';
import { ClearProjectOntologiesAction, LoadOntologyAction, LoadProjectOntologiesAction } from './ontologies.actions';
import { AppErrorHandler } from '@dasch-swiss/vre/shared/app-error-handler';
import { IProjectOntologiesKeyValuePairs } from '../model-interfaces';
import { of } from 'rxjs';

const defaults: OntologiesStateModel = <OntologiesStateModel>{
    isLoading: false,
    projectOntologies: {},
    hasLoadingErrors: false
};

@State<OntologiesStateModel>({
    defaults,
    name: 'ontologies',
})
@Injectable()
export class OntologiesState {
    constructor(
        @Inject(DspApiConnectionToken)
        private _dspApiConnection: KnoraApiConnection,
        private _errorHandler: AppErrorHandler,
    ) {}

    @Action(LoadProjectOntologiesAction)
    loadProjectOntologiesAction(
        ctx: StateContext<OntologiesStateModel>,
        { projectUuid }: LoadProjectOntologiesAction
    ) {
        ctx.patchState({ isLoading: true });
        // get all project ontologies
        return this._dspApiConnection.v2.onto.getOntologiesByProjectIri(projectUuid)
            .pipe(
                take(1),
                map((response: OntologiesMetadata | ApiResponseError) => { 
                    return response as OntologiesMetadata;
                }),
                tap({
                    next: (ontoMeta: OntologiesMetadata) => {
                        const projectOntologies: IProjectOntologiesKeyValuePairs = 
                            { [projectUuid] : { ontologiesMetadata: ontoMeta.ontologies, readOntologies: [] } };
                        ctx.setState({ ...ctx.getState(), projectOntologies });
                        //TODO should load ontologies as a batch with dedicated endpoint, not one by one
                        ctx.dispatch(
                            ontoMeta.ontologies.slice(0, ontoMeta.ontologies.length - 1)
                                .map((onto) => new LoadOntologyAction(onto.id, projectUuid, false)
                            )
                        )
                        .pipe(take(1))
                        .subscribe(
                            //last action dispatched
                            () => ctx.dispatch(
                                new LoadOntologyAction(ontoMeta.ontologies[ontoMeta.ontologies.length - 1].id, projectUuid, true)
                            )
                        );
                    }, 
                    error: (error: ApiResponseError) => {
                        ctx.patchState({ hasLoadingErrors: true });
                        this._errorHandler.showMessage(error);
                    }
                })
            );
    }

    @Action(LoadOntologyAction)
    loadOntologyAction(
        ctx: StateContext<OntologiesStateModel>,
        { 
            ontologyId,
            projectUuid,
            stopLoadingWhenCompleted,
        }: LoadOntologyAction
    ) {
        ctx.patchState({ isLoading: true });
        return this._dspApiConnection.v2.onto.getOntology(ontologyId)
            .pipe(
                take(1),
                map((response: ReadOntology | ApiResponseError) => { 
                    return response as ReadOntology;
                }),
                tap({
                    next: (ontology: ReadOntology) => {
                        let projectOntologiesState = ctx.getState().projectOntologies;
                        if (!projectOntologiesState[projectUuid]) {
                            projectOntologiesState = { [projectUuid]: { ontologiesMetadata: [], readOntologies: [] }}
                        }
    
                        let projectReadOntologies = projectOntologiesState[projectUuid].readOntologies;
                        projectReadOntologies.push(ontology);
                        projectReadOntologies = projectReadOntologies.sort((o1, o2) =>
                            this._compareOntologies(o1, o2)
                        );
                        projectOntologiesState[projectUuid].readOntologies = projectReadOntologies;
                        
                        ctx.patchState({ 
                            ...ctx.getState(), 
                            isLoading: !stopLoadingWhenCompleted, 
                            projectOntologies: projectOntologiesState
                        });
                    },
                    error: (error: ApiResponseError) => {
                        ctx.patchState({ hasLoadingErrors: true });
                        this._errorHandler.showMessage(error);
                    }
                })
            );
    }
    
    @Action(ClearProjectOntologiesAction)
    clearProjectOntologies(ctx: StateContext<OntologiesStateModel>) {
        return of(ctx.getState()).pipe(
            map(currentState => {
                ctx.patchState(defaults);
                return currentState;
            })
        );
    }

    /**
     * compare function which sorts the ontologies in the ascending order.
     *
     * @param o1 ontology 1
     * @param o2 ontology 2
     * @private
     */
    private _compareOntologies(o1: ReadOntology, o2: ReadOntology) {
        if (o1.label > o2.label) {
            return 1;
        }

        if (o1.label < o2.label) {
            return -1;
        }

        return 0;
    }
}
