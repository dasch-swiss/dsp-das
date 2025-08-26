import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, Input, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Constants } from '@dasch-swiss/dsp-js';
import { ApiData, PropertyData, PropertyFormItem, ResourceLabelObject } from '../../model';
import { Operators } from '../../service/operators.config';
import { SearchStateService } from '../../service/search-state.service';
import { PropertyFormLinkValueComponent } from './property-form-link-value/property-form-link-value.component';
import { PropertyFormListValueComponent } from './property-form-list-value/property-form-list-value.component';
import { PropertyFormValueComponent } from './property-form-value/property-form-value.component';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatTooltipModule,
    PropertyFormValueComponent,
    PropertyFormLinkValueComponent,
    PropertyFormListValueComponent,
  ],
  providers: [MatSelect],
  templateUrl: './property-form.component.html',
  styleUrls: ['./property-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyFormComponent implements AfterViewInit {
  private searchService = inject(SearchStateService);

  @Input() propertyFormItem: PropertyFormItem = {
    id: '',
    selectedProperty: undefined,
    selectedOperator: undefined,
    searchValue: undefined,
    operators: [],
    list: undefined,
  };

  // Observables from the service
  filteredProperties$ = this.searchService.filteredProperties$;
  propertiesLoading$ = this.searchService.propertiesLoading$;
  matchResourceClassesLoading$ = this.searchService.matchResourceClassesLoading$;
  resourcesSearchResultsLoading$ = this.searchService.resourcesSearchResultsLoading$;
  resourcesSearchResultsCount$ = this.searchService.resourcesSearchResultsCount$;
  resourcesSearchResults$ = this.searchService.resourcesSearchResults$;
  resourcesSearchNoResults$ = this.searchService.resourcesSearchNoResults$;

  @ViewChild('propertiesList') propertiesList!: MatSelect;
  @ViewChild('operatorsList') operatorsList!: MatSelect;
  @ViewChild('resourceClassList') resourceClassList!: MatSelect;
  @ViewChild('propertyFormValue')
  propertyFormValueComponent!: PropertyFormValueComponent;

  operators = Operators; // in order to use it in the template
  constants = Constants;

  // objectType is manually set so that it uses the KnoraApiV2 string for boolean checks later
  resourceLabelObj = ResourceLabelObject;

  ngAfterViewInit(): void {
    if (this.propertiesList && this.propertyFormItem.selectedProperty) {
      this.propertiesList.value = this.propertyFormItem.selectedProperty;
    }

    if (this.operatorsList && this.propertyFormItem.selectedOperator) {
      this.operatorsList.value = this.propertyFormItem.selectedOperator;
    }

    if (this.resourceClassList && this.propertyFormItem.selectedMatchPropertyResourceClass) {
      this.resourceClassList.value = this.propertyFormItem.selectedMatchPropertyResourceClass;
    }
  }

  onSelectedPropertyChanged(event: MatSelectChange): void {
    const propFormItem = this.propertyFormItem;
    if (propFormItem) {
      propFormItem.selectedProperty = event.value;

      // this isn't great but we need to reset the value of the input control
      // because the input will not clear itself if the input switches to an input of the same type
      // i.e. from an integer input to a decimal input, the entered integer value will remain in the input
      if (this.propertyFormValueComponent) {
        this.propertyFormValueComponent.inputControl.setValue('');
      }

      // when the selected property changes, we need to reset the selected operator in the UI
      // because the selected operator might not be valid for the new selected property
      if (this.operatorsList) {
        this.operatorsList.value = undefined;
      }

      this.searchService.updateSelectedProperty(propFormItem);
    }
  }

  onSelectedOperatorChanged(event: MatSelectChange): void {
    const propFormItem = this.propertyFormItem;
    if (propFormItem) {
      propFormItem.selectedOperator = event.value;
      this.searchService.updateSelectedOperator(propFormItem);
    }
  }

  onSelectedMatchPropertyResourceClassChanged(event: MatSelectChange): void {
    const propFormItem = this.propertyFormItem;
    if (propFormItem) {
      propFormItem.selectedMatchPropertyResourceClass = event.value;
      this.searchService.updateSelectedMatchPropertyResourceClass(propFormItem);
    }
  }

  // the parameter will be an ApiData object when the input is a link value
  // the parameter will be a PropertyFormItem[] when the input is a child value
  // the parameter will be a string when the input is anything other than the two above
  onValueChanged(value: string | ApiData | PropertyFormItem[]) {
    const propFormItem = this.propertyFormItem;
    if (propFormItem) {
      if (this._isApiData(value)) {
        propFormItem.searchValue = value.iri;
        propFormItem.searchValueLabel = value.label;
      } else {
        propFormItem.searchValue = value;
      }
      this.searchService.updateSearchValue(propFormItem);
    }
  }

  onResourceSearchValueChanged(searchValue: string) {
    const propFormItem = this.propertyFormItem;
    if (propFormItem && propFormItem.selectedProperty) {
      this.searchService.updateResourcesSearchResults({
        value: searchValue,
        objectType: propFormItem.selectedProperty?.objectType,
      });
    }
  }

  onLoadMoreSearchResults(searchValue: string) {
    const propFormItem = this.propertyFormItem;
    if (propFormItem && propFormItem.selectedProperty) {
      this.searchService.loadMoreResourcesSearchResults({
        value: searchValue,
        objectType: propFormItem.selectedProperty?.objectType,
      });
    }
  }

  compareObjects(object1: PropertyData | ApiData, object2: PropertyData | ApiData) {
    return object1 && object2 && object1.iri == object2.iri;
  }

  // Type guard function to check if the value adheres to ApiData interface
  _isApiData(value: any): value is ApiData {
    return value && typeof value === 'object' && 'iri' in value && 'label' in value;
  }
}
