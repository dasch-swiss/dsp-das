import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { Constants, KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ResourceBrowserComponent } from '@dasch-swiss/vre/pages/data-browser';
import { combineLatest, map, startWith, switchMap, take } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { IriLabelPair, Predicate, ResourceClassData } from '../model';
import { GravsearchService } from '../service/gravsearch.service';
import { OntologyDataService } from '../service/ontology-data.service';
import { PropertyOption } from './editor-panel/editor-panel.component';
import { FilterChipData, PropertyType } from './models';
import { ResourceClassChipsComponent } from './resource-class-chips/resource-class-chips.component';

@Component({
  selector: 'app-filter-chips-page',
  standalone: true,
  imports: [
    CommonModule,
    ResourceClassChipsComponent,
    ResourceBrowserComponent,
    MatDialogModule,
    MatIconModule,
    MatProgressBarModule,
    MatSelectModule,
  ],
  template: `
    <div class="filter-chips-page">
      <!-- Filter section -->
      <div class="filter-section">
        @if (ontologyLoading$ | async) {
          <mat-progress-bar mode="indeterminate" />
        } @else {
          <div class="ontology-selector">
            <mat-form-field appearance="outline">
              <mat-label>Ontology</mat-label>
              <mat-select
                [value]="(selectedOntology$ | async)?.iri"
                (selectionChange)="onOntologyChange($event.value)">
                @for (ont of ontologies$ | async; track ont.iri) {
                  <mat-option [value]="ont.iri">{{ ont.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          @if ((resourceClasses$ | async)?.length) {
            <app-resource-class-chips
              [resourceClasses]="resourceClasses$ | async"
              [selectedClasses]="selectedClasses"
              [statements]="statements"
              [propertiesByClass]="propertiesByClass"
              (classSelect)="onClassSelect($event)"
              (classDeselect)="onClassDeselect($event)"
              (clearAll)="onClearAll()"
              (statementApply)="onStatementApply($event)"
              (statementRemove)="onStatementRemove($event)" />
          }
        }
      </div>

      <!-- Results section -->
      <div class="results-section">
        @if (isLoading) {
          <mat-progress-bar mode="indeterminate" />
        }
        @if (resources && resources.length > 0) {
          <app-resource-browser [data]="{ resources: resources, selectFirstResource: false }" />
        } @else if (!isLoading) {
          <div class="no-results">
            <mat-icon>search</mat-icon>
            <p>Select a resource class or add filters to search</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .filter-chips-page {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 24px;
        gap: 24px;
      }

      .filter-section {
        flex-shrink: 0;
      }

      .ontology-selector {
        margin-bottom: 16px;
      }

      .ontology-selector mat-form-field {
        width: 300px;
      }

      .results-section {
        flex: 1;
        overflow: auto;
        min-height: 0;
      }

      .no-results {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px;
        color: rgba(0, 0, 0, 0.54);
      }

      .no-results mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      .no-results p {
        font-size: 16px;
        margin: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [OntologyDataService, GravsearchService],
})
export class FilterChipsPageComponent implements OnInit {
  private readonly ontologyService = inject(OntologyDataService);
  private readonly gravsearchService = inject(GravsearchService);
  private readonly dspApiConnection = inject<KnoraApiConnection>(DspApiConnectionToken);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  statements: FilterChipData[] = [];
  selectedClasses: Set<string> = new Set();
  propertiesByClass: Map<string, PropertyOption[]> = new Map();
  isLoading = false;
  resources: any[] = [];

  ontologies$ = this.ontologyService.ontologies$;
  selectedOntology$ = this.ontologyService.selectedOntology$.pipe(
    map(ont => (ont ? { iri: ont.id, label: ont.label || '' } : null))
  );

  resourceClasses$ = this.ontologyService.resourceClasses$;

  ontologyLoading$ = combineLatest([
    this.ontologyService.ontologyLoading$,
    this.ontologies$.pipe(startWith([])),
  ]).pipe(map(([loading, ontologies]) => loading && ontologies.length === 0));

  ngOnInit(): void {
    const projectUuid = this.route.parent?.snapshot.params['uuid'];
    if (projectUuid) {
      this.ontologyService.init(`http://rdfh.ch/projects/${projectUuid}`);
    }

    // Load properties for each resource class
    this.resourceClasses$.subscribe(classes => {
      for (const rc of classes) {
        this.loadPropertiesForClass(rc.iri);
      }
    });

    // Do an initial search when ontology loads
    this.ontologyService.selectedOntology$
      .pipe(
        switchMap(() => this.resourceClasses$.pipe(take(1)))
      )
      .subscribe(classes => {
        if (classes.length > 0) {
          // Auto-select first class and search
          this.selectedClasses.add(classes[0].iri);
          this.executeSearch();
        }
      });
  }

  onOntologyChange(ontologyIri: string): void {
    this.ontologyService.setOntology(ontologyIri);
    this.statements = [];
    this.selectedClasses.clear();
    this.propertiesByClass.clear();
    this.resources = [];
  }

  onClassSelect(resourceClass: ResourceClassData): void {
    this.selectedClasses.add(resourceClass.iri);
    this.loadPropertiesForClass(resourceClass.iri);
    this.executeSearch();
    this.cdr.markForCheck();
  }

  onClassDeselect(classIri: string): void {
    this.selectedClasses.delete(classIri);
    this.executeSearch();
    this.cdr.markForCheck();
  }

  onClearAll(): void {
    this.selectedClasses.clear();
    this.statements = [];
    this.resources = [];
    this.cdr.markForCheck();
  }

  onStatementApply(statementData: Partial<FilterChipData>): void {
    if (statementData.id) {
      const index = this.statements.findIndex(s => s.id === statementData.id);
      if (index !== -1) {
        this.statements[index] = { ...this.statements[index], ...statementData } as FilterChipData;
        this.statements = [...this.statements];
      }
    } else {
      const newStatement: FilterChipData = {
        id: uuidv4(),
        resourceClassIri: statementData.resourceClassIri!,
        resourceClassLabel: statementData.resourceClassLabel!,
        propertyIri: statementData.propertyIri!,
        propertyLabel: statementData.propertyLabel!,
        propertyType: statementData.propertyType!,
        operatorIri: statementData.operatorIri!,
        operatorLabel: statementData.operatorLabel!,
        value: statementData.value ?? null,
        valueLabel: statementData.valueLabel ?? '',
      };
      this.statements = [...this.statements, newStatement];

      if (!this.selectedClasses.has(newStatement.resourceClassIri)) {
        this.selectedClasses.add(newStatement.resourceClassIri);
      }
    }

    this.executeSearch();
    this.cdr.markForCheck();
  }

  onStatementRemove(statementId: string): void {
    this.statements = this.statements.filter(s => s.id !== statementId);
    this.executeSearch();
    this.cdr.markForCheck();
  }

  private loadPropertiesForClass(classIri: string): void {
    if (this.propertiesByClass.has(classIri)) return;

    this.ontologyService
      .getProperties$(classIri)
      .pipe(
        startWith([]),
        map(predicates => predicates.map(p => this.predicateToPropertyOption(p)))
      )
      .subscribe(properties => {
        this.propertiesByClass.set(classIri, properties);
        this.propertiesByClass = new Map(this.propertiesByClass);
        this.cdr.markForCheck();
      });
  }

  private executeSearch(): void {
    if (this.selectedClasses.size === 0) {
      this.resources = [];
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    // Build a simple gravsearch query for the selected classes
    const classIri = Array.from(this.selectedClasses)[0]; // For now, just use first selected class
    const query = this.buildSimpleQuery(classIri);

    this.dspApiConnection.v2.search
      .doExtendedSearch(query)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.resources = response.resources;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.resources = [];
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  private buildSimpleQuery(classIri: string): string {
    return `
PREFIX knora-api: <http://api.knora.org/ontology/knora-api/v2#>

CONSTRUCT {
  ?mainRes knora-api:isMainResource true .
} WHERE {
  ?mainRes a <${classIri}> .
}
OFFSET 0
    `.trim();
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
