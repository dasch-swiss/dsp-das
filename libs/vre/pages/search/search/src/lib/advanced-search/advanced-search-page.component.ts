import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { QueryObject, SearchStateService } from '@dasch-swiss/vre/pages/search/advanced-search';

@Component({
  selector: 'app-advanced-search-page',
  template: ` <app-centered-layout>
    <app-advanced-search [uuid]="uuid" (emitGravesearchQuery)="onSearch($event)" />
  </app-centered-layout>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SearchStateService],
})
export class AdvancedSearchPageComponent implements OnInit {
  uuid: string;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.uuid = this._route.parent?.snapshot?.params['uuid'];
  }

  onSearch(queryObject: QueryObject): void {
    const route = `./${RouteConstants.advancedSearch}/${RouteConstants.gravSearch}/${encodeURIComponent(
      queryObject.query
    )}`;

    this._router.navigate([route], { relativeTo: this._route.parent });
  }
}
