import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Constants } from '@dasch-swiss/dsp-js';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MatSelectModule } from '@angular/material/select';
@Component({
    selector: 'dasch-swiss-property-form-value',
    standalone: true,
    imports: [CommonModule, MatSelectModule],
    templateUrl: './property-form-value.component.html',
    styleUrls: ['./property-form-value.component.scss'],
})
export class PropertyFormValueComponent {
    @Input() objectType: string = "";
    @Output() emitValueChanged = new EventEmitter<string>();
    private valueChangedSubject = new Subject<string>();
    constants = Constants;

    constructor(){
        this.valueChangedSubject.pipe(debounceTime(300)).subscribe(value => this.emitValueChanged.emit(value));
    }
    handleInputChanged(event: any){
        this.valueChangedSubject.next(event);
    }
}
