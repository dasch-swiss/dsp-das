import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { QueryObject, SearchStateService } from '@dasch-swiss/vre/pages/search/advanced-search';

@Component({
  selector: 'app-advanced-search-container',
  templateUrl: './advanced-search-container.component.html',
  styleUrls: ['./advanced-search-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SearchStateService],
})
export class AdvancedSearchContainerComponent implements OnInit {
  uuid!: string;

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
