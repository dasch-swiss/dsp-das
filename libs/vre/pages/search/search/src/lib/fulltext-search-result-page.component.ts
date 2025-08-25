import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, RouteConstants } from '@dasch-swiss/vre/core/config';
import { ResourceResultService } from '@dasch-swiss/vre/pages/data-browser';
import { combineLatest, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-fulltext-search-result-page',
  template: ` <app-multiple-viewer-gateway *ngIf="resources$ | async as resources" [resources]="resources" />`,
  providers: [ResourceResultService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FulltextSearchResultPageComponent {
  readonly resources$ = this._route.params.pipe(
    map(params => params[RouteConstants.qParameter]),
    switchMap(query =>
      combineLatest([
        this._resourceResultService.pageIndex$.pipe(
          switchMap(pageNumber => this._dspApiConnection.v2.search.doFulltextSearch(query, pageNumber))
        ),
        this._numberOfAllResults$(query),
      ])
    ),
    map(([resourceResponse, countResponse]) => {
      this._resourceResultService.numberOfResults = countResponse.numberOfResults;
      return resourceResponse.resources;
    })
  );

  constructor(
    private _route: ActivatedRoute,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _resourceResultService: ResourceResultService
  ) {}

  private _numberOfAllResults$ = (query: string) =>
    this._dspApiConnection.v2.search.doFulltextSearchCountQuery(query, 0);
}
