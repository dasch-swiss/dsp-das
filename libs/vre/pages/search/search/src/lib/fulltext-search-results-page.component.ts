import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

@Component({
  selector: 'app-fulltext-search-results-page',
  template: `@if (query$ | async; as query) {
    <app-project-fulltext-search-result [query]="query" />
  } `,
})
export class FulltextSearchResultsPageComponent {
  query$ = this._route.params.pipe(map(v => v['query']));
  constructor(private _route: ActivatedRoute) {}
}
