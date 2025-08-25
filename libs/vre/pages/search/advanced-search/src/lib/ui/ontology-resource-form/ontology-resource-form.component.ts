import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { ApiData } from '../../data-access/advanced-search-service/advanced-search.service';

// Constant for the "Search all resource classes" option
export const SEARCH_ALL_RESOURCE_CLASSES_OPTION: ApiData = {
  iri: '',
  label: '[Search for all resource classes]',
};

@Component({
  selector: 'app-ontology-resource-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSelectModule],
  templateUrl: './ontology-resource-form.component.html',
  styleUrls: ['./ontology-resource-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OntologyResourceFormComponent implements AfterViewInit {
  @Input() ontologies: ApiData[] | null = []; // todo: handle null case in html
  @Input() ontologiesLoading: boolean | null = false;
  @Input() resourceClasses: ApiData[] = [];
  @Input() resourceClassesLoading: boolean | null = false;

  // Make the constant available in the template
  searchAllResourceClassesOption = SEARCH_ALL_RESOURCE_CLASSES_OPTION;

  @Input() set selectedOntology(ontology: ApiData | null | undefined) {
    if (!this.ontologiesList) return;
    if (ontology) {
      this.ontologiesList.value = ontology;
    } else {
      this.ontologiesList.value = '';
    }
  }

  @Input() set selectedResourceClass(resourceClass: ApiData | null | undefined) {
    if (!this.resourceClassesList) return;
    if (resourceClass) {
      this.resourceClassesList.value = resourceClass;
    } else {
      // Default to "Search all resource classes" option when no resource class is selected
      this.resourceClassesList.value = SEARCH_ALL_RESOURCE_CLASSES_OPTION;
    }
  }

  @Output() emitSelectedOntology = new EventEmitter<ApiData>();
  @Output() emitSelectedResourceClass = new EventEmitter<ApiData | undefined>();

  @ViewChild('ontologiesList') ontologiesList!: MatSelect;
  @ViewChild('resourceClassesList') resourceClassesList!: MatSelect;

  ngAfterViewInit(): void {
    // Set the default value to "Search all resource classes" if no value is already set
    if (!this.resourceClassesList.value) {
      this.resourceClassesList.value = SEARCH_ALL_RESOURCE_CLASSES_OPTION;
    }
  }

  onSelectedOntologyChanged(): void {
    const selectedOntology = this.ontologiesList.value;
    this.emitSelectedOntology.emit(selectedOntology);
  }

  onSelectedResourceClassChanged(): void {
    const selectedResourceClass = this.resourceClassesList.value;
    // If the "Search all resource classes" option is selected, emit undefined
    // Otherwise emit the selected resource class
    if (selectedResourceClass === SEARCH_ALL_RESOURCE_CLASSES_OPTION) {
      this.emitSelectedResourceClass.emit(undefined);
    } else {
      this.emitSelectedResourceClass.emit(selectedResourceClass);
    }
  }

  compareApiDataObjects(object1: ApiData, object2: ApiData) {
    return object1 && object2 && object1.iri == object2.iri;
  }
}
