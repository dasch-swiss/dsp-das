import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyData } from '../../../data-access/advanced-search-service/advanced-search.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectChange, MatSelectModule } from '@angular/material/select';
import { PropertyFormValueComponent } from '../property-form-value/property-form-value.component';
import { PropertyFormLinkValueComponent } from '../property-form-link-value/property-form-link-value.component';
import { PropertyFormListValueComponent } from '../property-form-list-value/property-form-list-value.component';
import { Constants } from '@dasch-swiss/dsp-js';
import { PropertyFormItem } from '../../../data-access/advanced-search-store/advanced-search-store.service';

@Component({
    selector: 'dasch-swiss-property-form-link-match-value',
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
    templateUrl: './property-form-link-match-value.component.html',
    styleUrls: ['./property-form-link-match-value.component.scss'],
})
export class PropertyFormLinkMatchValueComponent {
    @Input() propertyFormItem: PropertyFormItem = {
        id: '',
        selectedProperty: undefined,
        selectedOperator: undefined,
        searchValue: undefined,
        operators: [],
        list: undefined,
        isChildProperty: true,
    };

    @Input() properties: PropertyData[] | null = [];
    @Input() propertiesLoading: boolean | null = false;

    @Output() emitSearchValueChanged = new EventEmitter<PropertyFormItem>();

    @ViewChild('operatorsList') operatorsList!: MatSelect;
    @ViewChild('propertyFormValue') propertyFormValueComponent!: PropertyFormValueComponent;

    constants = Constants;

    resourceLabel = { iri: 'resourceLabel', label: 'Resource Label', objectType: this.constants.Label};

    onRemovePropertyFormClicked(propFormItem: PropertyFormItem | null): void {
        // if (propFormItem) {
        //     this.emitRemovePropertyForm.emit(propFormItem);
        // }
    }

    onSelectedPropertyChanged(event: MatSelectChange): void {
        const propFormItem = this.propertyFormItem;
        if (propFormItem) {
            propFormItem.selectedProperty = event.value;

            // this isn't great but we need to reset the value of the input control
            // because the input will not clear itself if the input switches to an input of the same type
            // i.e. from an integer input to a decimal input, the entered integer value will remain in the input
            if(this.propertyFormValueComponent) {
                this.propertyFormValueComponent.inputControl.setValue('');
            }

            // when the selected property changes, we need to reset the selected operator in the UI
            // because the selected operator might not be valid for the new selected property
            if(this.operatorsList) {
                this.operatorsList.value = undefined;
            }

            // this.emitSelectedPropertyChanged.emit(propFormItem);
        }
    }

    onSelectedOperatorChanged(event: MatSelectChange): void {
        // const propFormItem = this.propertyFormItem;
        // if (propFormItem) {
        //     propFormItem.selectedOperator = event.value;

        //     this.emitSelectedOperatorChanged.emit(propFormItem);
        // }
    }
}
