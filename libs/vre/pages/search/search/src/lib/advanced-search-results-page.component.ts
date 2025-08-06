import { Component, Inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ResourceClassBrowserPageService } from '@dasch-swiss/vre/pages/data-browser';
import { combineLatest, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-advanced-search-results-page',
  template: ` <app-multiple-viewer-gateway *ngIf="resources$ | async as resources" [resources]="resources" /> `,
  providers: [ResourceClassBrowserPageService],
})
export class AdvancedSearchResultsPageComponent {
  resources$ = combineLatest([this._route.params, this._resourceClassBrowserPageService.pageIndex$]).pipe(
    switchMap(([data, pageNumber]) => this._performGravSearch(data, pageNumber)),
    map(([count, response]) => {
      this._resourceClassBrowserPageService.numberOfResults = count;
      return response.resources;
    })
  );

  constructor(
    private _route: ActivatedRoute,
    private _titleService: Title,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _resourceClassBrowserPageService: ResourceClassBrowserPageService
  ) {
    this._titleService.setTitle(`Advanced search results`);
  }

  private _performGravSearch(params: Params, index: number) {
    let query = decodeURIComponent(params['q']);
    query = query.substring(0, query.search('OFFSET'));
    query = `${query}OFFSET ${index}`;

    const numberOfAllResults$ = this._dspApiConnection.v2.search
      .doExtendedSearchCountQuery(query)
      .pipe(map(count => count.numberOfResults));

    return combineLatest([numberOfAllResults$, this._dspApiConnection.v2.search.doExtendedSearch(query)]);
  }
}
