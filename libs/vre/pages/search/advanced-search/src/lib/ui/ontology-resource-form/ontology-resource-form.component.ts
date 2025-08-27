import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { ApiData } from '../../model';
import { SearchStateService } from '../../service/search-state.service';
import { SEARCH_ALL_RESOURCE_CLASSES_OPTION } from '../../util';

@Component({
  selector: 'app-ontology-resource-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSelectModule],
  template: `<mat-form-field style="width: 100%">
      <mat-label>Data model</mat-label>
      <mat-select
        #ontologiesList
        (selectionChange)="onSelectedOntologyChanged($event.value)"
        [compareWith]="compareApiDataObjects"
        [value]="selectedOntology$ | async">
        <mat-option *ngFor="let onto of ontologies$ | async" [value]="onto"> {{ onto.label }} </mat-option>
      </mat-select>
    </mat-form-field>
    <mat-form-field style="width: 100%">
      <mat-label>Resource class</mat-label>
      <mat-select
        #resourceClassesList
        (selectionChange)="onSelectedResourceClassChanged($event.value)"
        [compareWith]="compareApiDataObjects"
        [value]="(selectedResourceClass$ | async) || searchAllResourceClassesOption">
        <mat-option [value]="searchAllResourceClassesOption">{{ searchAllResourceClassesOption.label }}</mat-option>
        <mat-option *ngFor="let resClass of resourceClasses$ | async" [value]="resClass">
          {{ resClass.label }}
        </mat-option>
      </mat-select>
    </mat-form-field>`,
  styleUrls: ['../advanced-search.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OntologyResourceFormComponent {
  private searchService = inject(SearchStateService);

  ontologies$ = this.searchService.ontologies$;
  resourceClasses$ = this.searchService.resourceClasses$;
  selectedOntology$ = this.searchService.selectedOntology$;
  selectedResourceClass$ = this.searchService.selectedResourceClass$;

  searchAllResourceClassesOption = SEARCH_ALL_RESOURCE_CLASSES_OPTION;

  @ViewChild('ontologiesList') ontologiesList!: MatSelect;
  @ViewChild('resourceClassesList') resourceClassesList!: MatSelect;

  onSelectedOntologyChanged(selected: ApiData): void {
    this.searchService.updateSelectedOntology(selected);
  }

  onSelectedResourceClassChanged(selected: ApiData = SEARCH_ALL_RESOURCE_CLASSES_OPTION): void {
    this.searchService.updateSelectedResourceClass(selected);
  }

  compareApiDataObjects(object1: ApiData, object2: ApiData) {
    return object1 && object2 && object1.iri == object2.iri;
  }
}
