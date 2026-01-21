import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { ActivatedRoute } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { CenteredLayoutComponent } from '@dasch-swiss/vre/ui/ui';
import { AdvancedSearchResultsComponent } from './advanced-search-results.component';
import { AdvancedSearchComponent } from './advanced-search.component';
import { QueryObject } from './model';

@Component({
  selector: 'app-advanced-search-page',
  template: ` <div class="whole-height" style="display: flex; justify-content: space-around; flex-direction: column">
    <div style="height: 233px">
      <div [class.myoverlay]="query" [ngClass]="{ 'mat-elevation-z1': query }">
        <app-centered-layout>
          <app-advanced-search
            [projectUuid]="uuid"
            (gravesearchQuery)="onSearch($event)"
            style="min-width: 960px; padding-left: 16px; padding-right: 16px;" />
        </app-centered-layout>
      </div>
    </div>
    @if (query) {
      <mat-divider [vertical]="true" />
      <app-advanced-search-results-page [query]="query" style="flex: 1" />
    }
  </div>`,
  styleUrls: ['./advanced-search-page.component.scss'],
  imports: [AdvancedSearchComponent, AdvancedSearchResultsComponent, MatDivider, CenteredLayoutComponent, NgClass],
})
export class AdvancedSearchPageComponent {
  uuid = this._route.parent!.snapshot.params[RouteConstants.uuidParameter];
  query?: string;

  constructor(private readonly _route: ActivatedRoute) {}

  onSearch(queryObject: QueryObject): void {
    this.query = queryObject.query;
  }
}
