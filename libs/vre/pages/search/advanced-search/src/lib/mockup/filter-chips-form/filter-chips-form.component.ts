import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { Constants } from '@dasch-swiss/dsp-js';
import { combineLatest, map, startWith } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Predicate, ResourceClassData } from '../../model';
import { OntologyDataService } from '../../service/ontology-data.service';
import { PropertyOption } from '../editor-panel/editor-panel.component';
import { FilterChipData, PropertyType } from '../models';
import { ResourceClassChipsComponent } from '../resource-class-chips/resource-class-chips.component';

@Component({
  selector: 'app-filter-chips-form',
  standalone: true,
  imports: [
    CommonModule,
    ResourceClassChipsComponent,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressBarModule,
    MatSelectModule,
  ],
  template: `
    @if (ontologyLoading$ | async) {
      <mat-progress-bar mode="indeterminate" />
    } @else {
      <div class="filter-chips-form">
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
      </div>
    }
  `,
  styles: [
    `
      .filter-chips-form {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
      }

      app-resource-class-chips {
        flex: 1;
        min-width: 0;
      }

      .ontology-selector {
        flex-shrink: 0;
      }

      .ontology-selector mat-form-field {
        width: 280px;
      }

      /* Remove bottom margin from mat-form-field wrapper */
      .ontology-selector ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        display: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [OntologyDataService],
})
export class FilterChipsFormComponent implements OnInit {
  private readonly ontologyService = inject(OntologyDataService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() projectUuid = '';
  @Output() gravsearchQuery = new EventEmitter<string>();

  statements: FilterChipData[] = [];
  selectedClasses: Set<string> = new Set();
  propertiesByClass: Map<string, PropertyOption[]> = new Map();

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
    if (this.projectUuid) {
      this.ontologyService.init(`http://rdfh.ch/projects/${this.projectUuid}`);
    }

    // Load properties for each resource class
    this.resourceClasses$.subscribe(classes => {
      for (const rc of classes) {
        this.loadPropertiesForClass(rc.iri);
      }
    });
  }

  onOntologyChange(ontologyIri: string): void {
    this.ontologyService.setOntology(ontologyIri);
    this.statements = [];
    this.selectedClasses.clear();
    this.propertiesByClass.clear();
  }

  onClassSelect(resourceClass: ResourceClassData): void {
    this.selectedClasses.add(resourceClass.iri);
    this.loadPropertiesForClass(resourceClass.iri);
    this.emitQuery();
    this.cdr.markForCheck();
  }

  onClassDeselect(classIri: string): void {
    this.selectedClasses.delete(classIri);
    this.emitQuery();
    this.cdr.markForCheck();
  }

  onClearAll(): void {
    this.selectedClasses.clear();
    this.statements = [];
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

    this.emitQuery();
    this.cdr.markForCheck();
  }

  onStatementRemove(statementId: string): void {
    this.statements = this.statements.filter(s => s.id !== statementId);
    this.emitQuery();
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

  private emitQuery(): void {
    if (this.selectedClasses.size === 0) {
      return;
    }

    const classIri = Array.from(this.selectedClasses)[0];
    const query = this.buildSimpleQuery(classIri);
    this.gravsearchQuery.emit(query);
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
