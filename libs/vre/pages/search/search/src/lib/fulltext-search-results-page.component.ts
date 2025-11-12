import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { UserService } from '@dasch-swiss/vre/core/session';
import { map } from 'rxjs';

@Component({
  selector: 'app-fulltext-search-results-page',
  template: `@if (query$ | async; as query) {
    <app-project-fulltext-search-result [query]="query" [hasRightsToShowCreateLinkObject$]="userService.isSysAdmin$" />
  } `,
  standalone: false,
})
export class FulltextSearchResultsPageComponent {
  query$ = this._route.params.pipe(map(v => v[RouteConstants.qParameter]));
  constructor(
    private readonly _route: ActivatedRoute,
    public readonly userService: UserService
  ) {}
}
