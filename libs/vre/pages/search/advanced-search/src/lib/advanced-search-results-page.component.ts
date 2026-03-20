import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CenteredLayoutComponent } from '@dasch-swiss/vre/ui/ui';
import { AdvancedSearchResultsComponent } from './advanced-search-results.component';
import { QueryExecutionService } from './service/query-execution.service';

@Component({
  selector: 'app-advanced-search-results-page',
  template: `
    <app-centered-layout>
      <div class="results-header">
        <a mat-stroked-button [routerLink]="['..']">
          <mat-icon>arrow_back</mat-icon>
          {{ 'pages.search.resourcesList.backToSearchForm' | translate }}
        </a>
      </div>
      @if (query) {
        <app-advanced-search-results [query]="query" />
      }
    </app-centered-layout>
  `,
  styles: [
    `
      .results-header {
        margin-bottom: 16px;
      }
    `,
  ],
  imports: [CenteredLayoutComponent, AdvancedSearchResultsComponent, MatButtonModule, MatIconModule, RouterLink, TranslateModule],
  providers: [QueryExecutionService],
})
export class AdvancedSearchResultsPageComponent implements OnInit {
  query?: string;

  constructor(private readonly _route: ActivatedRoute) {}

  ngOnInit(): void {
    this.query = this._route.snapshot.queryParamMap.get('q') ?? undefined;
  }
}
