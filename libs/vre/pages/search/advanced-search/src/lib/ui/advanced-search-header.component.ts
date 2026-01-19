import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { filter, take } from 'rxjs';
import { OntologyDataService } from '../service/ontology-data.service';
import { PreviousSearchService } from '../service/previous-search.service';
import { SearchStateService } from '../service/search-state.service';

@Component({
  selector: 'app-advanced-search-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, TranslateModule],
  template: `
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
      <div style="display: flex; align-items: center; gap: 1em;">
        <h2>Use previous search</h2>
        <button
          [disabled]="!previousSearchService.hasPreviousSearch()"
          mat-stroked-button
          color="primary"
          (click)="loadPreviousSearch()">
          use previous search
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvancedSearchHeaderComponent {
  previousSearchService = inject(PreviousSearchService);
  private _dataService = inject(OntologyDataService);
  protected _searchState = inject(SearchStateService);

  loadPreviousSearch(): void {
    const previousSearch = this.previousSearchService.previousSearchObject;
    console.log('Loading previous search:', previousSearch);
    if (!previousSearch) {
      return;
    }
    this._dataService.setOntology(previousSearch.selectedOntology!.iri);

    this._dataService.ontologyLoading$
      .pipe(
        filter(loading => !loading),
        take(1)
      )
      .subscribe(() => {
        this._searchState.patchState({
          ...previousSearch,
        });
      });
  }
}
