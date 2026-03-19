import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { AdvancedSearchResultsComponent } from './advanced-search-results.component';
import { FilterChipsFormComponent } from './mockup/filter-chips-form/filter-chips-form.component';
import { QueryExecutionService } from './service/query-execution.service';

@Component({
  selector: 'app-advanced-search-page',
  standalone: true,
  template: `
    <div class="advanced-search-page">
      <app-filter-chips-form
        [projectUuid]="uuid"
        (gravsearchQuery)="onSearch($event)" />

      @if (query) {
        <app-advanced-search-results [query]="query" />
      }
    </div>
  `,
  styles: [
    `
      .advanced-search-page {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      app-filter-chips-form {
        flex-shrink: 0;
      }

      app-advanced-search-results {
        flex: 1;
        min-height: 0;
        overflow: auto;
      }
    `,
  ],
  imports: [AdvancedSearchResultsComponent, FilterChipsFormComponent],
  providers: [QueryExecutionService],
})
export class AdvancedSearchPageComponent implements OnInit {
  uuid = this._route.parent?.snapshot.params[RouteConstants.uuidParameter] ?? '';
  query?: string;

  constructor(
    private readonly _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    const initialQuery = this._route.snapshot.queryParamMap.get('q');
    if (initialQuery) {
      this.query = initialQuery;
    }
  }

  onSearch(query: string): void {
    this.query = query;
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: { q: query },
      queryParamsHandling: 'merge',
    });
  }
}
