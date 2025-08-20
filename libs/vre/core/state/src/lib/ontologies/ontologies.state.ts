import { Inject, Injectable } from '@angular/core';
import { KnoraApiConnection, ReadOntology } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { OntologyService, ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Action, Actions, ofActionSuccessful, State, StateContext } from '@ngxs/store';
import { map, of, switchMap, take, tap } from 'rxjs';
import { LoadListsInProjectAction } from '../lists/lists.actions';
import { IProjectOntologiesKeyValuePairs } from '../model-interfaces';
import {
  ClearOntologiesAction,
  LoadOntologyAction,
  LoadProjectOntologiesAction,
  RemoveProjectOntologyAction,
  ResetCurrentOntologyAction,
  SetCurrentOntologyAction,
  SetOntologyAction,
} from './ontologies.actions';
import { OntologiesStateModel } from './ontologies.state-model';

const defaults: OntologiesStateModel = <OntologiesStateModel>{
  projectOntologies: {}, // project ontologies grouped by project IRI
  currentOntology: null, // the currently selected ontology
};

/*
  Provides data about the ontologies in a project, resource viewer, ontology editor.
*/
@State<OntologiesStateModel>({
  defaults,
  name: 'ontologies',
})
@Injectable()
export class OntologiesState {
  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _projectService: ProjectService,
    private _actions$: Actions
  ) {}

  @Action(SetCurrentOntologyAction)
  setCurrentOntologyAction(ctx: StateContext<OntologiesStateModel>, { readOntology }: SetCurrentOntologyAction) {
    ctx.patchState({ currentOntology: readOntology });
  }

  @Action(ResetCurrentOntologyAction)
  resetCurrentOntologyAction(
    ctx: StateContext<OntologiesStateModel>,
    { ontology, projectIri }: ResetCurrentOntologyAction
  ) {
    ctx.dispatch(new SetOntologyAction(ontology, projectIri));
    ctx.dispatch(new SetCurrentOntologyAction(ontology));
  }

  @Action(RemoveProjectOntologyAction)
  removeProjectOntologyAction(
    ctx: StateContext<OntologiesStateModel>,
    { readOntologyId, projectUuid }: RemoveProjectOntologyAction
  ) {
    const state = ctx.getState();
    const readOntologies = state.projectOntologies[projectUuid].readOntologies;
    const index = readOntologies.findIndex(onto => onto.id === readOntologyId);
    if (index > -1) {
      readOntologies.splice(index, 1);
    }
    ctx.patchState(state);
  }

  @Action(SetOntologyAction)
  setOntologyAction(ctx: StateContext<OntologiesStateModel>, { ontology, projectIri }: SetOntologyAction) {
    const state = ctx.getState();
    const existing = state.projectOntologies[projectIri]?.readOntologies || [];

    const updatedOntologies = existing.map(o => (o.id === ontology.id ? ontology : o));
    const isNew = !existing.some(o => o.id === ontology.id);

    const newReadOntologies = isNew ? [...existing, ontology] : updatedOntologies;

    ctx.setState({
      ...state,
      projectOntologies: {
        ...state.projectOntologies,
        [projectIri]: {
          ...state.projectOntologies[projectIri],
          readOntologies: newReadOntologies,
        },
      },
    });
  }

  @Action(LoadProjectOntologiesAction)
  loadProjectOntologiesAction(
    ctx: StateContext<OntologiesStateModel>,
    { projectIri, ontologyName }: LoadProjectOntologiesAction
  ) {
    projectIri = this._projectService.uuidToIri(projectIri);

    // get all project ontologies
    return this._dspApiConnection.v2.onto.getOntologiesByProjectIri(projectIri).pipe(
      take(1),
      tap({
        next: ontoMeta => {
          if (!ontoMeta.ontologies.length) {
            ctx.dispatch(new LoadListsInProjectAction(projectIri));
            return;
          }

          const projectOntologies: IProjectOntologiesKeyValuePairs = {
            [projectIri]: {
              ontologiesMetadata: ontoMeta.ontologies,
              readOntologies: [],
            },
          };
          ctx.setState({ ...ctx.getState(), projectOntologies });
          // TODO should load ontologies as a batch with dedicated endpoint, not one by one
          ctx
            .dispatch(
              // dispatch all actions except the last one to keep the loading state
              ontoMeta.ontologies
                .slice(0, ontoMeta.ontologies.length - 1)
                .map(onto => new LoadOntologyAction(onto.id, projectIri, false))
            )
            .pipe(
              take(1),
              tap(() =>
                ctx.dispatch(
                  new LoadOntologyAction(ontoMeta.ontologies[ontoMeta.ontologies.length - 1].id, projectIri, true)
                )
              )
            )
            .pipe(switchMap(() => this._actions$.pipe(ofActionSuccessful(LoadOntologyAction), take(1)))) // last action dispatched
            .subscribe(() => {
              if (ontologyName) {
                const readOntology = ctx
                  .getState()
                  .projectOntologies[
                    projectIri
                  ].readOntologies.find(o => o.id === OntologyService.getOntologyNameFromIri(ontologyName));
                if (readOntology) {
                  ctx.dispatch(new SetCurrentOntologyAction(readOntology));
                }
              }

              ctx.dispatch(new LoadListsInProjectAction(projectIri));
            });
        },
      })
    );
  }

  @Action(LoadOntologyAction)
  loadOntologyAction(
    ctx: StateContext<OntologiesStateModel>,
    { ontologyIri, projectUuid, stopLoadingWhenCompleted }: LoadOntologyAction
  ) {
    return this._dspApiConnection.v2.onto.getOntology(ontologyIri, true).pipe(
      take(1),
      tap({
        next: ontology => {
          const projectIri = this._projectService.uuidToIri(projectUuid);
          let projectOntologiesState = ctx.getState().projectOntologies;
          if (!projectOntologiesState[projectIri]) {
            projectOntologiesState = {
              [projectIri]: { ontologiesMetadata: [], readOntologies: [] },
            };
          }

          let projectReadOntologies = projectOntologiesState[projectIri].readOntologies;
          const projectReadOntologiesIndex = projectReadOntologies.findIndex(o => o.id === ontology.id);
          if (projectReadOntologiesIndex > -1) {
            projectReadOntologies[projectReadOntologiesIndex] = ontology;
          } else {
            projectReadOntologies.push(ontology);
          }

          projectReadOntologies = projectReadOntologies.sort((o1, o2) => this._compareOntologies(o1, o2));
          // SortingHelper.keySortByAlphabetical(projectReadOntologies, 'labels');
          projectOntologiesState[projectIri].readOntologies = projectReadOntologies;

          if (ontology.id === ctx.getState().currentOntology?.id) {
            ctx.dispatch(new SetCurrentOntologyAction(ontology));
          }

          ctx.setState({
            ...ctx.getState(),
            projectOntologies: { ...projectOntologiesState }, // batch update with a new reference!
          });
        },
      })
    );
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
