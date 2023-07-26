import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Constants } from '@dasch-swiss/dsp-js';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { PropertyFormLinkValueComponent } from '../property-form-link-value/property-form-link-value.component';
@Component({
    selector: 'dasch-swiss-property-form-value',
    standalone: true,
    imports: [CommonModule, MatInputModule, MatSelectModule, FormsModule, ReactiveFormsModule, PropertyFormLinkValueComponent],
    templateUrl: './property-form-value.component.html',
    styleUrls: ['./property-form-value.component.scss'],
})
export class PropertyFormValueComponent {
    @Input() objectType: string | undefined = '';

    @Output() emitValueChanged = new EventEmitter<string>();

    private valueChangedSubject = new Subject<string>();

    constants = Constants;

    constructor() {
        this.valueChangedSubject
            .pipe(debounceTime(300))
            .subscribe((value) => this.emitValueChanged.emit(value));
    }

    handleInputChanged(event: any) {
        const inputElement = event.target as HTMLInputElement;
        if(inputElement) {
            this.valueChangedSubject.next(inputElement.value);
        } else {
            this.emitValueChanged.emit(event.value)
        }
    }

}
