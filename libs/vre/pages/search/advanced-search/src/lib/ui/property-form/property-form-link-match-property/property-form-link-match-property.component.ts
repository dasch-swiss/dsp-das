import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { Constants } from '@dasch-swiss/dsp-js';
import { ApiData, PropertyData, PropertyFormItem, SearchItem } from '../../../model';
import { Operator } from '../../../service/operators.config';
import { PropertyFormLinkValueComponent } from '../property-form-link-value/property-form-link-value.component';
import { PropertyFormListValueComponent } from '../property-form-list-value/property-form-list-value.component';
import { PropertyFormValueComponent } from '../property-form-value/property-form-value.component';

@Component({
  selector: 'app-property-form-link-match-property',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    PropertyFormValueComponent,
    PropertyFormListValueComponent,
    PropertyFormLinkValueComponent,
  ],
  templateUrl: './property-form-link-match-property.component.html',
  styleUrls: ['./property-form-link-match-property.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyFormLinkMatchPropertyComponent {
  @Input() values: PropertyFormItem[] = [];
  @Input() properties: PropertyData[] | undefined = [];
  @Input() resourcesSearchResultsLoading: boolean | null = false;
  @Input() resourcesSearchResultsCount: number | null = 0;
  @Input() resourcesSearchResults: ApiData[] | null = [];
  @Input() resourcesSearchNoResults: boolean | null = false;

  @Output() emitRemovePropertyForm = new EventEmitter<PropertyFormItem>();
  @Output() emitSelectedPropertyChanged = new EventEmitter<PropertyFormItem>();
  @Output() emitSelectedOperatorChanged = new EventEmitter<PropertyFormItem>();
  @Output() emitValueChanged = new EventEmitter<PropertyFormItem>();
  @Output() emitResourceSearchValueChanged = new EventEmitter<SearchItem>();
  @Output() emitLoadMoreSearchResults = new EventEmitter<SearchItem>();

  operators = Operator;
  constants = Constants;

  onRemovePropertyFormClicked(propFormItem: PropertyFormItem): void {
    this.emitRemovePropertyForm.emit(propFormItem);
  }

  onSelectedPropertyChanged(event: MatSelectChange, index: number): void {
    this.values[index].selectedProperty = event.value;
    this.values[index].selectedOperator = undefined;
    this.emitSelectedPropertyChanged.emit(this.values[index]);
  }

  onSelectedOperatorChanged(event: MatSelectChange, index: number): void {
    this.values[index].selectedOperator = event.value;
    this.emitSelectedOperatorChanged.emit(this.values[index]);
  }

  onValueChanged(value: string | ApiData, index: number): void {
    if (this._isApiData(value)) {
      this.values[index].searchValue = value.iri;
      this.values[index].searchValueLabel = value.label;
    } else {
      this.values[index].searchValue = value;
    }
    this.emitValueChanged.emit(this.values[index]);
  }

  onResourceSearchValueChanged(value: string, index: number): void {
    const objectType = this.values[index].selectedProperty?.objectType;
    if (objectType) {
      this.emitResourceSearchValueChanged.emit({
        value,
        objectType,
      });
    }
  }

  onLoadMoreSearchResults(value: string, index: number): void {
    const objectType = this.values[index].selectedProperty?.objectType;
    if (objectType) {
      this.emitLoadMoreSearchResults.emit({
        value,
        objectType,
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
