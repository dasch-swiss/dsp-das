import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IFulltextSearchParams, KnoraApiConnection, ReadResource } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ResourceResultService } from '@dasch-swiss/vre/pages/data-browser';

@Component({
  selector: 'app-search-project-results-page',
  template: ` <app-multiple-viewer-gateway *ngIf="resources" [resources]="resources" [searchKeyword]="search.query" />`,
  providers: [ResourceResultService],
})
export class SearchProjectResultsPageComponent implements OnInit {
  resources: ReadResource[] = [];
  search!: {
    query: string;
    filter?: IFulltextSearchParams;
    projectUUid?: string;
  };

  constructor(
    private _route: ActivatedRoute,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection
  ) {}

  ngOnInit() {
    this._route.params.subscribe(params => {
      console.log('asd', params);
      this.search = {
        query: params['q'],
        filter: { limitToProject: decodeURIComponent(params['project']) },
      };
      this.test();
    });
  }

  test() {
    const index = 0;
    this._dspApiConnection.v2.search
      .doFulltextSearchCountQuery(this.search.query, index, this.search.filter)
      .subscribe();

    this._dspApiConnection.v2.search
      .doFulltextSearch(this.search.query, index, this.search.filter)
      .subscribe(response => {
        this.resources = response.resources;
      });
  }
}
