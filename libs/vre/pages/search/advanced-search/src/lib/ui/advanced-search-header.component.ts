import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { filter, take } from 'rxjs';
import { AdvancedSearchDataService } from '../service/advanced-search-data.service';
import { PreviousSearchService } from '../service/previous-search.service';
import { SearchStateService } from '../service/search-state.service';

@Component({
  selector: 'app-advanced-search-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, TranslateModule],
  template: `
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
      <div style="display: flex; align-items: center; gap: 1em;">
        <h2>{{ 'pages.search.advancedSearch.title' | translate }}</h2>
        <button
          [disabled]="!previousSearchService.hasPreviousSearch()"
          mat-stroked-button
          color="primary"
          (click)="loadPreviousSearch()">
          {{ 'pages.search.advancedSearch.usePreviousSearch' | translate }}
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvancedSearchHeaderComponent {
  previousSearchService = inject(PreviousSearchService);
  private _dataService = inject(AdvancedSearchDataService);
  protected _searchState = inject(SearchStateService);

  loadPreviousSearch(): void {
    const previousSearch = this.previousSearchService.previousSearchObject;

    // First, set the ontology (triggers loading)
    this._dataService.setOntology(previousSearch.selectedOntology?.iri || '');

    // Then, wait for ontology to finish loading before updating state
    this._dataService.ontologyLoading$
      .pipe(
        filter(loading => !loading), // if completed
        take(1) // Take first 'false' value
      )
      .subscribe(() => {
        if (previousSearch.selectedResourceClass) {
          console.log('Loading previous search, setting resource class to:', previousSearch.selectedResourceClass);
          console.log('Previous search object:', previousSearch);
        }

        // Now that ontology is loaded, update the state
        this._searchState.patchState({
          ...previousSearch,
        });
      });
  }
}
