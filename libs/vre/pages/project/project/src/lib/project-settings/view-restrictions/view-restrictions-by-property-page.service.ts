import { Injectable } from '@angular/core';
import {
  AdminAPIApiService,
  PagedResponseRestrictedPropertyResource,
  RestrictedProperty,
  ValueItemType,
  ViewRestrictionsPropertyValues,
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

/** How many step-2 requests may be in flight at once, matching the class report. */
const VALUE_REQUEST_CONCURRENCY = 4;

/**
 * Step-1 load state: the property list, which is the whole table skeleton.
 *
 * Comes from the API's ontology cache, so it is fast — but a failure here is still terminal for the table:
 * without the list there is no row to attribute anything to, and no step-2 request is issued.
 */
export interface PropertiesState {
  loading: boolean;
  properties?: RestrictedProperty[];
  failed?: boolean;
}

/** Per-property step-2 state. `failed` is confined to its own row. */
export interface PropertyValuesState {
  loading: boolean;
  counts?: ViewRestrictionsPropertyValues;
  failed?: boolean;
}

/** Progress for the "gathering k / N" indicator. */
export interface GatherProgress {
  done: number;
  total: number;
}

/**
 * State for the property-grouped view-restrictions table.
 *
 * A sibling of `ViewRestrictionsPageService`, not a mode of it — the API routes are separate and so is this.
 * The shape is the same because the problem is: a single whole-project query grouped by property measured
 * 24.8s, so the table is filled one property at a time with visible progress.
 *
 * Two differences from the class version, both following from the API:
 *
 *   - Step 1 carries **no counts**. A property has only one unit (its values), so there is nothing step 1
 *     could report that step 2 does not; every number arrives in step 2.
 *   - There are more rows. LHTT has ~182 value properties against 43 classes, so the fill takes noticeably
 *     longer even though each request is comparable.
 */
@Injectable()
export class ViewRestrictionsByPropertyPageService {
  private readonly _project$ = this._projectPageService.currentProject$;

  readonly itemType$ = new BehaviorSubject<ValueItemType>(ValueItemType.All);

  /** Bumped to re-run step 2 after a per-property failure. */
  private readonly _retry$ = new Subject<string>();

  /**
   * Counts already fetched, keyed on property **and** item type.
   *
   * Keyed on both because the counts differ per filter; keying on the property alone would serve one
   * filter's numbers under another's label.
   */
  private readonly _cache = new Map<string, ViewRestrictionsPropertyValues>();

  private static cacheKey(propertyIri: string, itemType: ValueItemType): string {
    return `${itemType} ${propertyIri}`;
  }

  /**
   * Step 1. Independent of `itemType$` — the endpoint takes no filter, because the property list itself
   * cannot change with it.
   */
  readonly propertiesState$: Observable<PropertiesState> = this._project$.pipe(
    switchMap(project => {
      if (!project) {
        return EMPTY;
      }
      return this._adminApiService.getAdminProjectsIriProjectiriViewRestrictionsProperties(project.id).pipe(
        map(result => ({ loading: false, properties: result.properties }) as PropertiesState),
        catchError(() => of({ loading: false, failed: true } as PropertiesState)),
        startWith({ loading: true } as PropertiesState)
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** Step 2, as a growing map from property IRI to that property's state. */
  readonly valuesState$: Observable<Map<string, PropertyValuesState>> = combineLatest([
    this.propertiesState$,
    this.itemType$,
    this._retry$.pipe(startWith(null)),
  ]).pipe(
    switchMap(([state, itemType]) => {
      const properties = state.properties;
      if (!properties?.length) {
        return of(new Map<string, PropertyValuesState>());
      }
      return this._project$.pipe(
        switchMap(project => {
          if (!project) {
            return EMPTY;
          }
          const initial = new Map<string, PropertyValuesState>(properties.map(p => [p.id, { loading: true }]));
          return this._fetchValues(project.id, properties, itemType).pipe(
            scan((acc, [iri, s]) => new Map(acc).set(iri, s), initial),
            startWith(initial)
          );
        })
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly progress$: Observable<GatherProgress> = this.valuesState$.pipe(
    map(states => ({
      done: [...states.values()].filter(s => !s.loading).length,
      total: states.size,
    })),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** Whether any property could not be computed, so the totals are a lower bound. */
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

  /** Re-run step 2 after a failure. Everything already fetched is served from the cache. */
  retryProperty(propertyIri: string): void {
    this._cache.delete(ViewRestrictionsByPropertyPageService.cacheKey(propertyIri, this.itemType$.value));
    this._retry$.next(propertyIri);
  }

  /** The drill-down: resources carrying a restricted value of this property. */
  loadPropertyItems(
    property: string,
    page: number,
    pageSize: number
  ): Observable<PagedResponseRestrictedPropertyResource> {
    return this._project$.pipe(
      switchMap(project => {
        if (!project) {
          return EMPTY;
        }
        return this._adminApiService.getAdminProjectsIriProjectiriViewRestrictionsPropertyItems(
          project.id,
          property,
          this.itemType$.value,
          page,
          pageSize
        );
      })
    );
  }

  /**
   * One request per property, bounded to {@link VALUE_REQUEST_CONCURRENCY}.
   *
   * `catchError` sits on the inner request: on the outer stream a single failure would end the run and
   * strand every property still queued — and with ~182 of them, that is most of the table.
   */
  private _fetchValues(
    projectId: string,
    properties: RestrictedProperty[],
    itemType: ValueItemType
  ): Observable<[string, PropertyValuesState]> {
    return of(...properties).pipe(
      mergeMap(property => {
        const key = ViewRestrictionsByPropertyPageService.cacheKey(property.id, itemType);
        const cached = this._cache.get(key);
        if (cached) {
          return of([property.id, { loading: false, counts: cached }] as [string, PropertyValuesState]);
        }
        return this._adminApiService
          .getAdminProjectsIriProjectiriViewRestrictionsPropertyValues(projectId, property.id, itemType)
          .pipe(
            map(counts => {
              this._cache.set(key, counts);
              return [property.id, { loading: false, counts }] as [string, PropertyValuesState];
            }),
            catchError(() => of([property.id, { loading: false, failed: true }] as [string, PropertyValuesState]))
          );
      }, VALUE_REQUEST_CONCURRENCY)
    );
  }
}
