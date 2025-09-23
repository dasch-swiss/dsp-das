import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { SearchParams } from '../search-params.interface';

@Component({
  selector: 'app-header-search',
  template: `
    <button mat-icon-button><mat-icon>search</mat-icon></button>
    @if (false) {
      <form>
        <mat-form-field appearance="outline" class="search-field">
          <input matInput />
          <button mat-icon-button matSuffix aria-label="Search">
            <mat-icon>search</mat-icon>
          </button>
        </mat-form-field>
      </form>
    }
  `,
})
export class HeaderSearchComponent {
  searchParams: any;
  constructor(private _router: Router) {}
  doSearch(search: SearchParams) {
    // reset search params
    this.searchParams = undefined;

    // we can do the routing here or send the search param
    // to (resource) list view directly
    this.searchParams = search;

    if (this.searchParams.mode && this.searchParams.query) {
      let doSearchRoute = `/${RouteConstants.search}/${this.searchParams.mode}/${this.searchParams.query}`;

      if (this.searchParams.filter && this.searchParams.filter.limitToProject) {
        doSearchRoute += `/${encodeURIComponent(this.searchParams.filter.limitToProject)}`;
      }

      this._router.navigateByUrl('/').then(() => this._router.navigate([doSearchRoute]));
    }
  }
}
