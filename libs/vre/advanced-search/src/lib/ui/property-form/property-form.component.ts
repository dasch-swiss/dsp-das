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
    @Output() emitPropertyFormItemChanged = new EventEmitter<PropertyFormItem>();
    @Output() emitResourceSearchValueChanged = new EventEmitter<SearchItem>();
    @Output() emitLoadMoreSearchResults = new EventEmitter<SearchItem>();

    @ViewChild('propertyFormValue') propertyFormValueComponent!: PropertyFormValueComponent;

    operators = Operators; // in order to use it in the template
    constants = Constants;

    resourceLabel = { iri: 'resourceLabel', label: 'Resource Label', objectType: this.constants.Label};

    onRemovePropertyFormClicked(propFormItem: PropertyFormItem | null): void {
        if (propFormItem) {
            this.emitRemovePropertyForm.emit(propFormItem);
        }
    }

    onSelectedPropertyChanged(event: MatSelectChange): void {
        const propFormItem = this.propertyFormItem;
        if (propFormItem) {
            propFormItem.selectedProperty = event.value;

            // reset search value because it might be invalid for the newly selected property
            propFormItem.searchValue = undefined;

            // this isn't great but we need to reset the value of the input control
            // because the input will not clear itself if the input switches to an input of the same type
            // i.e. from an integer input to a decimal input, the entered integer value will remain in the input
            if(this.propertyFormValueComponent) {
                this.propertyFormValueComponent.inputControl.setValue('');
            }
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

    onValueChanged(value: string) {
        const propFormItem = this.propertyFormItem;
        if (propFormItem) {
            propFormItem.searchValue = value;
            this.emitPropertyFormItemChanged.emit(propFormItem);
        }
    }

    onResourceSearchValueChanged(searchValue: string) {
        const propFormItem = this.propertyFormItem;
        if (propFormItem && propFormItem.selectedProperty) {
            this.emitResourceSearchValueChanged.emit({
                value: searchValue,
                objectType: propFormItem.selectedProperty?.objectType,
            });
        }
    }

    onLoadMoreSearchResults(searchValue: string) {
        const propFormItem = this.propertyFormItem;
        if (propFormItem && propFormItem.selectedProperty) {
            this.emitLoadMoreSearchResults.emit({
                value: searchValue,
                objectType: propFormItem.selectedProperty?.objectType,
            });
        }
    }
}
