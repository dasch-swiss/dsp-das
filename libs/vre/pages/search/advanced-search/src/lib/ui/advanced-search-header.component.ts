import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { AdvancedSearchDataService } from '../service/advanced-search-data.service';
import { PreviousSearchService } from '../service/previous-search.service';
import { SearchStateService } from '../service/search-state.service';

@Component({
  selector: 'app-advanced-search-header',
  standalone: true,
  imports: [MatButtonModule, TranslateModule],
  template: `
    <h2>{{ 'pages.search.advancedSearch.title' | translate }}</h2>
    <button
      [disabled]="!previousSearchService.hasPreviousSearch()"
      mat-stroked-button
      color="primary"
      (click)="loadPreviousSearch()">
      {{ 'pages.search.advancedSearch.usePreviousSearch' | translate }}
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvancedSearchHeaderComponent {
  previousSearchService = inject(PreviousSearchService);
  private _dataService = inject(AdvancedSearchDataService);
  private _searchState = inject(SearchStateService);

  loadPreviousSearch(): void {
    const previousSearch = this.previousSearchService.previousSearchObject;
    this._searchState.patchState({
      ...previousSearch,
    });
    this._dataService.setOntology(previousSearch.selectedOntology?.iri || '');
    if (previousSearch.selectedResourceClass) {
      this._dataService.setSelectedResourceClass(previousSearch.selectedResourceClass);
    }
  }
}
