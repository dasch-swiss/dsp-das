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
import { AdvancedSearchDataService } from '../../service/advanced-search-data.service';
import { EXISTENCE_OPS, Operator } from '../../service/operators.config';
import { PropertyFormManager } from '../../service/property-form.manager';
import { SearchStateService } from '../../service/search-state.service';
import { PropertyFormLinkMatchPropertyComponent } from './property-form-link-match-property/property-form-link-match-property.component';
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
    PropertyFormLinkMatchPropertyComponent,
  ],
  templateUrl: './property-form.component.html',
  styleUrls: ['./property-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyFormComponent {
  @Input() propertyFormItem: PropertyFormItem = new PropertyFormItem();

  private _dataService = inject(AdvancedSearchDataService);
  private _formManager = inject(PropertyFormManager);

  properties$ = this._dataService.availableProperties$;

  operators = Operator;
  constants = Constants;

  existanceOps = EXISTENCE_OPS;

  onSelectedPropertyChanged(event: MatSelectChange): void {
    this._formManager.onPropertySelectionChanged(this.propertyFormItem, event.value);
  }

  onSelectedOperatorChanged(event: MatSelectChange): void {
    this._formManager.onOperatorSelectionChanged(this.propertyFormItem, event.value);
  }

  onSelectedMatchPropertyResourceClassChanged(event: MatSelectChange): void {
    this._formManager.onMatchPropertyResourceClassChanged(this.propertyFormItem, event.value);
  }

  onValueChanged(value: string | ApiData) {
    this._formManager.onSearchValueChanged(this.propertyFormItem, value);
  }

  compareObjects(object1: PropertyData | ApiData, object2: PropertyData | ApiData) {
    return object1 && object2 && object1.iri == object2.iri;
  }
}
