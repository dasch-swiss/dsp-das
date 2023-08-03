import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiData } from '../../../data-access/advanced-search-service/advanced-search.service';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
    selector: 'dasch-swiss-property-form-link-value',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MatInputModule, MatAutocompleteModule],
    templateUrl: './property-form-link-value.component.html',
    styleUrls: ['./property-form-link-value.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
})
export class PropertyFormLinkValueComponent implements OnInit {
    @Input() resourcesSearchResults: ApiData[] | null = null;

    @Output() emitResourceSearchValueChanged = new EventEmitter<string>();
    @Output() emitResourceSelected = new EventEmitter<string>();

    inputControl = new FormControl();

    ngOnInit() {
        this.inputControl.valueChanges
        .pipe(debounceTime(300), distinctUntilChanged())
        .subscribe((value) => {
            this.emitResourceSearchValueChanged.emit(value);
        });
    }

    onResourceSelected(event: MatAutocompleteSelectedEvent) {
        console.log('onResourceSelected: ', event.option.value);
        const data = (event.option.value as ApiData);
        if(data) {
            this.emitResourceSelected.emit(data.iri);
        }
    }

    onInputFocused() {
        this.emitResourceSearchValueChanged.emit(this.inputControl.value);
    }

    /**
     * used in the template to display the label of the selected resource.
     *
     * @param resource the resource containing the label to be displayed (or no selection yet).
     */
    displayResource(resource: ApiData | null): string {
        // null is the initial value (no selection yet)
        if (resource !== null) {
            return resource.label;
        }
        return '';
    }
}
