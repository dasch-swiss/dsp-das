import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import {
    PropertyFormItem,
    SearchItem,
} from '../../data-access/advanced-search-store/advanced-search-store.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    MatSelect,
    MatSelectChange,
    MatSelectModule,
} from '@angular/material/select';
import {
    PropertyData,
    ApiData,
} from '../../data-access/advanced-search-service/advanced-search.service';
import { Operators } from '../../data-access/advanced-search-store/advanced-search-store.service';
import { PropertyFormValueComponent } from './property-form-value/property-form-value.component';
import { PropertyFormLinkValueComponent } from './property-form-link-value/property-form-link-value.component';
import { Constants } from '@dasch-swiss/dsp-js';
import { PropertyFormListValueComponent } from './property-form-list-value/property-form-list-value.component';

@Component({
    selector: 'dasch-swiss-property-form',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatSelectModule,
        PropertyFormValueComponent,
        PropertyFormLinkValueComponent,
        PropertyFormListValueComponent,
    ],
    providers: [MatSelect],
    templateUrl: './property-form.component.html',
    styleUrls: ['./property-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyFormComponent {
    @Input() propertyFormItem: PropertyFormItem = {
        id: '',
        selectedProperty: undefined,
        selectedOperator: undefined,
        searchValue: undefined,
        operators: [],
        list: undefined,
    };

    @Input() resourcesSearchResultsLoading: boolean | null = false;
    @Input() resourcesSearchResultsCount: number | null = 0;
    @Input() resourcesSearchResults: ApiData[] | null = [];

    // this can contain either a list of all properties of an ontology
    // OR
    // a list of properties filtered by a resource class
    @Input() properties: PropertyData[] | null = [];

    @Output() emitRemovePropertyForm = new EventEmitter<PropertyFormItem>();
    @Output() emitPropertyFormItemChanged =
        new EventEmitter<PropertyFormItem>();
    @Output() emitResourceSearchValueChanged = new EventEmitter<SearchItem>();

    @ViewChild('propertiesList') propertiesList!: MatSelect;

    operators = Operators; // in order to use it in the template
    constants = Constants;

    onRemovePropertyFormClicked(propFormItem: PropertyFormItem | null): void {
        if (propFormItem) {
            this.emitRemovePropertyForm.emit(propFormItem);
        }
    }

    onSelectedPropertyChanged(event: MatSelectChange): void {
        const propFormItem = this.propertyFormItem;
        if (propFormItem) {
            propFormItem.selectedProperty = event.value;
            this.emitPropertyFormItemChanged.emit(propFormItem);
        }
    }

    onSelectedOperatorChanged(event: MatSelectChange): void {
        const propFormItem = this.propertyFormItem;
        if (propFormItem) {
            propFormItem.selectedOperator = event.value;

            // reset search value if operator is 'exists' or 'does not exist'
            if (
                propFormItem.selectedOperator === Operators.Exists ||
                propFormItem.selectedOperator === Operators.NotExists
            ) {
                propFormItem.searchValue = undefined;
            }

            this.emitPropertyFormItemChanged.emit(propFormItem);
        }
    }

    onValueChanged(event: string) {
        const propFormItem = this.propertyFormItem;
        if (propFormItem) {
            propFormItem.searchValue = event;
            this.emitPropertyFormItemChanged.emit(propFormItem);
        }
    }

    onResourceSearchValueChanged(event: string) {
        const propFormItem = this.propertyFormItem;
        if (propFormItem && propFormItem.selectedProperty) {
            this.emitResourceSearchValueChanged.emit({
                value: event,
                objectType: propFormItem.selectedProperty?.objectType,
            });
        }
    }
}
