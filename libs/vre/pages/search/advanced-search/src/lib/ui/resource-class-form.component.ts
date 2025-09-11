import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { ApiData, PropertyFormItem } from '../model';
import { AdvancedSearchDataService } from '../service/advanced-search-data.service';
import { SearchStateService } from '../service/search-state.service';
import { SEARCH_ALL_RESOURCE_CLASSES_OPTION } from '../util';

@Component({
  selector: 'app-resource-class-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSelectModule],
  template: `
    <mat-form-field style="width: 100%">
      <mat-label>Resource class</mat-label>
      <mat-select
        (selectionChange)="onSelectedResourceClassChanged($event.value)"
        [compareWith]="compareApiDataObjects"
        [value]="(selectedResourceClass$ | async) || searchAllResourceClassesOption">
        <mat-option [value]="searchAllResourceClassesOption">{{ searchAllResourceClassesOption.label }}</mat-option>
        @for (resClass of resourceClasses$ | async; track resClass.iri) {
          <mat-option [value]="resClass">{{ resClass.label }}</mat-option>
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
export class ResourceClassFormComponent {
  private dataService = inject(AdvancedSearchDataService);
  private searchStateService = inject(SearchStateService);

  readonly searchAllResourceClassesOption = SEARCH_ALL_RESOURCE_CLASSES_OPTION;

  resourceClasses$ = this.dataService.resourceClasses$;
  selectedResourceClass$ = this.dataService.selectedResourceClass$;

  onSelectedResourceClassChanged(resourceClass: ApiData = SEARCH_ALL_RESOURCE_CLASSES_OPTION): void {
    this.dataService.setSelectedResourceClass(resourceClass);
    this.searchStateService.clearPropertySelections();
  }

  compareApiDataObjects(object1: ApiData, object2: ApiData) {
    return object1 && object2 && object1.iri == object2.iri;
  }
}
