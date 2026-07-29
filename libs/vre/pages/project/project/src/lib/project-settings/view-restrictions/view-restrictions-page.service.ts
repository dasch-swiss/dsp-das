import { Injectable } from '@angular/core';
import {
  AdminAPIApiService,
  GroupBy,
  ItemType,
  PagedResponseRestrictedResource,
  ViewRestrictionsSummary,
} from '@dasch-swiss/vre/3rd-party-services/open-api';
import { BehaviorSubject, combineLatest, EMPTY, Observable, shareReplay, switchMap } from 'rxjs';
import { ProjectPageService } from '../../project-page.service';

/**
 * State for the read-only "View restrictions" page (design screen 1h).
 *
 * Holds the current group-by / item-type filters and exposes the per-audience `summary$` matrix.
 * Drill-down items for one group are fetched on demand via `loadItems(...)`.
 */
@Injectable()
export class ViewRestrictionsPageService {
  private readonly _project$ = this._projectPageService.currentProject$;

  readonly groupBy$ = new BehaviorSubject<GroupBy>(GroupBy.ResourceClass);
  readonly itemType$ = new BehaviorSubject<ItemType>(ItemType.All);

  /** The summary matrix, recomputed whenever the project, group-by or item-type changes. */
  readonly summary$: Observable<ViewRestrictionsSummary> = combineLatest([
    this._project$,
    this.groupBy$,
    this.itemType$,
  ]).pipe(
    switchMap(([project, groupBy, itemType]) => {
      if (!project) {
        return EMPTY;
      }
      return this._adminApiService.getAdminProjectsIriProjectiriViewRestrictionsSummary(project.id, groupBy, itemType);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    private readonly _adminApiService: AdminAPIApiService,
    private readonly _projectPageService: ProjectPageService
  ) {}

  setGroupBy(groupBy: GroupBy): void {
    this.groupBy$.next(groupBy);
  }

  setItemType(itemType: ItemType): void {
    this.itemType$.next(itemType);
  }

  /** Fetch the paginated affected resources/items under one group (class or property IRI). */
  loadItems(group: string, page: number, pageSize: number): Observable<PagedResponseRestrictedResource> {
    return this._project$.pipe(
      switchMap(project => {
        if (!project) {
          return EMPTY;
        }
        return this._adminApiService.getAdminProjectsIriProjectiriViewRestrictionsItems(
          project.id,
          group,
          this.groupBy$.value,
          this.itemType$.value,
          page,
          pageSize
        );
      })
    );
  }
}
