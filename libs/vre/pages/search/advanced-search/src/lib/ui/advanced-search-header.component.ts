import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter, take } from 'rxjs';
import { OntologyDataService } from '../service/ontology-data.service';
import { PreviousSearchService } from '../service/previous-search.service';
import { SearchStateService } from '../service/search-state.service';

@Component({
  selector: 'app-advanced-search-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, TranslateModule, RouterLink],
  template: `
    <div style="display: flex; align-items: center; gap: 8px">
      <h2 style="flex: 1">Advanced search</h2>
      <button
        [disabled]="!previousSearchService.hasPreviousSearch()"
        mat-stroked-button
        color="primary"
        (click)="loadPreviousSearch()">
        use previous search
      </button>

      <a mat-stroked-button [routerLink]="['..', 'search']">
        <mat-icon>swap_horiz</mat-icon>
        Switch to Fulltext search
      </a>
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
