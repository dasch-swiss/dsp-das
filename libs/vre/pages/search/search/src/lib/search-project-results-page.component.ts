import { Component, Inject, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-search-project-results-page',
  template: `GOOD`,
})
export class SearchProjectResultsPageComponent implements OnInit {
  search!: {
    query: string;
    filter?: string;
  };
  constructor(private _route: ActivatedRoute,
              @Inject(DspApiConnectionToken)
              private _dspApiConnection: KnoraApiConnection
              ) {}

  ngOnInit() {
    this._route.params.subscribe(params => {
      console.log('asd', params);
      this.search = {
        query: params['q'];
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
      .subscribe();
  }
}
