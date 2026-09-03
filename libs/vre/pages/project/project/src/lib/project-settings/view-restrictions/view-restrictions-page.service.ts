import { Injectable } from '@angular/core';
import {
  AdminAPIApiService,
  PagedResponseRestrictedResource,
  RestrictedClass,
  ValueItemType,
  ViewRestrictionsValues,
} from '@dasch-swiss/vre/3rd-party-services/open-api';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  EMPTY,
  map,
  mergeMap,
  Observable,
  of,
  scan,
  shareReplay,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';
import { ProjectPageService } from '../../project-page.service';

/** How many step-2 requests may be in flight at once. */
const VALUE_REQUEST_CONCURRENCY = 4;

/**
 * Step-1 load state: the class list, which is the whole table skeleton.
 *
 * Mutually exclusive so the UI never has to guess. Unlike the per-class states below, a failure here is
 * terminal for the page: without the class list there is no row to attribute anything to, so no step-2
 * request is issued at all.
 */
export interface ClassesState {
  loading: boolean;
  classes?: RestrictedClass[];
  failed?: boolean;
}

/** Per-class step-2 load state. `failed` is confined to its own row — other classes keep loading. */
export interface ValuesState {
  loading: boolean;
  counts?: ViewRestrictionsValues;
  failed?: boolean;
}

/** Progress for the "gathering k / N" indicator. */
export interface GatherProgress {
  done: number;
  total: number;
}

/**
 * State for the read-only "View restrictions" page.
 *
 * Loads in two steps rather than one request (DEV-6778). The single-request form had to finish every
 * class's counts before rendering anything, which on a large project exceeded the triplestore timeout and
 * produced a 500 — an empty screen with no indication of which class was the problem.
 *
 *   1. `classesState$` — one request returning every class with its population and resource-level counts.
 *      The whole table renders from this.
 *   2. `valuesState$`  — one request per class for its value-level counts, at most
 *      {@link VALUE_REQUEST_CONCURRENCY} in flight, accumulating so rows fill in as answers arrive.
 *
 * `catchError` sits on each *inner* step-2 request, so one class failing marks that row and leaves the
 * rest of the run intact. That is the whole point of the split: partial data beats no data on a
 * permissions report, provided the gaps are visible (see `anyFailed$`).
 */
@Injectable()
export class ViewRestrictionsPageService {
  private readonly _project$ = this._projectPageService.currentProject$;

  readonly itemType$ = new BehaviorSubject<ValueItemType>(ValueItemType.All);

  /** Bumped to re-run step 2 after a per-class failure. */
  private readonly _retry$ = new Subject<string>();

  /**
   * Cache of value counts already fetched, keyed on class **and** item type.
   *
   * Changing the filter re-runs step 2, so without this an admin comparing two filters would pay for
   * every class again. Keyed on both because the counts differ per filter — keying on the class alone
   * would serve one filter's numbers under another's label.
   */
  private readonly _cache = new Map<string, ViewRestrictionsValues>();

  private static cacheKey(classIri: string, itemType: ValueItemType): string {
    return `${itemType} ${classIri}`;
  }

