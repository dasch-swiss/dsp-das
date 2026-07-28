import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ErrorHandler, Inject, Input, OnChanges, signal } from '@angular/core';
import { IFulltextSearchParams, KnoraApiConnection, ReadResource } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ResourceBrowserComponent } from '@dasch-swiss/vre/pages/data-browser';
import { ResourceResultService } from '@dasch-swiss/vre/shared/app-helper-services';
import { AppProgressIndicatorComponent } from '@dasch-swiss/vre/ui/progress-indicator';
import { CenteredBoxComponent, NoResultsFoundComponent, SearchFailedComponent } from '@dasch-swiss/vre/ui/ui';
import { BehaviorSubject, catchError, combineLatest, map, Observable, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-search-result',
  imports: [
    AsyncPipe,
    CenteredBoxComponent,
    NoResultsFoundComponent,
    ResourceBrowserComponent,
    AppProgressIndicatorComponent,
    SearchFailedComponent,
  ],
  template: `
    @let resources = resources$ | async;
    @if (failed()) {
      <app-centered-box>
        <app-search-failed (retry)="onRetry()" />
      </app-centered-box>
    } @else if (!resources && loading()) {
      <app-progress-indicator />
    } @else if (resources) {
      @if (resources.length === 0) {
        <app-centered-box>
          <app-no-results-found [message]="noResultMessage" />
        </app-centered-box>
      } @else {
        <app-resource-browser
          [data]="{ resources: resources, selectFirstResource: true }"
          [searchKeyword]="query"
          [showProjectShortname]="showProjectShortname"
          [loading]="loading()" />
      }
    }
  `,
  providers: [ResourceResultService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResultComponent implements OnChanges {
  @Input({ required: true }) query!: string;
  @Input() projectId?: string;
  @Input() showProjectShortname = false;

  readonly loading = signal(true);
  readonly failed = signal(false);

  resources$!: Observable<ReadResource[] | null>;

  readonly noResultMessage = 'There are no resources to display.';

  /** Re-triggers the search after a failure. Replays on subscribe so the initial search runs too. */
  private readonly _retrySubject = new BehaviorSubject<void>(undefined);

  get searchInProjectParam(): IFulltextSearchParams {
    return this.projectId
      ? {
          limitToProject: this.projectId,
        }
      : {};
  }

  constructor(
    @Inject(DspApiConnectionToken)
    private readonly _dspApiConnection: KnoraApiConnection,
    private readonly _resourceResultService: ResourceResultService,
    private readonly _errorHandler: ErrorHandler
  ) {}

  ngOnChanges() {
    this.loading.set(true);
    this.failed.set(false);

    this.resources$ = this._retrySubject.pipe(switchMap(() => this._search$()));
  }

  onRetry() {
    // The subject is already subscribed, so this synchronously re-enters `_search$()`, whose `tap`
    // on `pageIndex$` resets `loading`/`failed` — no need to set them here as well.
    this._retrySubject.next();
  }

  /**
   * The `catchError` is what keeps the spinner from spinning forever: without it, `loading` was only
   * ever cleared on the success path inside `map()`, so a failed request left the progress indicator
   * rendered indefinitely (DEV-6866). Returning `of(null)` rather than rethrowing also keeps the
   * outer stream alive, so retry works without rebuilding the observable.
   *
   * The error is still handed to the `ErrorHandler` so the snackbar — which names the specific
   * cause (timeout, no connection, no permission) that the generic failure panel cannot — keeps
   * appearing as before. It is now a supplement to the persistent state, not the only signal.
   */
  private _search$(): Observable<ReadResource[] | null> {
    return combineLatest([
      this._resourceResultService.pageIndex$.pipe(
        tap(() => {
          this.loading.set(true);
          this.failed.set(false);
        }),
        switchMap(pageNumber =>
          this._dspApiConnection.v2.search.doFulltextSearch(this.query, pageNumber, this.searchInProjectParam)
        )
      ),
      this._numberOfAllResults$(this.query),
    ]).pipe(
      map(([resourceResponse, countResponse]) => {
        // A failed count is reported as unknown, never substituted with this page's length: that would
        // assert "25 results" over a 10,000-hit search and, landing exactly on the page-size boundary,
        // would also silently drop the paginator.
        this._resourceResultService.numberOfResults = countResponse?.numberOfResults ?? null;
        this.loading.set(false);
        return resourceResponse.resources;
      }),
      catchError((error: unknown) => {
        this._errorHandler.handleError(error);
        this.loading.set(false);
        this.failed.set(true);
        return of(null);
      })
    );
  }

  /**
   * The count only drives the paginator, but it re-runs the same WHERE clause as the results query
   * and is the more expensive of the two (DEV-6809). Sharing one `combineLatest` therefore meant a
   * count timeout errored the whole stream and threw away results that had arrived perfectly well,
   * so the count absorbs its own failure and degrades to an absent count instead.
   */
  private _numberOfAllResults$ = (query: string) =>
    this._dspApiConnection.v2.search
      .doFulltextSearchCountQuery(query, 0, this.searchInProjectParam)
      .pipe(catchError(() => of(null)));
}
