import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { AdvancedSearchResultsComponent } from './advanced-search-results.component';
import { AdvancedSearchComponent } from './advanced-search.component';
import { QueryObject } from './model';

@Component({
  selector: 'app-advanced-search-page',
  template: `
    <div class="search-page-container">
      <button
        class="search-toggle-btn"
        color="primary"
        mat-raised-button
        type="button"
        [disabled]="!query"
        (click)="showSearchForm = !showSearchForm">
        {{ showSearchForm ? 'Hide search form' : 'Show search form' }}
        <mat-icon>{{ showSearchForm ? 'expand_less' : 'expand_more' }}</mat-icon>
      </button>

      <div class="search-card" [class.is-hidden]="!showSearchForm">
        <mat-card>
          <mat-card-content>
            <app-advanced-search [projectUuid]="uuid" (gravesearchQuery)="onSearch($event)" />
          </mat-card-content>
        </mat-card>
      </div>

      @if (query) {
        <div class="whole-height">
          <app-advanced-search-results-page [query]="query" />
        </div>
      }
    </div>
  `,
  styleUrls: ['./advanced-search-page.component.scss'],
  imports: [
    AdvancedSearchComponent,
    AdvancedSearchResultsComponent,
    MatButton,
    MatCard,
    MatCardContent,
    MatIcon,
    ReactiveFormsModule,
  ],
})
export class AdvancedSearchPageComponent {
  showSearchForm = true;
  uuid = this._route.parent!.snapshot.params[RouteConstants.uuidParameter];
  query?: string;

  constructor(private readonly _route: ActivatedRoute) {}

  onSearch(queryObject: QueryObject): void {
    this.query = queryObject.query;
    this.showSearchForm = false;
  }
}
