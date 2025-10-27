import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { filter, map } from 'rxjs';
import { ApiData } from '../model';
import { AdvancedSearchDataService } from '../service/advanced-search-data.service';
import { SearchStateService } from '../service/search-state.service';

@Component({
  selector: 'app-ontology-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSelectModule],
  template: `
    <mat-form-field>
      <mat-label>Data model</mat-label>
      <mat-select
        (selectionChange)="onSelectedOntologyChanged($event.value)"
        [value]="(selectedOntology$ | async)?.iri">
        @for (onto of ontologies$ | async; track onto.iri) {
          <mat-option [value]="onto.iri">{{ onto.label }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
  styles: [
    `
      mat-form-field {
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OntologyFormComponent {
  private dataService = inject(AdvancedSearchDataService);
  private searchStateService = inject(SearchStateService);

  ontologies$ = this.dataService.ontologies$;
  selectedOntology$ = this.dataService.selectedOntology$.pipe(
    filter(o => o !== null),
    map(o => ({ iri: o.id, label: o.label }) as ApiData)
  );

  onSelectedOntologyChanged(ontologyIri: string): void {
    this.dataService.setOntology(ontologyIri);
    this.searchStateService.clearAllSelections();
  }
}
