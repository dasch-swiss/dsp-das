import { Component, Inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ResourceResultService } from '@dasch-swiss/vre/pages/data-browser';
import { ProjectPageService } from '@dasch-swiss/vre/pages/project/project';
import { combineLatest, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-advanced-search-results-page',
  template: `
    @if (resources$ | async; as resources) {
      <app-resource-browser
        [data]="{ resources: resources, selectFirstResource: true }"
        [showBackToFormButton]="true"
        [hasRightsToShowCreateLinkObject$]="projectPageService.hasProjectMemberRights$" />
    }
    `,
  providers: [ResourceResultService],
})
export class AdvancedSearchResultsPageComponent {
  readonly resources$ = this._route.params.pipe(
    switchMap(params =>
      combineLatest([
        this._resourceResultService.pageIndex$.pipe(
          switchMap(pageNumber => this._performGravSearch(params, pageNumber))
        ),
        this._numberOfAllResults$(params),
      ])
    ),
    map(([resourceResponse, countResponse]) => {
      this._resourceResultService.numberOfResults = countResponse.numberOfResults;
      return resourceResponse.resources;
    })
  );

  constructor(
    private _route: ActivatedRoute,
    private _titleService: Title,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _resourceResultService: ResourceResultService,
    public projectPageService: ProjectPageService
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
