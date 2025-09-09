import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Constants } from '@dasch-swiss/dsp-js';
import { ApiData, PropertyData, PropertyFormItem } from '../../model';
import { Operators } from '../../service/operators.config';
import { PropertyFormManager } from '../../service/property-form.manager';
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
  templateUrl: './property-form.component.html',
  styleUrls: ['./property-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyFormComponent {
  private _searchService = inject(SearchStateService);
  private _formManager = inject(PropertyFormManager);

  @Input() propertyFormItem: PropertyFormItem = {
    id: '',
    selectedProperty: undefined,
    selectedOperator: undefined,
    searchValue: undefined,
    operators: [],
    list: undefined,
  };

  // Observables from the service
  filteredProperties$ = this._searchService.filteredProperties$;
  propertiesLoading$ = this._searchService.propertiesLoading$;
  matchResourceClassesLoading$ = this._searchService.matchResourceClassesLoading$;

  operators = Operators;
  constants = Constants;

  onSelectedPropertyChanged(event: MatSelectChange): void {
    this.propertyFormItem.selectedProperty = event.value;
    // Reset dependent fields when property changes
    this.propertyFormItem.selectedOperator = undefined;
    this.propertyFormItem.searchValue = undefined;
    this.propertyFormItem.selectedMatchPropertyResourceClass = undefined;

    const currentState = this._searchService.currentState;
    const updates = this._formManager.updatePropertyFormItem(
      currentState, 
      this.propertyFormItem,
      (property) => {
        // Handle list loaded callback
        this._searchService.patchState({ propertyFormList: currentState.propertyFormList });
      },
      (error) => {
        console.error('Error updating property:', error);
      }
    );
    
    if (updates && typeof updates === 'object' && 'propertyFormList' in updates) {
      this._searchService.patchState(updates);
    }
  }

  onSelectedOperatorChanged(event: MatSelectChange): void {
    const propFormItem = this.propertyFormItem;
    if (propFormItem) {
      propFormItem.selectedOperator = event.value;
      const currentState = this._searchService.currentState;
      this._formManager.updateSelectedOperatorForProperty(currentState, propFormItem).subscribe({
        next: (updates) => {
          if (updates) {
            this._searchService.patchState(updates);
          }
        },
        error: (error) => {
          console.error('Error updating operator:', error);
        }
      });
    }
  }

  onSelectedMatchPropertyResourceClassChanged(event: MatSelectChange): void {
    const propFormItem = this.propertyFormItem;
    if (propFormItem) {
      propFormItem.selectedMatchPropertyResourceClass = event.value;
      const currentState = this._searchService.currentState;
      this._formManager.updateSelectedMatchPropertyResourceClass(currentState, propFormItem).subscribe({
        next: (updates) => {
          if (updates) {
            this._searchService.patchState(updates);
          }
        },
        error: (error) => {
          console.error('Error updating match property resource class:', error);
        }
      });
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
      const currentState = this._searchService.currentState;
      const updates = this._formManager.updateSearchValueForProperty(currentState, propFormItem);
      this._searchService.patchState(updates);
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
