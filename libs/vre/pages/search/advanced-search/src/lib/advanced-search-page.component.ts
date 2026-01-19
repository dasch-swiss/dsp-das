import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { CenteredLayoutComponent } from '@dasch-swiss/vre/ui/ui';
import { AdvancedSearchComponent } from './advanced-search.component';
import { QueryObject } from './model';

@Component({
  selector: 'app-advanced-search-page',
  template: ` <app-centered-layout>
    <app-advanced-search [projectUuid]="uuid" (gravesearchQuery)="onSearch($event)" />
  </app-centered-layout>`,
  imports: [CenteredLayoutComponent, AdvancedSearchComponent],
})
export class AdvancedSearchPageComponent {
  uuid = this._route.parent!.snapshot.params[RouteConstants.uuidParameter];

  constructor(
    private readonly _router: Router,
    private readonly _route: ActivatedRoute
  ) {}

  onSearch(queryObject: QueryObject): void {
    const route = `./${RouteConstants.advancedSearch}/${RouteConstants.gravSearch}/${encodeURIComponent(queryObject.query)}`;
    this._router.navigate([route], { relativeTo: this._route.parent });
  }
}
