import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Constants } from '@dasch-swiss/dsp-js';
import {
  ApiData,
  PropertyData,
  ResourceLabelObject,
} from '../../../data-access/advanced-search-service/advanced-search.service';
import {
  ParentChildPropertyPair,
  PropertyFormItem,
  SearchItem,
} from '../../../data-access/advanced-search-store/advanced-search-store.service';
import { PropertyFormLinkValueComponent } from '../property-form-link-value/property-form-link-value.component';
import { PropertyFormListValueComponent } from '../property-form-list-value/property-form-list-value.component';
import { PropertyFormValueComponent } from '../property-form-value/property-form-value.component';

@Component({
  selector: 'app-property-form-subcriteria',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    PropertyFormValueComponent,
    PropertyFormListValueComponent,
    PropertyFormLinkValueComponent,
  ],
  templateUrl: './property-form-subcriteria.component.html',
  styleUrls: ['./property-form-subcriteria.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyFormSubcriteriaComponent {
  @Input() parentProperty: PropertyFormItem | null = null;
  @Input() childProperties: PropertyFormItem[] = [];
  @Input() resourcesSearchResultsLoading: boolean | null = false;
  @Input() resourcesSearchResultsCount: number | null = 0;
  @Input() resourcesSearchResults: ApiData[] | null = [];
  @Input() resourcesSearchNoResults: boolean | null = false;

  @Output() emitAddChildPropertyForm = new EventEmitter<PropertyFormItem>();
  @Output() emitRemoveChildPropertyForm = new EventEmitter<ParentChildPropertyPair>();
  @Output() emitChildSelectedPropertyChanged = new EventEmitter<ParentChildPropertyPair>();
  @Output() emitChildSelectedOperatorChanged = new EventEmitter<ParentChildPropertyPair>();
  @Output() emitChildValueChanged = new EventEmitter<ParentChildPropertyPair>();
  @Output() emitResourceSearchValueChanged = new EventEmitter<SearchItem>();
  @Output() emitLoadMoreSearchResults = new EventEmitter<SearchItem>();

  constants = Constants;
  resourceLabelObj = ResourceLabelObject;

  onAddSubcriteria(): void {
    if (this.parentProperty) {
      console.log(this.parentProperty);
      this.emitAddChildPropertyForm.emit(this.parentProperty);
    }
  }

  onRemoveSubcriteria(childProperty: PropertyFormItem): void {
    if (this.parentProperty) {
      this.emitRemoveChildPropertyForm.emit({
        parentProperty: this.parentProperty,
        childProperty,
      });
    }
  }

  onChildPropertySelectionChange(childProperty: PropertyFormItem, selectedProperty: PropertyData): void {
    if (this.parentProperty) {
      const updatedChildProperty = { ...childProperty, selectedProperty };
      this.emitChildSelectedPropertyChanged.emit({
        parentProperty: this.parentProperty,
        childProperty: updatedChildProperty,
      });
    }
  }

  onChildOperatorSelectionChange(childProperty: PropertyFormItem, selectedOperator: string): void {
    if (this.parentProperty) {
      const updatedChildProperty = { ...childProperty, selectedOperator };
      this.emitChildSelectedOperatorChanged.emit({
        parentProperty: this.parentProperty,
        childProperty: updatedChildProperty,
      });
    }
  }

  onChildValueChange(childProperty: PropertyFormItem, searchValue: string | ApiData): void {
    if (this.parentProperty) {
      let updatedChildProperty: PropertyFormItem;

      if (this._isApiData(searchValue)) {
        // If it's an ApiData object, extract iri and label
        updatedChildProperty = {
          ...childProperty,
          searchValue: searchValue.iri,
          searchValueLabel: searchValue.label,
        };
      } else {
        // If it's a string, use directly
        updatedChildProperty = { ...childProperty, searchValue };
      }

      this.emitChildValueChanged.emit({
        parentProperty: this.parentProperty,
        childProperty: updatedChildProperty,
      });
    }
  }

  onResourceSearchValueChanged(searchItem: SearchItem): void {
    this.emitResourceSearchValueChanged.emit(searchItem);
  }

  onLoadMoreSearchResults(searchItem: SearchItem): void {
    this.emitLoadMoreSearchResults.emit(searchItem);
  }

  compareObjects(object1: PropertyData | ApiData, object2: PropertyData | ApiData) {
    return object1 && object2 && object1.iri == object2.iri;
  }

  // Type guard function to check if the value adheres to ApiData interface
  private _isApiData(value: any): value is ApiData {
    return value && typeof value === 'object' && 'iri' in value && 'label' in value;
  }
}
