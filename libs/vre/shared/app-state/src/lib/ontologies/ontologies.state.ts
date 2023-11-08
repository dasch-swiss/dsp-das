import { SortingService } from './../../../../../../../apps/dsp-app/src/app/main/services/sorting.service';
import { Inject, Injectable } from '@angular/core';
import { Action, Actions, State, StateContext, ofActionSuccessful } from '@ngxs/store';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { DspApiConnectionToken, getAllEntityDefinitionsAsArray } from '@dasch-swiss/vre/shared/app-config';
import { ApiResponseError, Constants, KnoraApiConnection, OntologiesMetadata, ReadOntology, PropertyDefinition, UpdateOntology, UpdateResourceClassCardinality, ResourceClassDefinitionWithAllLanguages, IHasProperty, OntologyMetadata, CanDoResponse } from '@dasch-swiss/dsp-js';
import { OntologiesStateModel } from './ontologies.state-model';
import { CurrentOntologyCanBeDeletedAction, ClearCurrentOntologyAction, ClearOntologiesAction, ClearProjectOntologiesAction, LoadOntologyAction, LoadProjectOntologiesAction, RemoveProjectOntologyAction, RemovePropertyAction, ReplacePropertyAction, SetCurrentOntologyAction, SetCurrentProjectOntologyPropertiesAction, SetOntologiesLoadingAction, UpdateOntologyAction, UpdateProjectOntologyAction } from './ontologies.actions';
import { AppErrorHandler } from '@dasch-swiss/vre/shared/app-error-handler';
import { IProjectOntologiesKeyValuePairs, OntologyProperties } from '../model-interfaces';
import { of } from 'rxjs';
import { LoadListsInProjectAction } from '../lists/lists.actions';
import { ProjectService } from '@dsp-app/src/app/workspace/resource/services/project.service';

