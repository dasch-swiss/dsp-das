import { Component, Inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ResourceResultService } from '@dasch-swiss/vre/pages/data-browser';
import { combineLatest, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-advanced-search-results-page',
  template: ` <app-multiple-viewer-gateway *ngIf="resources$ | async as resources" [resources]="resources" /> `,
  providers: [ResourceResultService],
})
export class AdvancedSearchResultsPageComponent {
  readonly resources$ = this._route.params.pipe(
    switchMap(params =>
      combineLatest([
        this._resourceClassBrowserPageService.pageIndex$.pipe(
          switchMap(pageNumber => this._performGravSearch(params, pageNumber))
        ),
        this._numberOfAllResults$(params),
      ])
    ),
    map(([resourceResponse, countResponse]) => {
      this._resourceClassBrowserPageService.numberOfResults = countResponse.numberOfResults;
      return resourceResponse.resources;
    })
  );

  constructor(
    private _route: ActivatedRoute,
    private _titleService: Title,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _resourceClassBrowserPageService: ResourceResultService
  ) {
    this._titleService.setTitle(`Advanced search results`);
  }

  private _performGravSearch(params: Params, index: number) {
    let query = this._getQuery(params);
    query = `${query}OFFSET ${index}`;

    return this._dspApiConnection.v2.search.doExtendedSearch(query);
  }

  private _getQuery(params: Params) {
    const query = decodeURIComponent(params['q']);
    return query.substring(0, query.search('OFFSET'));
  }

  private _numberOfAllResults$ = (params: Params) =>
    this._dspApiConnection.v2.search.doExtendedSearchCountQuery(`${this._getQuery(params)}OFFSET 0`);
}
