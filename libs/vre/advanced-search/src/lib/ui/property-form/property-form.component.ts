import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { PropertyFormItem } from '../../data-access/advanced-search-store/advanced-search-store.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelect, MatSelectChange, MatSelectModule } from '@angular/material/select';
import { PropertyData } from '../../data-access/advanced-search-service/advanced-search.service';
import { Operators } from '../../data-access/advanced-search-store/advanced-search-store.service';
import { PropertyFormValueComponent } from './property-form-value/property-form-value.component';

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
        PropertyFormValueComponent
    ],
    providers: [MatSelect,],
    templateUrl: './property-form.component.html',
    styleUrls: ['./property-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyFormComponent {
    @Input() propertyFormItem: PropertyFormItem = { id: '', selectedProperty: undefined, selectedOperator: undefined, searchValue: undefined, operators: []};

    // this can contain either a list of all properties of an ontology
    // OR
    // a list of properties filtered by a resource class
    @Input() properties: PropertyData[] | null = [];
    @Output() emitRemovePropertyForm = new EventEmitter<PropertyFormItem>();
    @Output() emitPropertyFormItemChanged = new EventEmitter<PropertyFormItem>();

    @ViewChild('propertiesList') propertiesList!: MatSelect;

    operators = Operators; // in order to use it in the template

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
            if (propFormItem.selectedOperator === Operators.Exists ||
                propFormItem.selectedOperator === Operators.NotExists) {
                // this causes the form control to emit a value change event as well
                // which isn't exactly ideal but it emits the same thing as this method so it's fine
                //this.inputControl.setValue(undefined);
                propFormItem.searchValue = undefined;
            }

            this.emitPropertyFormItemChanged.emit(propFormItem);
        }
    }

    handleValueChanged(event: string){
        console.log(event);
    }

}