const defaults: OntologiesStateModel = <OntologiesStateModel>{
    isLoading: false,
    projectOntologies: {},
    hasLoadingErrors: false,
    currentOntology: null,
    currentOntologyCanBeDeleted: false,
    currentProjectOntologyProperties: [],
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
        private _sortingService: SortingService,
        private _projectService: ProjectService,
        private _actions$: Actions,
    ) {}
    
    //TODO Remove this action when all actions containing this usage is implemented
    @Action(SetOntologiesLoadingAction)
    setOntologiesLoadingAction(
        ctx: StateContext<OntologiesStateModel>,
        { isLoading }: SetOntologiesLoadingAction
    ) {
        ctx.patchState({ isLoading });
    }

    @Action(SetCurrentOntologyAction)
    setCurrentOntologyAction(
        ctx: StateContext<OntologiesStateModel>,
        { readOntology }: SetCurrentOntologyAction
    ) {
        ctx.patchState({ currentOntology: readOntology });
    }

    
    @Action(UpdateProjectOntologyAction)
    updateProjectOntologyAction(
        ctx: StateContext<OntologiesStateModel>,
        { readOntology, projectUuid }: UpdateProjectOntologyAction
    ) {
        const state = ctx.getState();
        const readOntologies = state.projectOntologies[projectUuid].readOntologies;
        readOntologies[readOntologies.findIndex((onto) => onto.id === readOntology.id)] = readOntology;
        ctx.patchState(state);
    }

    
    @Action(RemoveProjectOntologyAction)
    removeProjectOntologyAction(
        ctx: StateContext<OntologiesStateModel>,
        { readOntologyId, projectUuid }: RemoveProjectOntologyAction
    ) {
        const state = ctx.getState();
        const readOntologies = state.projectOntologies[projectUuid].readOntologies;
        const index = readOntologies.findIndex((onto) => onto.id === readOntologyId);
        if (index > -1) {
            readOntologies.splice(index, 1);
        }
        ctx.patchState(state);
    }

    @Action(LoadProjectOntologiesAction)
    loadProjectOntologiesAction(
        ctx: StateContext<OntologiesStateModel>,
        { projectIri }: LoadProjectOntologiesAction
    ) {
        ctx.patchState({ isLoading: true });
        projectIri = this._projectService.uuidToIri(projectIri);

        // get all project ontologies 
        return this._dspApiConnection.v2.onto.getOntologiesByProjectIri(projectIri)
            .pipe(
                take(1),
                map((response: OntologiesMetadata | ApiResponseError) => { 
                    return response as OntologiesMetadata;
                }),
                tap({
                    next: (ontoMeta: OntologiesMetadata) => {
                        if (!ontoMeta.ontologies.length) {
                            ctx.dispatch(new LoadListsInProjectAction(projectIri));
                            return;
                        }

                        const projectOntologies: IProjectOntologiesKeyValuePairs = 
                            { [projectIri] : { ontologiesMetadata: ontoMeta.ontologies, readOntologies: [] } };
                        ctx.setState({ ...ctx.getState(), projectOntologies });
                        //TODO should load ontologies as a batch with dedicated endpoint, not one by one
                        ctx.dispatch(
                            //dispatch all actions except the last one to keep the loading state
                            ontoMeta.ontologies.slice(0, ontoMeta.ontologies.length - 1)
                                .map((onto) => new LoadOntologyAction(onto.id, projectIri, false))
                        )
                        .pipe(
                            take(1),
                            tap(() => 
                                ctx.dispatch(new LoadOntologyAction(ontoMeta.ontologies[ontoMeta.ontologies.length - 1].id, projectIri, true))
                            )
                        )
                        .subscribe(() => this._actions$.pipe(ofActionSuccessful(LoadOntologyAction))
                            .pipe(take(1))
                            .subscribe(() => 
                                //last action dispatched
                                ctx.dispatch(new LoadListsInProjectAction(projectIri))
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
            ontologyIri: ontologyIri,
            projectUuid,
            stopLoadingWhenCompleted,
        }: LoadOntologyAction
    ) {
        ctx.patchState({ isLoading: true });
        return this._dspApiConnection.v2.onto.getOntology(ontologyIri, true)
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
                        //this._sortingService.keySortByAlphabetical(projectReadOntologies, 'label');
                        projectOntologiesState[projectUuid].readOntologies = projectReadOntologies;
                        
                        ctx.setState({ 
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

    @Action(UpdateOntologyAction)
    updateOntologyAction(
        ctx: StateContext<OntologiesStateModel>,
        {  ontologyMetadata, projectUuid }: UpdateOntologyAction
    ) {
        ctx.patchState({ isLoading: true });
        return this._dspApiConnection.v2.onto.updateOntology(ontologyMetadata)
            .pipe(
                take(1),
                map((response: OntologyMetadata | ApiResponseError) => { 
                    return response as OntologyMetadata;
                }),
                tap({
                    next: (ontology: OntologyMetadata) => {
                        const projectIri = this._projectService.uuidToIri(projectUuid);
                        ctx.dispatch(new LoadProjectOntologiesAction(projectIri));
                    },
                    error: (error: ApiResponseError) => {
                        ctx.patchState({ hasLoadingErrors: true });
                        this._errorHandler.showMessage(error);
                    }
                })
            );
    }
    
    @Action(ClearProjectOntologiesAction)
    clearProjectOntologies(
        ctx: StateContext<OntologiesStateModel>,
        { projectUuid }: ClearProjectOntologiesAction
    ) {
        const state = ctx.getState();
        if (!state.projectOntologies[projectUuid]) {
            return;
        }

        state.projectOntologies[projectUuid].ontologiesMetadata = [];
        state.projectOntologies[projectUuid].readOntologies = [];
        ctx.patchState(state);
    }
    
    @Action(ClearOntologiesAction)
    clearOntologies(ctx: StateContext<OntologiesStateModel>) {
        return of(ctx.getState()).pipe(
            map(currentState => {
                ctx.patchState(defaults);
                return currentState;
            })
        );
    }

    @Action(ClearCurrentOntologyAction)
    clearCurrentOntology(ctx: StateContext<OntologiesStateModel>) {
        const state = ctx.getState();
        state.currentOntology = defaults.currentOntology;
        state.currentProjectOntologyProperties = defaults.currentProjectOntologyProperties;
        ctx.patchState(state);
    }
    
    // don't log error to rollbar if 'currentProjectOntologies' does not exist in the application state
    @Action(SetCurrentProjectOntologyPropertiesAction)
    setCurrentProjectOntologyPropertiesAction(
        ctx: StateContext<OntologiesStateModel>,
        { projectUuid }: SetCurrentProjectOntologyPropertiesAction
    ) {
        const state = ctx.getState();
        // get all project ontologies
        const projectOntologies = state.projectOntologies[projectUuid].readOntologies;
        const ontoProperties = <OntologyProperties[]>projectOntologies.map((onto) => <OntologyProperties> {
            ontology: onto.id,
            properties: this.initOntoProperties(getAllEntityDefinitionsAsArray(onto.properties)),
        });

        ctx.setState({ ...state, currentProjectOntologyProperties: ontoProperties });
    }

    /**
     * removes property from resource class
     * @param property
     */
    @Action(RemovePropertyAction)
    removePropertyAction(
        ctx: StateContext<OntologiesStateModel>,
        { property, resourceClass, currentOntologyPropertiesToDisplay }: RemovePropertyAction
    ) {
        ctx.patchState({ isLoading: true });
        const state = ctx.getState();

        const onto = new UpdateOntology<UpdateResourceClassCardinality>();
        onto.lastModificationDate = <string>state.currentOntology?.lastModificationDate;
        onto.id = <string>state.currentOntology?.id;
        const delCard = new UpdateResourceClassCardinality();
        delCard.id = resourceClass.id;
        delCard.cardinalities = [];
        delCard.cardinalities = currentOntologyPropertiesToDisplay.filter(
            (prop) => prop.propertyIndex === property.iri
        );
        onto.entity = delCard;

        this._dspApiConnection.v2.onto
            .deleteCardinalityFromResourceClass(onto)
            .subscribe(
                (res: ResourceClassDefinitionWithAllLanguages | ApiResponseError) => {
                    //ctx.dispatch(new SetCurrentOntologyPropertiesToDisplayAction(currentOntologyPropertiesToDisplay));
                    ctx.setState({ ...state, isLoading: false });
                },
                (error: ApiResponseError) => {
                    this._errorHandler.showMessage(<ApiResponseError>error);
                }
            );
    }

    @Action(ReplacePropertyAction)
    replacePropertyAction(
        ctx: StateContext<OntologiesStateModel>,
        { resourceClass, currentOntologyPropertiesToDisplay }: ReplacePropertyAction
    ) {
        ctx.patchState({ isLoading: true });
        const state = ctx.getState();

        const onto = new UpdateOntology<UpdateResourceClassCardinality>();
        onto.lastModificationDate = <string>state.currentOntology?.lastModificationDate;
        onto.id = <string>state.currentOntology?.id;
        const addCard = new UpdateResourceClassCardinality();
        addCard.id = resourceClass.id;
        addCard.cardinalities = [];
        currentOntologyPropertiesToDisplay.forEach((prop, index) => {
            const propCard: IHasProperty = {
                propertyIndex: prop.propertyIndex,
                cardinality: prop.cardinality,
                guiOrder: index + 1,
            };

            addCard.cardinalities.push(propCard);
        });

        onto.entity = addCard;

        this._dspApiConnection.v2.onto
            .replaceGuiOrderOfCardinalities(onto)
            .pipe(take(1))
            .subscribe((responseGuiOrder: ResourceClassDefinitionWithAllLanguages | ApiResponseError) => {
                    //TODO lastModificationDate should be updated in state if reload action is not executed after this
                    //this.lastModificationDate = responseGuiOrder.lastModificationDate; 
                },
                (error: ApiResponseError) => {
                    this._errorHandler.showMessage(error);
                }
            );
    }

    
    @Action(CurrentOntologyCanBeDeletedAction)
    currentOntologyCanBeDeletedAction(
        ctx: StateContext<OntologiesStateModel>,
        { }: CurrentOntologyCanBeDeletedAction
    ) {
        ctx.patchState({ isLoading: true });
        const state = ctx.getState();
        if (!state.currentOntology) {
            return;
        }

        return this._dspApiConnection.v2.onto.canDeleteOntology(state.currentOntology.id)
            .pipe(
                take(1),
                map((response: CanDoResponse | ApiResponseError) => { 
                    return response as CanDoResponse;
                }),
                tap({
                    next: (response: CanDoResponse) => {
                        ctx.setState({ 
                            ...ctx.getState(), 
                            isLoading: false, 
                            currentOntologyCanBeDeleted: response.canDo
                        });
                    },
                    error: (error: ApiResponseError) => {
                        ctx.patchState({ hasLoadingErrors: true });
                        this._errorHandler.showMessage(error);
                    }
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

    private initOntoProperties(allOntoProperties: PropertyDefinition[]): PropertyDefinition[] {
        // reset the ontology properties
        const listOfProperties: PropertyDefinition[] = [];

        // display only the properties which are not a subjectType of Standoff
        allOntoProperties.forEach((resProp) => {
            const standoff = resProp.subjectType
                ? resProp.subjectType.includes('Standoff')
                : false;
            if (resProp.objectType !== Constants.LinkValue && !standoff) {
                listOfProperties.push(resProp);
            }
        });

        // sort properties by label
        // --> TODO: add sort functionallity to the gui
        return this._sortingService.keySortByAlphabetical(listOfProperties, 'label');
    }
}
