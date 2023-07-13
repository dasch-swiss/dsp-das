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
import { MatIconModule } from '@angular/material/icon';
import { PropertyFormItem } from '../../data-access/advanced-search-store/advanced-search-store.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelect, MatSelectChange, MatSelectModule } from '@angular/material/select';
import { ApiData } from '../../data-access/advanced-search-service/advanced-search.service';

@Component({
    selector: 'dasch-swiss-property-form',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        FormsModule,
        ReactiveFormsModule,
        MatSelectModule,
    ],
    providers: [MatSelect],
    templateUrl: './property-form.component.html',
    styleUrls: ['./property-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyFormComponent {
    @Input() propertyFormItem: PropertyFormItem | null = null;
    @Input() properties: ApiData[] | null = [];

    @Output() emitRemovePropertyForm = new EventEmitter<PropertyFormItem>();
    @Output() emitSelectedProperty = new EventEmitter<PropertyFormItem>();

    @ViewChild('propertiesList') propertiesList!: MatSelect;

    onRemovePropertyFormClicked(propFormItem: PropertyFormItem | null): void {
        if (propFormItem) {
            this.emitRemovePropertyForm.emit(propFormItem);
        }
    }

    onSelectedPropertyChanged(event: MatSelectChange): void {
        const propFormItem = this.propertyFormItem;
        if(propFormItem) {
            propFormItem.selectedProperty = event.value;
            this.emitSelectedProperty.emit(propFormItem);
        }
    }

}