  /**
   * Step 1. Recomputed only when the project changes — deliberately independent of `itemType$`, since
   * resource-level counts are never filtered and the endpoint takes no filter at all.
   */
  readonly classesState$: Observable<ClassesState> = this._project$.pipe(
    switchMap(project => {
      if (!project) {
        return EMPTY;
      }
      return this._adminApiService.getAdminProjectsIriProjectiriViewRestrictionsClasses(project.id).pipe(
        map(result => ({ loading: false, classes: result.classes }) as ClassesState),
        catchError(() => of({ loading: false, failed: true } as ClassesState)),
        startWith({ loading: true } as ClassesState)
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /**
   * Step 2, as a growing map from class IRI to that class's state.
   *
   * Restarts whenever the class list or the item-type filter changes. Emits on every arrival so the table
   * fills in progressively; `scan` is what makes a row's own result independent of the others'.
   */
  readonly valuesState$: Observable<Map<string, ValuesState>> = combineLatest([
    this.classesState$,
    this.itemType$,
    this._retry$.pipe(startWith(null)),
  ]).pipe(
    switchMap(([classesState, itemType]) => {
      const classes = classesState.classes;
      if (!classes?.length) {
        return of(new Map<string, ValuesState>());
      }
      return this._project$.pipe(
        switchMap(project => {
          if (!project) {
            return EMPTY;
          }
          const initial = new Map<string, ValuesState>(classes.map(c => [c.id, { loading: true }]));
          return this._fetchValues(project.id, classes, itemType).pipe(
            scan((acc, [classIri, state]) => new Map(acc).set(classIri, state), initial),
            startWith(initial)
          );
        })
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** `{ done, total }` for the progress indicator, derived from the accumulator rather than counted twice. */
  readonly progress$: Observable<GatherProgress> = this.valuesState$.pipe(
    map(states => ({
      done: [...states.values()].filter(s => !s.loading).length,
      total: states.size,
    })),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /**
   * Whether any class could not be computed.
   *
   * The UI uses this to mark the *value* totals as a lower bound. Resource totals come wholly from step 1
   * and are never partial, so they must not be flagged.
   */
  readonly anyFailed$: Observable<boolean> = this.valuesState$.pipe(
    map(states => [...states.values()].some(s => s.failed)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    private readonly _adminApiService: AdminAPIApiService,
    private readonly _projectPageService: ProjectPageService
  ) {}

  setItemType(itemType: ValueItemType): void {
    this.itemType$.next(itemType);
  }

  /** Re-run step 2 after a failure. The cache keeps every class that already succeeded. */
  retryClass(classIri: string): void {
    this._cache.delete(ViewRestrictionsPageService.cacheKey(classIri, this.itemType$.value));
    this._retry$.next(classIri);
  }

  /** Fetch the paginated affected resources under one class. */
  loadItems(resourceClass: string, page: number, pageSize: number): Observable<PagedResponseRestrictedResource> {
    return this._project$.pipe(
      switchMap(project => {
        if (!project) {
          return EMPTY;
        }
        // The API dropped `groupBy` from /items when property mode was deleted, so the signature is
        // (projectIri, resourceClass, itemType?, page?, pageSize?) — one `undefined` fewer than before.
        return this._adminApiService.getAdminProjectsIriProjectiriViewRestrictionsItems(
          project.id,
          resourceClass,
          undefined,
          page,
          pageSize
        );
      })
    );
  }

  /**
   * One request per class, bounded to {@link VALUE_REQUEST_CONCURRENCY} concurrently.
   *
   * `mergeMap` rather than `concatMap` so several classes are in flight at once, and rather than an
   * unbounded fan-out so one admin's dashboard cannot put every class's query on the triplestore
   * simultaneously — which is the load that produced the timeouts this split exists to avoid.
   *
   * Emits `[classIri, state]` pairs for the accumulator upstream. `catchError` is on the inner request:
   * on the outer stream a single failure would end the run and strand every class still queued.
   */
  private _fetchValues(
    projectId: string,
    classes: RestrictedClass[],
    itemType: ValueItemType
  ): Observable<[string, ValuesState]> {
    return of(...classes).pipe(
      mergeMap(clazz => {
        const key = ViewRestrictionsPageService.cacheKey(clazz.id, itemType);
        const cached = this._cache.get(key);
        if (cached) {
          return of([clazz.id, { loading: false, counts: cached }] as [string, ValuesState]);
        }
        return this._adminApiService
          .getAdminProjectsIriProjectiriViewRestrictionsValues(projectId, clazz.id, itemType)
          .pipe(
            map(counts => {
              this._cache.set(key, counts);
              return [clazz.id, { loading: false, counts }] as [string, ValuesState];
            }),
            catchError(() => of([clazz.id, { loading: false, failed: true }] as [string, ValuesState]))
          );
      }, VALUE_REQUEST_CONCURRENCY)
    );
  }
}
