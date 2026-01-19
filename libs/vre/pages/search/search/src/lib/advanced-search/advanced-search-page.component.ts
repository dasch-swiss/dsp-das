import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { AdvancedSearchComponent, QueryObject } from '@dasch-swiss/vre/pages/search/advanced-search';
import { CenteredLayoutComponent } from '@dasch-swiss/vre/ui/ui';

@Component({
  selector: 'app-advanced-search-page',
  template: ` <app-centered-layout>
    <app-advanced-search [projectUuid]="uuid" (gravesearchQuery)="onSearch($event)" />
  </app-centered-layout>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CenteredLayoutComponent, AdvancedSearchComponent],
})
export class AdvancedSearchPageComponent implements OnInit {
  uuid: string;

  constructor(
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _location: Location
  ) {}

  ngOnInit(): void {
    this.uuid = this._route.parent.snapshot.params.uuid;
  }

  onSearch(queryObject: QueryObject): void {
    const route = `./${RouteConstants.advancedSearch}/${RouteConstants.gravSearch}/${encodeURIComponent(queryObject.query)}`;
    this._router.navigate([route], { relativeTo: this._route.parent });
  }

  onBackClicked(): void {
    this._location.back();
  }
}
