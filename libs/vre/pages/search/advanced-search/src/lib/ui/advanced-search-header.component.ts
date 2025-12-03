import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
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
      <div style="display: flex; gap: 0.5em;">
        <button
          mat-icon-button
          [disabled]="!(_searchState.canUndo$ | async)"
          (click)="_searchState.undoLastChange()"
          matTooltip="Undo last change">
          <mat-icon>undo</mat-icon>
        </button>
        <button
          mat-icon-button
          [disabled]="!(_searchState.canRedo$ | async)"
          (click)="_searchState.redoLastChange()"
          matTooltip="Redo last change">
          <mat-icon>redo</mat-icon>
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
    this._searchState.patchState({
      ...previousSearch,
    });
    this._dataService.setOntology(previousSearch.selectedOntology?.iri || '');
    if (previousSearch.selectedResourceClass) {
      console.log('Loading previous search, setting resource class to:', previousSearch.selectedResourceClass);
    }
  }
}
