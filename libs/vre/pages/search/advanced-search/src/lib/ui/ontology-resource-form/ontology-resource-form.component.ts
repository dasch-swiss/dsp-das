import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { ApiData } from '../../model';
import { SearchStateService } from '../../service/search-state.service';
import { SEARCH_ALL_RESOURCE_CLASSES_OPTION } from '../../util';

@Component({
  selector: 'app-ontology-resource-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSelectModule],
  template: `<mat-form-field style="width: 100%">
      <mat-label>Data model</mat-label>
      <mat-select #ontologiesList (selectionChange)="onSelectedOntologyChanged()" [compareWith]="compareApiDataObjects">
        <mat-option *ngFor="let onto of ontologies$ | async" [value]="onto"> {{ onto.label }} </mat-option>
      </mat-select>
    </mat-form-field>
    <mat-form-field style="width: 100%">
      <mat-label>Resource class</mat-label>
      <mat-select
        #resourceClassesList
        (selectionChange)="onSelectedResourceClassChanged()"
        [compareWith]="compareApiDataObjects">
        <mat-option [value]="searchAllResourceClassesOption">{{ searchAllResourceClassesOption.label }}</mat-option>
        <mat-option *ngFor="let resClass of resourceClasses$ | async" [value]="resClass">
          {{ resClass.label }}
        </mat-option>
      </mat-select>
    </mat-form-field>`,
  styleUrls: ['../advanced-search.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OntologyResourceFormComponent implements AfterViewInit {
  private searchService = inject(SearchStateService);

  ontologies$ = this.searchService.ontologies$;
  resourceClasses$ = this.searchService.resourceClasses$;
  selectedOntology$ = this.searchService.selectedOntology$;
  selectedResourceClass$ = this.searchService.selectedResourceClass$;

  searchAllResourceClassesOption = SEARCH_ALL_RESOURCE_CLASSES_OPTION;

  @ViewChild('ontologiesList') ontologiesList!: MatSelect;
  @ViewChild('resourceClassesList') resourceClassesList!: MatSelect;

  ngAfterViewInit(): void {
    this.selectedOntology$
      .pipe(
        filter(() => !!this.ontologiesList),
        distinctUntilChanged()
      )
      .subscribe(ontology => {
        if (ontology) {
          this.ontologiesList.value = ontology;
        } else {
          this.ontologiesList.value = '';
        }
      });

    this.selectedResourceClass$
      .pipe(
        filter(() => !!this.resourceClassesList),
        distinctUntilChanged()
      )
      .subscribe(resourceClass => {
        if (resourceClass) {
          this.resourceClassesList.value = resourceClass;
        } else {
          // Default to "Search all resource classes" option when no resource class is selected
          this.resourceClassesList.value = SEARCH_ALL_RESOURCE_CLASSES_OPTION;
        }
      });

    // Set the default value to "Search all resource classes" if no value is already set
    if (!this.resourceClassesList.value) {
      this.resourceClassesList.value = SEARCH_ALL_RESOURCE_CLASSES_OPTION;
    }
  }

  onSelectedOntologyChanged(): void {
    const selectedOntology = this.ontologiesList.value;
    this.searchService.updateSelectedOntology(selectedOntology);
  }

  onSelectedResourceClassChanged(): void {
    const selectedResourceClass =
      this.resourceClassesList.value === SEARCH_ALL_RESOURCE_CLASSES_OPTION
        ? undefined
        : this.resourceClassesList.value;

    this.searchService.updateSelectedResourceClass(selectedResourceClass);
  }

  compareApiDataObjects(object1: ApiData, object2: ApiData) {
    return object1 && object2 && object1.iri == object2.iri;
  }
}
