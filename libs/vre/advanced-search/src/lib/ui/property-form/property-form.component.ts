import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { PropertyFormItem } from '../../data-access/advanced-search-store/advanced-search-store.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelect, MatSelectChange, MatSelectModule } from '@angular/material/select';
import { PropertyData } from '../../data-access/advanced-search-service/advanced-search.service';
import { Constants } from '@dasch-swiss/dsp-js';
import { debounceTime } from 'rxjs/operators';

// maybe move this somewhere else
export enum Operators {
    Equals = 'equals',
    NotEquals = 'does not equal',
    Exists = 'exists',
    NotExists = 'does not exist',
    GreaterThan = 'greater than',
    GreaterThanEquals = 'greater than or equal to',
    LessThan = 'less than',
    LessThanEquals = 'less than or equal to',
    IsLike = 'is like',
    Matches = 'matches',
}

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
    ],
    providers: [MatSelect],
    templateUrl: './property-form.component.html',
    styleUrls: ['./property-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyFormComponent implements OnInit {
    @Input() propertyFormItem: PropertyFormItem = { id: '', selectedProperty: undefined, selectedOperator: undefined, searchValue: undefined };

    // this can contain either a list of all properties of an ontology
    // OR
    // a list of properties filtered by a resource class
    @Input() properties: PropertyData[] = [];

    @Output() emitRemovePropertyForm = new EventEmitter<PropertyFormItem>();
    @Output() emitPropertyFormItemChanged = new EventEmitter<PropertyFormItem>();

    @ViewChild('propertiesList') propertiesList!: MatSelect;

    filteredOperators: string[] = [];
    operators = Operators; // in order to use it in the template
    inputControl = new FormControl();

    ngOnInit(): void {
        this.inputControl.valueChanges
        .pipe(debounceTime(300))
        .subscribe((value) => {
            const propFormItem = this.propertyFormItem;
            if(propFormItem) {
                propFormItem.searchValue = value;
                this.emitPropertyFormItemChanged.emit(propFormItem);
            }
        });
    }

    onRemovePropertyFormClicked(propFormItem: PropertyFormItem | null): void {
        if (propFormItem) {
            this.emitRemovePropertyForm.emit(propFormItem);
        }
    }

    onSelectedPropertyChanged(event: MatSelectChange): void {
        const propFormItem = this.propertyFormItem;
        if(propFormItem) {
            propFormItem.selectedProperty = event.value;
            const objectType = propFormItem.selectedProperty?.objectType;
            if(objectType) {
                // filter available operators based on the object type of the selected property
                this.filteredOperators = Array.from(this.getOperators().entries())
                .filter(([_, values]) => values.includes(objectType))
                .map(([key, _]) => key);

                // if there are no matching operators in the map it means it's a link property
                // i.e. http://0.0.0.0:3333/ontology/0801/newton/v2#letter
                if(!this.filteredOperators.length) {
                    this.filteredOperators = [
                        Operators.Equals,
                        Operators.NotEquals,
                        Operators.Exists,
                        Operators.NotExists,
                        Operators.Matches, // apparently this is only available at the top level but idk what that means right now
                    ];
                }
            }

            this.emitPropertyFormItemChanged.emit(propFormItem);
        }
    }

    onSelectedOperatorChanged(event: MatSelectChange): void {
        const propFormItem = this.propertyFormItem;
        if(propFormItem) {
            propFormItem.selectedOperator = event.value;

            // reset search value if operator is 'exists' or 'does not exist'
            if(propFormItem.selectedOperator === Operators.Exists ||
                propFormItem.selectedOperator === Operators.NotExists) {
                    // this causes the form control to emit a value change event as well
                    // which isn't exactly ideal but it emits the same thing as this method so it's fine
                    this.inputControl.setValue(undefined);
                    propFormItem.searchValue = undefined;
            }

            this.emitPropertyFormItemChanged.emit(propFormItem);
        }
    }

    // key: operator, value: allowed object types
    getOperators(): Map<string, string[]> {
        return new Map([
            [Operators.Equals, [Constants.TextValue, Constants.UriValue]],
            [Operators.NotEquals, [Constants.TextValue, Constants.UriValue]],
            [Operators.Exists, [Constants.TextValue, Constants.UriValue]],
            [Operators.NotExists, [Constants.TextValue, Constants.UriValue]],
            [Operators.GreaterThan, [Constants.IntValue, Constants.DecimalValue]],
            [Operators.GreaterThanEquals, [Constants.IntValue, Constants.DecimalValue]],
            [Operators.LessThan, [Constants.IntValue, Constants.DecimalValue]],
            [Operators.LessThanEquals, [Constants.IntValue, Constants.DecimalValue]],
            [Operators.IsLike, [Constants.TextValue]],
            [Operators.Matches, [Constants.TextValue]],
        ]);
    }

}
