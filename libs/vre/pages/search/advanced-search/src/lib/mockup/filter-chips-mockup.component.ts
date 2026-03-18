import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { Constants } from '@dasch-swiss/dsp-js';
import { map, startWith } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Predicate } from '../model';
import { OntologyDataService } from '../service/ontology-data.service';
import { ChipBarComponent } from './chip-bar/chip-bar.component';
import { EditorPanelComponent, PropertyOption } from './editor-panel/editor-panel.component';
import { FilterChipData, PropertyType } from './models';
import { ResultsPlaceholderComponent } from './results-placeholder.component';

@Component({
  selector: 'app-filter-chips-mockup',
  standalone: true,
  imports: [
    CommonModule,
    ChipBarComponent,
    EditorPanelComponent,
    ResultsPlaceholderComponent,
    MatProgressBarModule,
    MatSelectModule,
  ],
  template: `
    <div class="mockup-container">
      <div class="mockup-header">
        <h2>Advanced Search (Filter Chips Mockup)</h2>
        <span class="mockup-badge">Mockup</span>
      </div>

      @if (ontologyLoading$ | async) {
        <mat-progress-bar mode="indeterminate" />
      } @else {
        <div class="ontology-selector">
          <mat-form-field appearance="outline">
            <mat-label>Ontology</mat-label>
            <mat-select [value]="(selectedOntology$ | async)?.iri" (selectionChange)="onOntologyChange($event.value)">
              @for (ont of ontologies$ | async; track ont.iri) {
                <mat-option [value]="ont.iri">{{ ont.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <app-chip-bar
          [filters]="filters"
          [editingFilterId]="editingFilterId"
          [isAddingFilter]="isAddingFilter"
          (editFilter)="onEditFilter($event)"
          (removeFilter)="onRemoveFilter($event)"
          (toggleAdd)="onToggleAdd()" />

        @if (isEditorOpen) {
          <app-editor-panel
            [editingFilter]="editingFilter"
            [availableProperties]="propertyOptions$ | async"
            (apply)="onApplyFilter($event)"
            (cancelEdit)="onCloseEditor()" />
        }

        @if (isLoading) {
          <mat-progress-bar mode="indeterminate" class="loading-bar" />
        }

        <app-results-placeholder [resultCount]="mockResultCount" [hasFilters]="filters.length > 0" />
      }
    </div>
  `,
  styles: [
    `
      .mockup-container {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .mockup-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 24px;
      }

      .mockup-header h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 400;
      }

      .mockup-badge {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        background: rgba(255, 152, 0, 0.15);
        color: #f57c00;
        border-radius: 4px;
      }

      .ontology-selector {
        margin-bottom: 16px;
      }

      .ontology-selector mat-form-field {
        width: 300px;
      }

      .loading-bar {
        margin-top: 8px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [OntologyDataService],
})
export class FilterChipsMockupComponent implements OnInit {
  private readonly ontologyService = inject(OntologyDataService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  filters: FilterChipData[] = [];
  editingFilterId: string | null = null;
  editingFilter: FilterChipData | undefined;
  isAddingFilter = false;
  isLoading = false;
  mockResultCount = 0;

  ontologies$ = this.ontologyService.ontologies$;
  ontologyLoading$ = this.ontologyService.ontologyLoading$;
  selectedOntology$ = this.ontologyService.selectedOntology$.pipe(
    map(ont => (ont ? { iri: ont.id, label: ont.label || '' } : null))
  );

  propertyOptions$ = this.ontologyService.getProperties$().pipe(
    startWith([]),
    map(predicates => predicates.map(p => this.predicateToPropertyOption(p)))
  );

  get isEditorOpen(): boolean {
    return this.isAddingFilter || this.editingFilterId !== null;
  }

  ngOnInit(): void {
    const projectUuid = this.route.snapshot.paramMap.get('uuid');
    if (projectUuid) {
      this.ontologyService.init(`http://rdfh.ch/projects/${projectUuid}`);
    }
  }

  onOntologyChange(ontologyIri: string): void {
    this.ontologyService.setOntology(ontologyIri);
    this.filters = [];
    this.closeEditor();
  }

  onToggleAdd(): void {
    if (this.isAddingFilter) {
      this.closeEditor();
    } else {
      this.editingFilterId = null;
      this.editingFilter = undefined;
      this.isAddingFilter = true;
    }
  }

  onEditFilter(filter: FilterChipData): void {
    this.isAddingFilter = false;
    this.editingFilterId = filter.id;
    this.editingFilter = filter;
  }

  onRemoveFilter(filter: FilterChipData): void {
    this.filters = this.filters.filter(f => f.id !== filter.id && f.parentId !== filter.id);
    if (this.editingFilterId === filter.id) {
      this.closeEditor();
    }
    this.simulateAutoExecute();
  }

  onApplyFilter(filterData: Partial<FilterChipData>): void {
    if (filterData.id) {
      const index = this.filters.findIndex(f => f.id === filterData.id);
      if (index !== -1) {
        this.filters[index] = { ...this.filters[index], ...filterData } as FilterChipData;
        this.filters = [...this.filters];
      }
    } else {
      const newFilter: FilterChipData = {
        id: uuidv4(),
        propertyIri: filterData.propertyIri!,
        propertyLabel: filterData.propertyLabel!,
        propertyType: filterData.propertyType!,
        operatorIri: filterData.operatorIri!,
        operatorLabel: filterData.operatorLabel!,
        value: filterData.value ?? null,
        valueLabel: filterData.valueLabel ?? '',
      };
      this.filters = [...this.filters, newFilter];
    }

    this.closeEditor();
    this.simulateAutoExecute();
  }

  onCloseEditor(): void {
    this.closeEditor();
  }

  private closeEditor(): void {
    this.isAddingFilter = false;
    this.editingFilterId = null;
    this.editingFilter = undefined;
  }

  private simulateAutoExecute(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    setTimeout(() => {
      this.isLoading = false;
      this.mockResultCount = this.filters.length > 0 ? Math.floor(Math.random() * 100) + 1 : 0;
      this.cdr.markForCheck();
    }, 800);
  }

  private predicateToPropertyOption(predicate: Predicate): PropertyOption {
    return {
      iri: predicate.iri,
      label: predicate.label,
      objectType: this.getPropertyType(predicate.objectValueType, predicate.isLinkProperty),
    };
  }

  private getPropertyType(objectValueType: string, isLinkProperty: boolean): PropertyType {
    if (isLinkProperty) {
      return 'link';
    }

    switch (objectValueType) {
      case Constants.TextValue:
        return 'text';
      case Constants.DateValue:
        return 'date';
      case Constants.IntValue:
        return 'integer';
      case Constants.DecimalValue:
        return 'decimal';
      case Constants.BooleanValue:
        return 'boolean';
      case Constants.ListValue:
        return 'list';
      case Constants.UriValue:
        return 'uri';
      default:
        return 'text';
    }
  }
}
