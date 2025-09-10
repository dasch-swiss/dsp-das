import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Constants } from '@dasch-swiss/dsp-js';
import { ApiData, PropertyData, PropertyFormItem } from '../../../model';
import { Operators } from '../../../service/operators.config';
import { PropertyFormManager } from '../../../service/property-form.manager';
import { SearchStateService } from '../../../service/search-state.service';
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
  @Input({ required: true }) parentProperty!: PropertyFormItem;

  private searchService = inject(SearchStateService);
  private formManager = inject(PropertyFormManager);
  get childProperties(): PropertyFormItem[] {
    return Array.isArray(this.parentProperty.searchValue) ? this.parentProperty.searchValue : [];
  }

  constants = Constants;

  onAddSubcriteria(): void {
    this.formManager.addChildPropertyFormList(this.parentProperty);
  }

  onRemoveSubcriteria(childProperty: PropertyFormItem): void {
    this.searchService.deleteChildPropertyFormList({
      parentProperty: this.parentProperty,
      childProperty,
    });
  }

  onChildPropertySelectionChange(childProperty: PropertyFormItem, selectedProperty: PropertyData): void {
    childProperty.selectedProperty = selectedProperty;
    this.parentProperty.updateChildProperty(childProperty.selectedProperty);
    this.formManager.updateChildProperty(childProperty, this.parentProperty);
  }

  onChildOperatorSelectionChange(childProperty: PropertyFormItem, selectedOperator: Operators): void {
    childProperty.selectedOperator = selectedOperator;
    this.formManager.updateChildSelectedOperator({
      parentProperty: this.parentProperty,
      childProperty,
    });
  }

  onChildValueChange(childProperty: PropertyFormItem, searchValue: string | ApiData): void {
    if (this._isApiData(searchValue)) {
      // If it's an ApiData object, extract iri and label
      childProperty.searchValue = searchValue.iri;
      childProperty.searchValueLabel = searchValue.label;
    } else {
      // If it's a string, use directly
      childProperty.searchValue = searchValue;
    }

    this.searchService.updateChildSearchValue({
      parentProperty: this.parentProperty,
      childProperty,
    });
  }

  compareObjects(object1: PropertyData | ApiData, object2: PropertyData | ApiData) {
    return object1 && object2 && object1.iri == object2.iri;
  }

  // Type guard function to check if the value adheres to ApiData interface
  private _isApiData(value: any): value is ApiData {
    return value && typeof value === 'object' && 'iri' in value && 'label' in value;
  }
}
