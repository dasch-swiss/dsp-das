import { Injectable } from '@angular/core';
import { ListNodeInfo, ReadProject } from '@dasch-swiss/dsp-js';
import { Store } from '@ngxs/store';
import { combineLatest, distinctUntilChanged, Observable, switchMap, tap } from 'rxjs';
import { LoadListsInProjectAction } from './lists.actions';
import { ListsSelectors } from './lists.selectors';

@Injectable({ providedIn: 'root' })
export class ListsFacade {
  constructor(private _store: Store) {}

  getListsInProject$(project: ReadProject): Observable<ListNodeInfo[]> {
    return combineLatest([
      this._store.select(ListsSelectors.isListsLoaded),
      this._store.select(ListsSelectors.isListsLoading),
    ]).pipe(
      distinctUntilChanged(),
      tap(([loaded, loading]) => {
        if (!loaded && !loading) {
          this._store.dispatch(new LoadListsInProjectAction(project.id));
        }
      }),
      switchMap(() => this._store.select(ListsSelectors.listsInProject))
    );
  }
}
