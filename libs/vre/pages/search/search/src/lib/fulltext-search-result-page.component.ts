import { ChangeDetectionStrategy, Component, Inject, Input, OnChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KnoraApiConnection, ReadResource } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { UserService } from '@dasch-swiss/vre/core/session';
import { ResourceResultService } from '@dasch-swiss/vre/pages/data-browser';
import { combineLatest, map, Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-fulltext-search-result-page',
  template: `
    @if (loading) {
      <app-progress-indicator />
    }
    @if (resources$ | async; as resources) {
      @if (resources.length === 0) {
        <app-centered-box>
          <app-no-results-found [message]="noResultMessage" />
        </app-centered-box>
      }
      @if (resources.length > 0) {
        <app-resource-browser
          [data]="{ resources: resources, selectFirstResource: true }"
          [hasRightsToShowCreateLinkObject$]="userIsSysAdmin$"
          [searchKeyword]="query" />
      }
    }
  `,
  providers: [ResourceResultService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FulltextSearchResultPageComponent implements OnChanges {
  @Input({ required: true }) query!: string;
  loading = true;

  userIsSysAdmin$ = this._userService.isSysAdmin$;
  resources$!: Observable<ReadResource[]>;

  readonly noResultMessage = 'There are no resources to display.';

  constructor(
    private _route: ActivatedRoute,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _resourceResultService: ResourceResultService,
    private _userService: UserService
  ) {}

  ngOnChanges() {
    this.loading = true;

    this.resources$ = combineLatest([
      this._resourceResultService.pageIndex$.pipe(
        switchMap(pageNumber => this._dspApiConnection.v2.search.doFulltextSearch(this.query, pageNumber))
      ),
      this._numberOfAllResults$(this.query),
    ]).pipe(
      map(([resourceResponse, countResponse]) => {
        this.loading = false;
        this._resourceResultService.numberOfResults = countResponse.numberOfResults;
        return resourceResponse.resources;
      })
    );
  }

  private _numberOfAllResults$ = (query: string) =>
    this._dspApiConnection.v2.search.doFulltextSearchCountQuery(query, 0);
}
