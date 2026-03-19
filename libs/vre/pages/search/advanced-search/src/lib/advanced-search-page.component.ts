import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { CenteredLayoutComponent } from '@dasch-swiss/vre/ui/ui';
import { AdvancedSearchComponent } from './advanced-search.component';

@Component({
  selector: 'app-advanced-search-page',
  template: `
    <app-centered-layout>
      <app-advanced-search
        [projectUuid]="uuid"
        [isVerticalDirection]="undefined"
        (gravsearchQuery)="onSearch($event)" />
    </app-centered-layout>
  `,
  imports: [CenteredLayoutComponent, AdvancedSearchComponent],
})
export class AdvancedSearchPageComponent {
  uuid = this._route.parent?.snapshot.params[RouteConstants.uuidParameter] ?? '';

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _router: Router
  ) {}

  onSearch(query: string): void {
    this._router.navigate(['results'], {
      relativeTo: this._route,
      queryParams: { q: query },
    });
  }
}
