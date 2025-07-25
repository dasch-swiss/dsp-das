import { Injectable } from '@angular/core';
import { ListApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { Action, State, StateContext } from '@ngxs/store';
import { finalize, map, of, take, tap } from 'rxjs';
import { ClearListsAction, DeleteListNodeAction, LoadListsInProjectAction } from './lists.actions';
import { ListsStateModel } from './lists.state-model';

const defaults: ListsStateModel = {
  isLoading: false,
  isLoaded: false, // indicates if the lists in a project have been loaded
  listsInProject: [], // lists in a project
};

/*
  Provides data for the lists (Controlled Vocabularies) in a project.
  It also offers methods for CRUD operations on the lists state.
*/
@State<ListsStateModel>({
  defaults,
  name: 'lists',
})
@Injectable()
export class ListsState {
  constructor(private _listApiService: ListApiService) {}

  @Action(LoadListsInProjectAction)
  loadListsInProject(ctx: StateContext<ListsStateModel>, { projectIri }: LoadListsInProjectAction) {
    ctx.patchState({ isLoading: true });
    return this._listApiService.listInProject(projectIri).pipe(
      take(1),
      tap(response => {
        ctx.patchState({ listsInProject: response.lists });
      }),
      finalize(() => ctx.patchState({ isLoading: false, isLoaded: true }))
    );
  }

  @Action(DeleteListNodeAction)
  deleteListNode(ctx: StateContext<ListsStateModel>, { listIri }: DeleteListNodeAction) {
    ctx.patchState({ isLoading: true });
    return this._listApiService.deleteListNode(listIri).pipe(
      take(1),
      tap({
        next: () => {
          const state = ctx.getState();
          state.listsInProject.splice(
            state.listsInProject.findIndex(u => u.id === listIri),
            1
          );
          ctx.setState({ ...state, isLoading: false });
        },
      })
    );
  }

  @Action(ClearListsAction)
  clearCurrentProject(ctx: StateContext<ListsStateModel>) {
    return of(ctx.getState()).pipe(
      map(currentState => {
        ctx.patchState(defaults);
        return currentState;
      })
    );
  }
}
